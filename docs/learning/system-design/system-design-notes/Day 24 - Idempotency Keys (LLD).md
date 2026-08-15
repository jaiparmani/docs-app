# Day 24 — Idempotency Keys (LLD)

<small>3 min read</small>

## What we're learning today
Direct consequence of Day 23: if your system favors availability, clients *will* retry timed-out requests. Without idempotency, a retried "charge $50" becomes "charge $100."

## Core concept
**Idempotency:** performing the same operation multiple times has the same effect as performing it once. An **idempotency key** is a client-generated unique token attached to a request so the server can detect and safely ignore duplicates.

## Visual diagram
```
Client generates key: "idem-key-abc123"

Request 1: POST /charge {key: abc123, amount: 50}
   Server: not seen before -> process -> store result keyed by abc123 -> return result

[Network blip, client doesn't get response, retries]

Request 2 (retry): POST /charge {key: abc123, amount: 50}
   Server: seen abc123 before -> return STORED result, do NOT re-charge
```

## Explanation
```java
class IdempotencyInterceptor {
    private final Cache<String, StoredResponse> idempotencyStore; // Redis, Day 11

    Response handle(String idempotencyKey, Request request, Handler next) {
        StoredResponse existing = idempotencyStore.get(idempotencyKey);
        if (existing != null) {
            return existing.response; // duplicate — return cached result, don't re-execute
        }

        // Use a distributed lock (Day 30 preview) to prevent two concurrent
        // retries from both passing the check above simultaneously
        boolean locked = lockService.tryLock(idempotencyKey, LOCK_TTL);
        if (!locked) throw new ConcurrentRequestException();

        try {
            Response response = next.process(request);
            idempotencyStore.put(idempotencyKey, new StoredResponse(response), TTL_24H);
            return response;
        } finally {
            lockService.unlock(idempotencyKey);
        }
    }
}
```
Key design detail: **the idempotency key must be client-generated**, not server-generated — the client needs the *same* key across retries of the *same logical intent*. If the server generated it, a retry after a lost response would get a new key and re-execute anyway, defeating the purpose.

## Real-world examples
- **Stripe's API** requires an `Idempotency-Key` header on all charge requests — this is the textbook implementation and worth knowing verbatim for payment-system interviews.
- **Your Notification Service (Day 7-8):** retries with backoff on failure — without idempotency keys, a user could receive the same notification 3 times if the "send" succeeded but the "ack" was lost.
- **Kafka producers** support idempotent producer mode, using sequence numbers per producer session to dedupe retried sends at the broker level — same core idea, different layer.

## Interview perspective
This tests whether you connect "we chose an AP/at-least-once system" (Day 23) to its necessary consequence: duplicate handling is not optional, it's mandatory. Interviewers specifically probe the **race condition** — two retries arriving concurrently before the first one's result is stored — which is why the lock is in the code above, not just the cache check.

## Trade-offs
| | With Idempotency Key | Without |
|---|---|---|
| Duplicate charge risk | None | High under retries/at-least-once delivery |
| Complexity | Extra store + lock | None |
| Storage cost | Must retain keys for a TTL window | None |

## Interview question
"How long should you retain idempotency keys, and what happens if a legitimate retry arrives *after* that TTL expires?"

> [!question]- Think it through, then expand
> There's no "correct" universal retention window — what should it actually be sized against?

> [!success]- Answer
> Retain keys long enough to cover realistic client retry windows — e.g., 24 hours is a common default (Stripe uses this), sized against how long a client might plausibly keep retrying a failed request, not an arbitrary round number. A retry that arrives after the TTL expires is treated as a brand-new request and processed again — this is a deliberate, documented trade-off, not an oversight: extending retention indefinitely has a real storage cost, and a retry that shows up a week later is unusual enough that "process it as new" is an acceptable, explicitly chosen risk.

## Key design principle
**Any system that favors availability over strict consistency (Day 23) must treat "at-least-once delivery" as the default assumption — idempotency is the fix, not an edge case.**

## 30-second challenge
Your Rate Limiter (Day 5) sits in front of this idempotency check. If a request is rate-limited on its retry attempt, should that count differently than a fresh request? Why?

## Tomorrow
Day 25 (HLD) — Load Balancing & Reverse Proxies: L4 vs L7, and the algorithms that decide which server gets each request.
