# Day 11 — Caching Strategies at Scale

<small>4 min read</small>

## What we're learning today
You've used Redis three times already (TinyURL redirect cache, Rate Limiter counters, Feed cache). Today we formalize the **decision framework**: which caching strategy to use, and why picking the wrong one silently corrupts data or tanks performance.

## Core concept
A cache isn't just "Redis in front of DB." It's a **consistency trade-off** between two copies of the same data. Every caching strategy answers one question differently:

> When the source of truth changes, when does the cache find out — and who's responsible for updating it?

Four strategies answer this differently: **Cache-Aside, Read-Through, Write-Through, Write-Back**.

## Visual diagram
```
CACHE-ASIDE (what you used in TinyURL)
  App -> Cache (miss) -> DB -> App writes to Cache -> App

WRITE-THROUGH
  App -> Cache -> Cache writes to DB (sync) -> App
  (cache is always fresh, write is slower)

WRITE-BACK (write-behind)
  App -> Cache -> App returns immediately
              \-> Cache flushes to DB later (async)
  (fastest write, risk: data loss if cache dies)

READ-THROUGH
  App -> Cache -> (miss) Cache itself fetches from DB
  (App never talks to DB directly)
```

## Explanation
- **Cache-Aside (lazy loading):** App code owns the logic — check cache, on miss read DB, then populate cache. This is what you built for TinyURL redirects. Simple, resilient (cache failure just means slower reads), but first request after a miss is always slow, and cache can go stale if DB is updated elsewhere.
- **Write-Through:** Every write goes to cache AND DB synchronously before returning success. Cache never goes stale. Cost: every write pays cache-write latency too.
- **Write-Back:** Write hits cache only, acknowledges immediately, and a background process flushes to DB. Blazing fast writes (this is how Notification Service's queue-workers pattern feels), but if the cache node crashes before flush, you lose data — dangerous for anything transactional (payments, orders).
- **Read-Through:** Cache sits as a proper layer with its own DB-loading logic (often built into the caching library, e.g., Guava LoadingCache). Functionally similar to cache-aside but the cache — not your app — owns the fetch logic.

**Common misconception:** "Caching = making things faster." Wrong framing. Caching = **trading consistency for latency**. Every cache decision is really a consistency decision wearing a performance costume.

## Real-world examples
- **TinyURL / bit.ly:** Cache-aside — URL mappings rarely change, staleness tolerance is high.
- **Twitter timeline counts (likes, retweets):** Write-back — approximate counts are fine, eventual consistency acceptable.
- **Stripe payment status:** Never write-back. Write-through or no cache at all on the write path — correctness > speed.
- **Uber driver location:** Effectively write-back into Redis (locations update every few seconds; DB persistence lags) — losing a few seconds of location history on crash is acceptable.

## Interview perspective
Interviewers are testing whether you **default to cache-aside without thinking**, or whether you can articulate: "This data is read-heavy and tolerant of staleness → cache-aside with TTL. This data is financial → I won't cache the write path at all, only cache read-replicas." Saying "I'll add Redis caching" with no strategy named is a red flag at Senior level — it signals you've used caching, not designed with it.

## Trade-offs
| Strategy | Write Latency | Read Latency | Data Loss Risk | Staleness Risk |
|---|---|---|---|---|
| Cache-Aside | Low (DB only) | High on miss | None | Medium |
| Write-Through | High | Low | None | None |
| Write-Back | Very Low | Low | High | None (cache is truth) |
| Read-Through | Low | High on miss | None | Medium |

The real axis: **write-back optimizes for speed and accepts durability risk; write-through optimizes for durability and accepts write cost.** Nearly every "which caching strategy" interview answer is really this trade-off restated for the specific entity.

## Interview question
"You're designing the caching layer for an e-commerce product page (price, description, stock count). Which strategy for each field, and why might you split strategies within the *same* entity?"

> [!question]- Think it through, then expand
> Consider which field is most sensitive to being wrong, not just which changes most often.

> [!success]- Answer
> Price and description are cache-aside with a long TTL — they change rarely and staleness is low-cost. Stock count is a different beast: near-real-time, probably no cache (or a very short TTL), because a stale "in stock" reading leads to overselling, which is worse than a slightly slower page load. Splitting strategy within the same entity is the point — a single "cache this product" decision hides that its fields have very different staleness tolerances.

## Key design principle
**Cache what changes rarely and is read often. Never cache your source of truth for data where being wrong is expensive.**

## 30-second challenge
Your Feed cache (Day 9) currently uses cache-aside. A PM asks you to add a "like count" that updates in real time as users like posts. Do you keep cache-aside, or switch strategy for just that field? Justify in one sentence before tomorrow.

## Tomorrow
Day 12 (LLD) — we implement a **pluggable Cache abstraction** in Java (interface + Cache-Aside and Write-Back implementations) so your services can swap strategies without touching business logic.


## Linked from

- [Day 48 — Video Streaming Fundamentals (HLD)](Day%2048%20-%20Video%20Streaming%20Fundamentals%20%28HLD%29.md)
- [Design Twitter (Post + Follow + Home Timeline)](../Claude%20Notes/03-design-twitter.md)
- [Design Uber (Ride-Hailing: Driver-Rider Matching)](../Claude%20Notes/06-design-uber.md)
- [Learning System Design](../index.md)
