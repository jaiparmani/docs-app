# Day 21 — Database Sharding & Partitioning (HLD)

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

## Tomorrow
Day 22 (LLD) — implementing a **Shard Router** interface in Java, tying together consistent hashing + partition key resolution.
