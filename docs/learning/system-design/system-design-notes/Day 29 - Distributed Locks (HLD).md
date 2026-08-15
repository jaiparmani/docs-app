# Day 29 — Distributed Locks (HLD)

<small>6 min read</small>

## What we're learning today
Day 24's idempotency lock and Day 22's shard-router assumed "a lock" existed. Today we examine what that actually means across machines — a much harder problem than `synchronized` in Java.

## Core concept
A **distributed lock** ensures only one process across an entire fleet can hold a resource at a time. Unlike an in-process mutex, you must handle: what if the lock holder crashes without releasing it? What if two nodes both *think* they hold the lock due to a network partition?

## Visual diagram
```
   Node A                Node B
     |                      |
  SETNX lock_key (TTL 10s)  |
     | (succeeds)           |
  [holds lock, does work]   |
     |                   SETNX lock_key
     |                   (fails - already exists)
     |                   [waits/retries]
  releases lock (DEL)       |
                          SETNX succeeds -> Node B's turn
```

## Explanation
- **Redis-based lock (simplest, most common):** `SET key value NX PX 10000` — atomically set only if not exists, with a TTL. The TTL is critical: if the lock holder crashes, the lock **self-expires** instead of deadlocking forever.
- **The classic bug:** releasing a lock with a plain `DEL` lets Node A accidentally delete Node B's lock if A's TTL expired, B acquired it, and *then* A's delayed release arrives. Fix: store a unique token as the value, and release only via a compare-and-delete Lua script (`if redis.get(key) == my_token then DEL`).
- **Redlock (multi-node Redis):** acquire the lock across a majority of independent Redis nodes to survive a single node failing — controversial in distributed-systems circles (Martin Kleppmann's famous critique argues it doesn't provide real safety guarantees under clock drift/GC pauses) but commonly asked about in interviews specifically *because* of that controversy.
- **ZooKeeper/etcd-based locks:** use **ephemeral sequential nodes** — the lock is tied to the client's session; if the client crashes, ZooKeeper's session timeout releases the lock automatically. Stronger correctness guarantees than Redis (built on Raft/ZAB consensus) but higher operational complexity and latency.

**Common misconception:** "A TTL on the lock fully solves the crash problem." Not quite — if your critical section takes longer than the TTL (e.g., GC pause), another node can acquire the lock while the first is still "in" its critical section, causing two holders simultaneously. This is the exact scenario Kleppmann's critique targets.

## Real-world examples
- **Your Idempotency Interceptor (Day 24)** used `lockService.tryLock()` — this is precisely what it was calling under the hood.
- **Distributed cron jobs** (e.g., "run this batch job exactly once across a fleet of 20 instances") use ZooKeeper/etcd locks specifically for their stronger crash-safety guarantees — a duplicate batch run can be far more costly than a duplicate notification.
- **Elevator/Parking Lot LLD (upcoming):** allocating "spot #5" to exactly one car under concurrent requests is a distributed-lock problem if the allocator runs on multiple instances.

## Interview perspective
Interviewers use this to test whether you know distributed locks are **probabilistically safe, not perfectly safe**, when built on Redis — and whether you can articulate when that's an acceptable trade-off (idempotency-key deduplication, where a rare double-execution is caught by the idempotency check itself as a safety net) versus when it's not (allocating a unique resource with no other safety net, where ZooKeeper/etcd's stronger guarantees are worth the complexity).

## Trade-offs
| | Redis Lock | Redlock (multi-node Redis) | ZooKeeper/etcd |
|---|---|---|---|
| Correctness guarantee | Weakest (TTL + clock assumptions) | Stronger, still debated | Strongest (consensus-based) |
| Latency | Lowest | Medium | Higher |
| Operational complexity | Low | Medium | High (separate cluster to run) |
| Best for | Best-effort dedup (paired with idempotency) | Medium-stakes coordination | Critical, must-not-double-execute tasks |

## Interview question
"You're using a Redis lock with a 10-second TTL to protect a critical section that occasionally takes 15 seconds under load. What goes wrong, and what are two different fixes?"

> [!question]- Think it through, then expand
> The TTL and the actual critical-section duration have drifted apart — what does the lock store believe versus what's actually true?

> [!success]- Answer
> What goes wrong: the lock expires at 10 seconds while the first node is still legitimately working (15 seconds total) — a second node sees the key as free, acquires it, and now both nodes execute the critical section concurrently, exactly the double-execution the lock was supposed to prevent. Two fixes: (1) a lock-extension/heartbeat pattern — the holding node periodically renews the TTL while still actively working, so the lock only expires if the node genuinely stops (the same fix [05-design-job-scheduler](../Claude Notes/05-design-job-scheduler.md) applies to job execution leases); (2) switch to a session-based lock (ZooKeeper/etcd's ephemeral nodes), where lock lifetime is tied to the client's actual liveness (a heartbeat to the coordination service) rather than a fixed timer guessed in advance.

## Key design principle
**A distributed lock's safety is only as strong as its slowest assumption (clock drift, GC pause, network delay) — know which failure modes your chosen implementation tolerates.**

## 30-second challenge
Why is a **unique token** in the lock value (not just existence of the key) necessary for safe lock release — walk through the exact race condition it prevents.

## Scenario Practice

**Scenario 1:** A process acquires a distributed lock, then pauses for an unusually long garbage-collection cycle. The lock's TTL expires while it's paused, another process acquires the same lock and starts working, and then the first process resumes — still believing it holds the lock. What goes wrong, and what's the standard mitigation?

> [!question]- Think it through, then expand
> The first process was never told it lost the lock — is there a way for it to find out before doing damage?

> [!success]- Answer
> Both processes now believe they hold the lock simultaneously, which is exactly the safety violation a lock exists to prevent — this is the GC-pause / clock-drift failure mode this day's key design principle calls out directly. The standard mitigation is a **fencing token**: a monotonically increasing number issued with the lock, which the protected resource itself checks and rejects any write carrying a token lower than the highest one it's already seen. The first process's resumed writes carry a stale (lower) token and get rejected by the resource, even though the process itself doesn't know it lost the lock — the safety is enforced by the resource, not by trusting the lock holder to notice.

**Scenario 2:** You're using a single Redis instance as a lock manager. It fails over to a replica that hadn't yet received the most recent lock acquisition (async replication lag). What's the risk, and does this change your confidence in the lock's guarantee?

> [!question]- Think it through, then expand
> If the replica doesn't know a lock was held, what happens when a second process asks it for that same lock?

> [!success]- Answer
> Yes — this is a real gap. The replica, unaware the lock was ever acquired (the replication of that write hadn't landed yet when the primary failed), will happily grant the same lock to a second process, producing exactly the two-holders violation the lock was supposed to prevent. This is why single-instance distributed locking has a real, named weakness under failover, and why algorithms like Redlock (acquiring the lock across a majority of independent Redis instances) exist — trading implementation complexity for a guarantee that survives a single node's failure, rather than assuming one instance's view of the lock state is authoritative.

## Tomorrow

Day 30 (LLD) — implementing a **Redis-based distributed lock** with the compare-and-delete release pattern, end to end.
