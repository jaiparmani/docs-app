# Day 22 — Shard Router (LLD)

## What we're learning today
Wiring together Day 16's consistent hashing ring with Day 21's sharding concept into a router your application code actually calls.

## Core concept
A `ShardRouter` interface hides *how* a key maps to a shard from the rest of the app — same abstraction philosophy as the Cache interface (Day 12).

## Visual diagram
```
Application
     |
 ShardRouter.getConnection(userId)
     |
     v
ConsistentHashRing.getServer(userId) --> "shard-3"
     |
     v
ConnectionPool.get("shard-3") --> live DB connection
```

## Explanation
```java
interface ShardRouter {
    Connection getConnection(String partitionKey);
}

class ConsistentHashShardRouter implements ShardRouter {
    private final ConsistentHashRing ring;              // from Day 16
    private final Map<String, DataSource> shardPools;    // shardId -> connection pool

    public Connection getConnection(String partitionKey) {
        String shardId = ring.getServer(partitionKey);
        DataSource pool = shardPools.get(shardId);
        if (pool == null) throw new ShardUnavailableException(shardId);
        return pool.getConnection();
    }
}

// Usage in a repository, business logic never sees shard details:
class OrderRepository {
    private final ShardRouter router;

    Order findById(String orderId) {
        try (Connection conn = router.getConnection(orderId)) {
            // run query against the correct shard transparently
            return queryOrder(conn, orderId);
        }
    }
}
```
Notice `OrderRepository` never mentions "shard" — exactly like `CacheAsideCache` (Day 12) hid strategy details from business logic. This is the same design instinct applied to a different problem: **isolate infrastructure decisions behind an interface.**

## Real-world examples
- **Vitess (YouTube's MySQL sharding layer)** implements exactly this pattern at massive scale — apps talk to what looks like one MySQL instance; Vitess routes queries to the correct shard transparently.
- **ShardingSphere / Citus (Postgres)** provide the same abstraction as middleware rather than app-level code.

## Interview perspective
This tests whether you can translate an HLD concept into working code with correct failure handling — what happens when `shardPools.get(shardId)` returns null (a shard is down)? Do you fail the request, retry, or fall back to a replica? Interviewers often follow up with: "now add support for adding a new shard without downtime" — testing whether your router supports **online resharding** via the ring's incremental-remap property (Day 15).

## Trade-offs
| Design choice | Pro | Con |
|---|---|---|
| Router owns hashing logic | Simple, app stays dumb | Router itself becomes a scaling bottleneck if centralized |
| Client-side hashing (each app instance computes shard) | No router SPOF | Every client must stay in sync on ring topology |

## Interview question
"How do you handle a query that must span multiple shards — e.g., 'total order count this month'? Where does aggregation logic live?"

> [!question]- Think it through, then expand
> No single shard has the full answer — where does the "combine partial answers" step actually run?

> [!success]- Answer
> Scatter-gather at the repository/service layer: issue the same query (or a per-shard variant of it) to every shard in parallel, then merge/aggregate the partial results in application code once they all return — no single shard can answer "total this month" alone, since each only holds its own slice. This is exactly the cross-shard query cost Day 21 flagged as the unavoidable trade-off of picking a partition key optimized for a different (more common) access pattern.

## Key design principle
**Every infrastructure decision — cache strategy, shard location, rate-limit algorithm — belongs behind an interface so business logic stays untouched when the decision changes.**

## 30-second challenge
If `shardPools.get(shardId)` throws `ShardUnavailableException`, should `OrderRepository` retry against a replica, fail fast, or queue the request? Justify based on whether `findById` is a read or write.

## Tomorrow
Day 23 (HLD) — CAP Theorem & PACELC, revisited with everything you now know from replication, sharding, and consistent hashing.
