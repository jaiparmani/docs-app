# Day 19 — Database Replication (HLD)

## What we're learning today
Indexing (Day 18) made single-node reads fast. Replication is the next lever: scaling reads across multiple machines, and surviving a node failure.

## Core concept
One **leader** (primary) accepts writes; one or more **followers** (replicas) receive a copy of the data and serve reads. The core design question: does the leader wait for followers to confirm before acknowledging a write (**sync**) or not (**async**)?

## Visual diagram
```
        WRITE
          |
          v
      [ Leader ]
        /    \
   replicate  replicate
      /          \
[Follower A]  [Follower B]  <-- serve READ traffic

Sync replication:  Leader waits for A/B ack before confirming write to client
Async replication: Leader confirms immediately, replicates in background
```

## Explanation
- **Async replication (most common default):** leader acknowledges the write the instant it's durable locally, replicates to followers afterward. Fast writes, but followers lag — a read immediately after a write might return stale data (**replication lag**).
- **Sync replication:** leader waits for at least one follower to confirm before acknowledging. Guarantees no data loss on leader failure, but write latency now includes network round-trip to the follower — and if the follower is down, writes can stall.
- **Semi-sync (middle ground):** wait for *one* follower to ack (not all) — bounds worst-case data loss to more than zero replicas while keeping latency reasonable. This is what MySQL semi-sync and many managed DBs default to.
- **Read-your-writes problem:** a user posts a comment (goes to leader), then immediately refreshes (routed to a lagging follower) and doesn't see it. Fix: route that user's reads to the leader for a short window after their write, or track a "read must be at least as fresh as write X" token.

## Real-world examples
- **Instagram/Twitter feeds:** async replication is fine — a few hundred ms of staleness on a follower is invisible to users scrolling a feed.
- **Banking ledger writes:** typically sync or semi-sync — losing a confirmed transaction on leader failure is unacceptable, so latency is sacrificed for durability.
- **AWS RDS Multi-AZ:** uses synchronous replication to a standby specifically for failover safety, while read-replicas (separate feature) use async for read scaling.

## Interview perspective
This is where interviewers test if you can connect replication choice to CAP theorem (Day 23 is a deeper dive, but the seed is here): sync replication favors consistency at the cost of availability/latency; async favors availability/latency at the cost of possible data loss. Naming the trade-off explicitly, tied to the specific entity (money vs. social post), is what separates a Senior-level answer from a definition recital.

## Trade-offs
| | Async | Sync | Semi-Sync |
|---|---|---|---|
| Write latency | Low | High (worst follower) | Medium |
| Data loss risk on leader failure | Some (unreplicated writes lost) | None | Minimal |
| Availability if follower down | Unaffected | Can block writes | Unaffected (needs just 1 of N) |

## Interview question
"Your leader DB crashes. You promote a follower to be the new leader. What data might be lost, and how does your choice of sync/async/semi-sync from before the crash determine the answer?"

> [!question]- Think it through, then expand
> Ask specifically: which writes had definitely reached a follower before the crash, versus which hadn't?

> [!success]- Answer
> With async replication, any write the leader acknowledged to the client but hadn't yet shipped to followers is lost the moment the leader crashes — the promoted follower never received it, and there's no way to recover it. With sync replication, every acknowledged write had already been confirmed by at least one follower before the client got its response, so the promoted follower has everything the client believes was saved — no data loss, at the cost of the write latency paid earlier. Semi-sync sits in between: acknowledged writes are guaranteed to exist on at least one follower (not necessarily the one promoted, if there are several), bounding — but not eliminating — the loss window.

## Key design principle
**Replication lag is not a bug to eliminate — it's a dial to tune based on how much staleness each specific feature can tolerate.**

## 30-second challenge
For your Feed Ranking Engine (Day 9-10), is async replication acceptable for the underlying post store? What about for the "user just deleted an offensive post" case — does your answer change?

## Tomorrow
Day 20 (LLD) — implementing a simplified **Write-Ahead Log (WAL)**, the mechanism that actually makes replication and crash recovery possible.
