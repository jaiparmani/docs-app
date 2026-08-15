# Day 23 — CAP Theorem & PACELC Revisited (HLD)

<small>5 min read</small>

## What we're learning today
You touched CAP briefly on Day 5 (Rate Limiter). Now, with replication, sharding, and consistent hashing under your belt, we go deeper — and add PACELC, the extension interviewers increasingly expect.

## Core concept
**CAP:** during a network **partition**, you must choose between **Consistency** (every read gets the latest write) and **Availability** (every request gets a response, possibly stale). You cannot have both during a partition — but partitions are rare. **PACELC** finishes the thought: **even without a partition**, you still trade **Latency** vs **Consistency** — because sync replication (Day 19) costs latency for consistency, always, partition or not.

## Visual diagram
```
        Partition happens?
           /          \
         YES            NO
          |              |
    choose C or A    choose Latency or Consistency
    (CAP)             (the "ELC" in PACELC)

Examples:
  PA/EL: DynamoDB, Cassandra (availability + low latency, eventual consistency)
  PC/EC: HBase, MongoDB (default) (consistency always prioritized)
```

## Explanation
- **CP systems:** during a partition, refuse requests that can't be guaranteed consistent (return error/timeout rather than stale data). Example: a leader-only DB that stops accepting writes if it can't reach quorum.
- **AP systems:** during a partition, keep serving — possibly stale — data. Example: DynamoDB returns whatever the local replica has, then reconciles later (Day 19's async replication, extended to partition scenarios).
- **The PACELC addition:** this is what Day 19 was really foreshadowing — sync replication (waiting for follower ack) is a **latency-for-consistency trade even when the network is perfectly healthy**. CAP only describes partition behavior; PACELC captures the *everyday* trade-off you're actually making on every write.
- **Common misconception:** "We chose AP so we have no consistency guarantees at all." Wrong — most AP systems offer **eventual consistency** (data converges eventually) or tunable consistency (DynamoDB lets you request strongly-consistent reads at extra latency cost, per-query).

## Real-world examples
- **DynamoDB:** PA/EL by default (available, low-latency, eventually consistent) but supports opt-in strongly-consistent reads per request — a rare example of exposing the trade-off directly to the caller.
- **Your Rate Limiter (Day 5):** choosing Redis (single-node-ish, low latency) over a strongly-consistent distributed counter was implicitly a PACELC choice — favoring latency over perfect accuracy, because slightly over-permitting a burst is cheaper than slowing every request.
- **Your Feed cache (Day 9):** AP, unambiguously — a stale feed for a few seconds is invisible to users; refusing to serve a feed at all would be a worse experience.

## Interview perspective
By SDE-2/Senior level, interviewers assume you know the CAP acronym — the differentiator is whether you can name the **specific entity** in your design and justify C vs A for *that* entity, and whether you bring up PACELC unprompted when discussing "healthy network" latency trade-offs (not just partition scenarios). Weak candidates say "CAP theorem, we chose AP" as a blanket statement for the whole system; strong candidates say "the payment ledger is CP, the activity feed is AP, here's why each."

## Trade-offs
| | CP | AP |
|---|---|---|
| Behavior during partition | Reject some requests | Serve possibly-stale data |
| Best for | Financial transactions, inventory counts | Social feeds, view counts, presence indicators |
| User-facing failure mode | "Service unavailable" | Slightly stale data, silently |

## Interview question
"Design the 'available seats' counter for an airline booking system. CP or AP — and what breaks if you choose wrong in either direction?"

> [!question]- Think it through, then expand
> Compare the cost of "briefly unavailable" against the cost of the specific way this counter could be wrong.

> [!success]- Answer
> CP is usually correct here, despite AP's popularity elsewhere: choosing AP risks **overselling seats** — two partitioned nodes both believing a seat is available and both selling it, a real, costly, hard-to-undo failure (a customer with a confirmed seat that doesn't exist). Choosing CP risks unavailability during a partition — bookings simply fail/timeout until the partition heals, which is annoying but recoverable (the customer retries later). Between "occasionally can't book" and "occasionally oversold," the airline almost always prefers the former — this is a case where a real business cost, not a default preference for availability, should drive the CAP choice.

## Key design principle
**CAP is not a system-wide label — different entities within the same system legitimately make different C-vs-A choices. Name the entity before naming the choice.**

## 30-second challenge
For a chat app (upcoming topic), is "message delivery" CP or AP? Is "read receipts / typing indicators" the same answer? Why might they differ?

## Scenario Practice

**Scenario 1:** In a ride-hailing app, is "a driver's current location" a CP or AP entity? Is "the fare charged for a completed ride" the same answer?

> [!question]- Think it through, then expand
> This day's key design principle says: name the entity before naming the choice. Do these two entities actually need the same answer?

> [!success]- Answer
> No — and that's the point. Driver location is naturally AP: a slightly stale position shown on the map (a few seconds old) is a completely acceptable trade-off in exchange for the map always being responsive, and refusing to show a position because of a brief network partition would make the app unusable for something low-stakes. Fare charged is naturally CP-leaning: charging the wrong amount, or charging twice, is a real financial and trust problem, so this entity should prefer refusing to complete an inconsistent charge over completing one that might be wrong. Same app, same theorem, two different correct answers — because CAP is a per-entity question, not a per-system one.

**Scenario 2:** A teammate says "we chose MongoDB, so our system is AP." Is that a valid conclusion?

> [!question]- Think it through, then expand
> Does a database's default configuration determine your system's CAP behavior, or does something else?

> [!success]- Answer
> Not on its own — most modern databases, including MongoDB, expose *configurable* consistency behavior (write concern, read concern, replica acknowledgment settings), so "we chose database X" doesn't by itself fix a CAP answer the way it might have for an older, single-mode system. The actual CAP behavior is determined by how that database is configured for each specific entity's writes and reads — you could run the same database with strongly consistent settings for one collection and eventually-consistent settings for another. The teammate's statement conflates "which product we picked" with "which consistency mode we configured," and the framework's practice habit of naming the entity explicitly is exactly what catches this kind of imprecision before it becomes a real production assumption baked into the wrong place.

## Tomorrow

Day 24 (LLD) — Idempotency keys: making retried requests safe, a direct consequence of the AP/eventual-consistency trade-offs you just learned.
