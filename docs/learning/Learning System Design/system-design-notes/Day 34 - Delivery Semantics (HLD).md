# Day 34 — Delivery Semantics (HLD)

## What we're learning today
Day 24 (idempotency) and Day 28 (Kafka) both quietly relied on "at-least-once" delivery without naming it as a formal category. Today makes the three delivery semantics explicit — this is vocabulary you've needed since Day 24 and will keep needing through every applied design ([[04-design-notification-system]], [[05-design-job-scheduler]]) that promises "effectively-once" behavior.

## Core concept
**Delivery semantics** describe the guarantee a messaging system makes about how many times a message is delivered relative to how many times it was sent: **at-most-once** (0 or 1), **at-least-once** (1 or more), or **exactly-once** (always exactly 1). Only the first two are achievable as honest infrastructure guarantees; "exactly-once" in practice means at-least-once delivery plus idempotent processing.

## Visual diagram
```
At-most-once:  send -> [network drop] -> never delivered. No retry. Simple, lossy.
At-least-once: send -> [network drop] -> retry -> delivered (maybe twice if ack was lost, not the message)
Exactly-once:  the *outcome* looks like exactly 1 effect, achieved via
               at-least-once delivery + idempotent handler (dedup on retry)
               NOT via a magic "deliver once" network guarantee (doesn't exist)
```

## Explanation
- **At-most-once:** fire and forget, no retry on failure. Simplest, but silently loses messages on any transient failure. Rarely the right default — acceptable only when losing an occasional message is truly harmless (e.g. a non-critical metrics ping).
- **At-least-once:** retry until acknowledged. Guarantees delivery, but the *ack itself* can be lost (message delivered fine, ack lost in transit) — the sender retries a message the receiver already processed, causing a duplicate. This is what Kafka (Day 28), SQS, and most real message brokers actually guarantee.
- **Why "exactly-once" as a network-level guarantee doesn't really exist:** achieving it would require the sender and receiver to agree, atomically, that a message was received exactly one time — but the ack itself travels over the same unreliable network the message did, so you can always construct a scenario where the ack is lost and the sender can't distinguish "message lost" from "message processed, ack lost." There's no way to close that gap with messaging infrastructure alone.
- **The real answer: at-least-once + idempotency = "effectively-once."** This is exactly what [[Day 24 - Idempotency Keys (LLD)|Day 24]] solved: let duplicates arrive (at-least-once), but make the *handler* safe to run twice by keying on an idempotency key. The system-level *outcome* looks exactly-once even though the *delivery* wasn't.
- **This is why [[05-design-job-scheduler]] says "effectively-once," not "exactly-once"** — same underlying limitation, applied to job execution instead of message delivery: the lock prevents concurrent double-execution, but a crash-and-retry after partial completion still needs the job handler itself to be idempotent.

## Real-world examples
- **Kafka:** at-least-once by default (consumer commits offset after processing — a crash between processing and committing causes reprocessing). Kafka's "exactly-once semantics" (transactional producers/consumers, introduced later) is a real, harder engineering feature — but even it works by making the effects idempotent/transactional across the pipeline, not by inventing a lossless ack.
- **SQS standard queues:** at-least-once, explicitly documented as capable of duplicate delivery — this is why AWS's own docs tell you to design consumers to be idempotent, not to expect exactly-once.
- **HTTP `PUT` vs `POST`:** a classic idempotency-by-design example — `PUT /users/5 {name: "Jai"}` retried twice has the same end state either time; `POST /users {name: "Jai"}` retried twice can create two users. The delivery semantics don't change; the handler's idempotency does.

## Interview perspective
Weak candidates say "we guarantee exactly-once delivery" as if it's a solved infrastructure problem. Strong candidates say "at-least-once delivery, with an idempotency key so duplicate processing is safe" — naming both halves, and explicitly rejecting "exactly-once" as an overclaim. This is one of the more common places senior candidates lose credibility by promising something the underlying systems (Kafka, SQS, HTTP) don't actually provide.

## Trade-offs
| | At-most-once | At-least-once | "Exactly-once" (effectively-once) |
|---|---|---|---|
| Can lose messages | Yes | No | No |
| Can duplicate | No | Yes | No (duplicates absorbed by idempotent handler) |
| Implementation cost | Lowest | Low (just retry) | Higher — requires idempotency key + dedup storage |
| Right default for | Non-critical telemetry | Most systems | Anything where duplicate side effects are unacceptable (payments, notifications) |

## Interview question
"Your payment service uses at-least-once delivery from the message queue. A 'charge_card' message gets delivered twice due to an ack that was lost. What prevents the customer from being charged twice?"

> [!question]- Think it through, then expand
> Where does the actual protection live — in the queue, or somewhere else?

> [!success]- Answer
> Nothing in the queue itself prevents the double charge — at-least-once delivery *guarantees* this scenario can happen. The protection has to live in the payment handler: each `charge_card` message carries an idempotency key (e.g. a unique payment intent ID), and the handler checks "have I already processed this key?" before charging — if yes, it returns the cached result instead of charging again. This is Day 24's idempotency key pattern, and it's the *only* correct place to solve this problem; trying to solve it by asking the queue for a stronger delivery guarantee is solving it in the wrong layer.

## Key design principle
**Don't promise exactly-once delivery — promise at-least-once delivery plus an idempotent handler, and be explicit that the "exactly-once" outcome is achieved at the application layer, not the transport layer.**

## 30-second challenge
[[04-design-notification-system]] chose at-least-once + idempotency for push notifications. Why would at-most-once be a worse choice there, even though it's simpler?

## Tomorrow
Day 35 (LLD) — Bloom Filters: a concrete data structure often used *inside* the dedup/idempotency-check step discussed today, to cheaply answer "have I possibly seen this key before?" without storing every key seen.
