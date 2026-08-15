# Day 27 — Message Queues Deep Dive: Kafka vs RabbitMQ vs SQS (HLD)

<small>6 min read</small>

## What we're learning today
Your Notification Service (Day 7-8) used "a queue" abstractly. Today: the real differences between the three you'll be asked to choose between in interviews.

## Core concept
Queues decouple producers from consumers (Day 7's core idea) — but *how* they store, order, and deliver messages differs fundamentally between a **log** (Kafka) and a **traditional queue** (RabbitMQ/SQS).

## Visual diagram
```
KAFKA (log-based, partitioned):
Partition 0: [msg1][msg2][msg3][msg4] <- consumers track their own offset
Partition 1: [msg1][msg2][msg3]
  Consumer Group A: reads from wherever it left off, can REPLAY

RABBITMQ / SQS (queue-based):
[msg1][msg2][msg3] -> consumer pulls -> msg DELETED once acked
  No replay. Message is gone after consumption.
```

## Explanation
- **Kafka:** messages persist in an ordered, append-only log (literally the WAL pattern from Day 20) partitioned by key. Consumers track their own **offset** — they can replay from any point, and multiple consumer groups can independently read the same data at different speeds. **Ordering guarantee: only within a single partition**, not across the whole topic — this is why partition key choice matters as much as shard key choice (Day 21).
- **RabbitMQ:** a traditional broker with routing (exchanges, bindings) — a message is delivered and removed. Great for complex routing logic (route by message type/priority) but no replay, and ordering guarantees are weaker once you have multiple consumers on one queue.
- **SQS:** fully managed, simplest mental model — Standard queues are at-least-once with **no ordering guarantee**; FIFO queues add ordering + exactly-once, at a lower throughput ceiling. No replay ability once a message is deleted after processing.
- **When ordering matters, pick your partition/queue key carefully** — same lesson as sharding (Day 21): all messages for the *same entity* (e.g., one user's events) must go to the same Kafka partition to preserve per-entity order.

## Real-world examples
- **Uber's trip event pipeline:** Kafka — needs replay for analytics/ML training pipelines built later, and ordering-per-driver matters for state machines (trip requested → accepted → started → completed).
- **Order fulfillment at Amazon-scale e-commerce:** SQS/RabbitMQ style — each order processed once, no need to replay history, simpler operational model.
- **Your Notification Service (Day 7):** SQS-style is usually sufficient — you don't need to replay "send this notification" after it's sent; Kafka would be overkill unless you also want an event-sourced audit log of every notification ever triggered.

## Interview perspective
Interviewers use this to test whether you pick infrastructure based on **actual requirements** (replay? ordering? throughput? operational complexity you're willing to own) rather than reflexively saying "Kafka" because it's the trendiest answer. Justifying *why not* Kafka is often more impressive than justifying why.

## Trade-offs
| | Kafka | RabbitMQ | SQS |
|---|---|---|---|
| Replay | Yes | No | No |
| Ordering | Per-partition | Per-queue (weaker with multiple consumers) | FIFO variant only |
| Throughput | Very high | Medium | High (Standard), lower (FIFO) |
| Operational complexity | High (self-managed clusters, ZooKeeper/KRaft) | Medium | None (fully managed) |
| Routing logic | Basic (topic/partition) | Rich (exchanges/bindings) | Basic |

## Interview question
"Design the event pipeline for Uber's driver location updates (millions of updates/sec) feeding both real-time ETA calculation AND a nightly analytics job. Which message queue, and why does 'replay' matter here specifically?"

> [!question]- Think it through, then expand
> Two consumers need the same data at very different paces — what does a traditional delete-on-consume queue do to the second one?

> [!success]- Answer
> Kafka. The real-time ETA consumer and the nightly analytics job both need to read the *same* stream of location events, but at completely different paces and schedules — a traditional queue (RabbitMQ/SQS) deletes a message once consumed, so whichever consumer reads it first would starve the other. Kafka's log-based model lets both consumer groups independently track their own offset and read the full log at their own pace — the real-time consumer stays near the head, the nightly job can replay the entire day's events from the beginning, without either interfering with the other.

## Key design principle
**Choose the queue based on whether you need replay and strict ordering — not based on which one is most talked about.**

## 30-second challenge
Your Rate Limiter (Day 5) needs to log every "request denied" event to a downstream analytics system. Does this need Kafka's replay capability, or is SQS/RabbitMQ sufficient? Justify in one sentence.

## Scenario Practice

**Scenario 1:** An order-processing queue needs messages for the same order ID to be processed in the exact order they were produced (create → update → cancel, never out of order), but the system also needs to scale to many parallel consumers. Can you have both?

> [!question]- Think it through, then expand
> Does ordering have to be global across the entire queue, or can it be scoped to something narrower?

> [!success]- Answer
> Yes, with the right partitioning: ordering only needs to be guaranteed *within* a partition, not globally across the whole queue. If every message for a given order ID is routed to the same partition (keyed by order ID, similar in spirit to a shard key from [Day 21 - Database Sharding and Partitioning (HLD)](Day 21 - Database Sharding and Partitioning (HLD).md)), then a single consumer processing that partition sees strict ordering for that order, while many partitions are still processed in parallel by many consumers for overall throughput. What you give up is global ordering across *different* order IDs, which is almost never actually required — this is exactly the kind of trade-off worth naming explicitly per this day's key design principle.

**Scenario 2:** A consumer crashes after processing a message but before acknowledging it. The message gets redelivered and processed twice. Whose responsibility is it to prevent the duplicate side effect, and why can't the queue itself just guarantee exactly-once?

> [!question]- Think it through, then expand
> This is the same conclusion [Day 34 - Delivery Semantics (HLD)](Day 34 - Delivery Semantics (HLD).md) reaches — what's the queue actually able to guarantee, and what has to happen downstream of it?

> [!success]- Answer
> The queue can only guarantee at-least-once delivery in this failure mode — it has no way to know whether the consumer's side effect (charging a card, sending an email) already happened before the crash, so redelivering is the only safe default; silently dropping the message on the chance it was already processed risks losing it entirely. Preventing the duplicate *effect* is the consumer's responsibility, via an idempotent handler (per [Day 24 - Idempotency Keys (LLD)](Day 24 - Idempotency Keys (LLD).md)) — check whether this message's unique ID has already been processed before acting on it again. "Exactly-once" as an outcome is achieved at the application layer by combining at-least-once delivery with idempotent processing, not by the transport layer alone.

## Tomorrow

Day 28 (LLD) — designing a Kafka producer/consumer with partition-key strategy and delivery guarantee trade-offs (at-least-once vs exactly-once).
