# Day 21 — Database Sharding & Partitioning (HLD)

<small>5 min read</small>

## What we're learning today
Replication (Day 19) scaled reads. It doesn't help when your *write* volume or total data size exceeds what one machine can hold. That's what sharding solves.

## Core concept
**Sharding (horizontal partitioning):** split rows across multiple independent database instances, each holding a subset of the data, based on a **partition key**. Unlike replication, shards don't hold copies of the same data — each shard is a distinct slice.

## Visual diagram
```
              Application
                   |
            [Shard Router] -- uses consistent hashing (Day 15) on partition key
           /        |         \
     Shard 1     Shard 2     Shard 3
   (users A-H) (users I-P) (users Q-Z)
```

## Explanation
- **Choosing a partition key is the entire design problem.** Pick wrong and you get a hotspot (one shard receives disproportionate traffic) or expensive cross-shard queries.
- **Range-based partitioning** (e.g., by user ID ranges): simple, supports efficient range scans, but causes hotspots if writes cluster (e.g., all new users landing on the newest/last shard).
- **Hash-based partitioning** (hash the key, use consistent hashing from Day 15 to pick a shard): even distribution, but range queries ("all users who joined in March") now require fan-out to every shard.
- **The killer problem: cross-shard joins/transactions.** If `orders` are sharded by `user_id` but you need "top 10 products this week across all users," that's a scatter-gather query hitting every shard and merging results in the app layer — expensive and complex. This is *the* recurring theme in every sharded-system interview question.
- **Resharding is expensive:** unlike consistent hashing's ~1/N key movement, naive range resharding can require moving nearly all data. This is why most production shard routers use consistent hashing internally, even for what looks like range-friendly data.

## Real-world examples
- **Instagram's original sharding**: sharded Postgres by user ID, using a custom ID-generation scheme (embedding shard ID into the ID itself) so any service could route directly without a lookup table.
- **Uber's trip data**: sharded geographically — trips in a city stay within a regional shard, which also happens to align with data-residency and latency needs (a trip in Mumbai doesn't need to touch a US shard).
- **DynamoDB**: partition key is mandatory at table design time precisely because it's this hard to change later — Amazon forces you to think about it upfront.

## Interview perspective
This is one of the highest-signal HLD topics because it forces trade-off reasoning under real constraints. Interviewers want to see: (1) how you pick the partition key based on actual query patterns, not arbitrarily, and (2) whether you proactively flag the cross-shard query problem before they ask.

## Trade-offs
| | Range-based | Hash-based |
|---|---|---|
| Range queries | Efficient (contiguous) | Requires fan-out to all shards |
| Even distribution | Risk of hotspots | Generally even |
| Resharding | Can be smooth if planned | Consistent hashing minimizes movement |

## Interview question
"Design sharding for a ride-hailing trips table. What's your partition key, and what breaks if a support agent needs 'all trips for user X across all time'?"

> [!question]- Think it through, then expand
> The natural partition key for write distribution and the natural key for this specific query are probably not the same field — what does that force you to accept?

> [!success]- Answer
> Shard by `trip_id` or `city_id` — this distributes writes evenly (trips happen continuously across many cities/riders) and keeps most operational queries ("trips in this city," "a specific trip's details") fast and single-shard. But "all trips for user X across all time" now has no natural home — user X's trips are scattered across whichever shards their individual trip IDs happened to land on. The honest answer is either a secondary index (a separate `user_id -> [trip_ids]` lookup service, maintained alongside the main sharded table) or accepting that this specific, relatively rare query requires a scatter-gather across every shard — there's no shard key that makes every query pattern fast, and naming which pattern you're sacrificing is the actual signal here.

## Key design principle
**Pick your partition key based on your dominant query pattern, and explicitly name which *other* query patterns you're sacrificing — there's no shard key that's free.**

## 30-second challenge
For Feed Ranking Engine's post store, would you shard by `post_id` or `author_id`? Which query gets fast, and which gets expensive, under each choice?

## Scenario Practice

**Scenario 1:** You shard a multi-tenant SaaS database by `tenant_id`. One enterprise customer is 200x larger than every other tenant combined. What breaks, and what's the fix?

> [!question]- Think it through, then expand
> What does sharding by `tenant_id` assume about the *distribution* of tenant sizes, and what happens when that assumption is wrong?

> [!success]- Answer
> This is a hot-partition problem: every one of that tenant's queries lands on a single shard no matter how many shards exist in total, so that shard's load is entirely decoupled from how many shards you've provisioned — adding more shards doesn't help this one tenant's load at all, it only spreads the *other* tenants out further. The standard fix is giving oversized tenants their own dedicated shard (or shards) explicitly, rather than letting the generic hashing scheme place them wherever it lands them — effectively treating "is this tenant abnormally large" as its own routing decision layered on top of the normal shard key.

**Scenario 2:** A query that used to be a simple `SELECT * FROM orders WHERE user_id = ?` now needs to also answer "what are this company's total orders across all its users" — but you sharded by `user_id`, and a company's users are scattered across many shards. What's the actual cost of this, and is there a way to avoid it?

> [!question]- Think it through, then expand
> This is the "name what you're sacrificing" half of this day's key design principle — what did choosing `user_id` as the shard key optimize for, and what did it deliberately give up?

> [!success]- Answer
> Choosing `user_id` as the shard key optimized for the dominant pattern (a user's own data lives on one shard, so per-user queries are fast and single-shard). The cost is that any cross-shard aggregation — like "all orders for company X" — now requires a scatter-gather query across every shard and merging results in application code, which is slower and more complex than a single-shard query. This isn't really avoidable by tweaking the shard key without giving up the original optimization; the more common real answer is to maintain a separate, purpose-built read path for that aggregation (a materialized view, a data warehouse fed by CDC, or a search index) rather than forcing the primary sharded store to serve a query shape it wasn't designed for.

## Tomorrow

Day 22 (LLD) — implementing a **Shard Router** interface in Java, tying together consistent hashing + partition key resolution.
