# Day 13 — Redis Internals (HLD)

<small>3 min read</small>

## What we're learning today
You've used Redis four times without asking *how* it delivers sub-millisecond latency and what happens if it crashes. Today we open the box.

## Core concept
Redis is fast because it's **single-threaded for command execution** (no lock contention) and **in-memory** (no disk seeks). Durability and scale come from separate mechanisms bolted on: persistence (RDB/AOF) and replication.

## Visual diagram
```
        Client Requests
              |
      [Event Loop - single thread]
              |
     ---------------------
     |    In-Memory Data  |
     |  (hash tables, etc)|
     ---------------------
       /              \
  RDB Snapshot      AOF Log
  (periodic dump)   (every write, replayable)
```

## Explanation
- **Single-threaded execution:** all commands run one at a time on one core — no race conditions on data structures, no locking overhead. Multi-core is used for I/O (Redis 6+) and background tasks, not command execution.
- **Eviction policies (what happens when memory fills up):** `noeviction` (reject writes), `allkeys-lru` (evict least-recently-used), `volatile-ttl` (evict soonest-to-expire keys first). Your TinyURL cache should use `allkeys-lru` — cold URLs should fall out first.
- **RDB (snapshotting):** periodic full dump to disk. Fast restart, but you lose everything since the last snapshot on crash.
- **AOF (Append-Only File):** logs every write command; replay on restart. Near-zero data loss, but slower and file grows large (mitigated by periodic rewrite/compaction).

**Common misconception:** "Redis is just a hash map." It's a data-structure server — lists, sets, sorted sets, hyperloglogs — each optimized for specific access patterns (sorted sets alone power leaderboards and rate limiters' sliding windows).

## Real-world examples
- **Twitter** uses Redis sorted sets for timeline ranking by timestamp.
- **Rate Limiter (Day 5):** your sliding-window implementation relies on Redis sorted sets with score = timestamp — that's the data structure choice, not accident.
- **Stripe** avoids write-back caching for balance data specifically because AOF's replay window still permits small data-loss gaps on crash — unacceptable for money.

## Interview perspective
Interviewers ask "what happens if your cache node dies" to see if you understand it's not "free scalability" — it's a trade-off with a **recovery story**. Naming RDB vs AOF (and picking correctly per use case) signals you've operated Redis, not just used it as a black box.

## Trade-offs
| | RDB | AOF |
|---|---|---|
| Data loss window | Minutes (since last snapshot) | ~1 sec (fsync every second) |
| Restart speed | Fast | Slower (replay log) |
| File size | Small | Large (needs compaction) |
| Use when | Cache is disposable/rebuildable | Cache holds semi-durable state |

## Interview question
"Your rate limiter's Redis node just restarted. What's the impact if you were using RDB vs AOF vs no persistence at all?"

> [!question]- Think it through, then expand
> Which persistence choice would you actually pick for a rate limiter, and why is "no persistence" defensible here specifically?

> [!success]- Answer
> With RDB, counters roll back to the last snapshot — some recent request counts are lost, briefly under-counting usage (permits a short burst). With AOF, counters are nearly fully restored (sub-second loss window). With no persistence, all counters reset to zero on restart — briefly permitting a burst above the limit for whatever window it takes counters to rebuild. For a rate limiter specifically, "no persistence" is often the right choice, not a shortcut: a rate limiter is a protective mechanism, not a source of truth, and a brief permitted burst after a rare restart is a much smaller cost than the operational complexity of persisting high-churn counters.

## Key design principle
**Redis' speed comes from a trade: single-threaded simplicity and in-memory storage, in exchange for you owning the durability strategy.**

## 30-second challenge
For your Feed cache (Day 9), which eviction policy fits — `allkeys-lru` or `volatile-ttl` — and why does the difference matter when feed entries have natural expiry (24hr relevance window)?

## Tomorrow
Day 14 (LLD) — implementing an **LRU cache from scratch** (HashMap + Doubly Linked List), the exact mechanism Redis's `allkeys-lru` approximates.
