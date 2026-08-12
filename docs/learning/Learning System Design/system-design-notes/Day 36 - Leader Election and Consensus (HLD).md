# Day 36 — Leader Election & Consensus (HLD)

## What we're learning today
Starts Block B — "where seniority begins." Day 29's distributed lock assumed *something* coordinates who holds the lock. Today asks the question one level down: how do a group of equal nodes agree on a single coordinator (leader) with no single point of failure, when any node can crash at any time?

## Core concept
**Consensus** is how a group of distributed nodes agree on a single value (e.g. "who is the leader") despite node failures and message delays, without ever being tricked into two different answers being simultaneously true. **Leader election** is consensus applied to one specific question: which node currently gets to make authoritative decisions for the group.

## Visual diagram
```
3 nodes, no leader yet:
  Node A: "I'm running for leader, term 1" -> requests votes from B, C
  Node B: "haven't voted this term" -> votes for A
  Node C: "haven't voted this term" -> votes for A
  A gets majority (2 of 3) -> A is leader for term 1

Later, A crashes (misses heartbeats):
  Node B: "no heartbeat from leader, timeout" -> starts election, term 2
  ... same process, new leader elected, new term number
```

## Explanation
- **Why not just hardcode a leader:** a hardcoded/fixed leader is a single point of failure — if it crashes, nothing replaces it and the system stalls. Consensus algorithms exist specifically to make leader failure a recoverable event, not a fatal one.
- **Majority (quorum) is the core trick:** a candidate needs votes from a **majority** of nodes, not all of them. This guarantees at most one leader can be elected per term, because two different candidates can't both get a majority of the same fixed node set simultaneously — their vote sets would have to overlap, and each node only votes once per term. This is the same quorum-based reasoning [[Day 19 - Database Replication (HLD)|Day 19]] used for write acknowledgment, applied to elections instead of writes.
- **Terms/epochs prevent stale leaders from causing damage:** each election increments a term number; every message carries the current term, and nodes reject messages from a stale (lower) term. If a leader is network-partitioned but not actually crashed, it might keep believing it's leader — but its term is now stale, and the rest of the cluster (which elected a new leader with a higher term) will ignore it.
- **Heartbeats detect failure, not messages:** followers expect periodic heartbeats from the leader; a missed heartbeat past a timeout triggers a new election. This is the cluster-wide version of the lease/heartbeat pattern [[Day 30 - Redis Distributed Lock Implementation (LLD)|Day 30]] and [[05-design-job-scheduler]] both used at the single-lock scale — leader election is really "distributed locking of the coordinator role itself."
- **Split-brain is the failure mode all of this prevents:** two nodes both believing they're the current leader simultaneously, both making authoritative (possibly conflicting) decisions. Majority quorum + term numbers are specifically what makes split-brain provably impossible in a correctly implemented consensus protocol — not just unlikely.

## Real-world examples
- **etcd / ZooKeeper:** both implement leader election (via Raft and ZAB respectively) as a primitive that other systems build on — e.g. Kubernetes uses etcd's consensus to elect a leading `kube-controller-manager` instance among several replicas.
- **Kafka controller election:** one broker is elected "controller" (via ZooKeeper historically, or Kafka's own Raft-based KRaft mode now) responsible for partition leader assignment — the same leader-election pattern, one layer up from Kafka's own per-partition leader/follower replication.
- **Database replica sets (MongoDB, Postgres with Patroni):** the primary is elected among replicas via a consensus-like protocol; a missed heartbeat from the primary triggers a new election among the remaining replicas.

## Interview perspective
Most candidates can say "we use leader election so there's a single coordinator." The signal is explaining **why majority quorum prevents two simultaneous leaders** (not just asserting that it does), and naming the term-number mechanism that handles a leader that's merely partitioned, not actually dead — the scenario naive "just pick a new leader on timeout" designs get wrong (both old and new leader think they're in charge).

## Trade-offs
| | No leader (fully peer-to-peer) | Fixed/hardcoded leader | Elected leader (consensus) |
|---|---|---|---|
| Single point of failure | No | Yes | No — self-heals on crash |
| Coordination complexity | Often needs its own conflict resolution | None | Election protocol overhead |
| Split-brain risk | N/A (no leader concept) | N/A (but total outage on crash) | Prevented by quorum + terms, if correctly implemented |

## Interview question
"A 5-node cluster splits into a 3-node partition and a 2-node partition due to a network failure. Can both partitions elect their own leader?"

> [!question]- Think it through, then expand
> Count the votes each side can actually gather.

> [!success]- Answer
> No — only the 3-node partition can elect a leader, because majority of 5 is 3, and the 2-node partition can never gather 3 votes no matter what it does. The 2-node side is left leaderless (unavailable for writes requiring a leader) until the partition heals — this is a deliberate **CP** choice (Day 23): the minority side sacrifices availability specifically to guarantee only one leader can ever exist, avoiding split-brain. This is also *why* consensus clusters are typically sized as odd numbers (3, 5, 7) — it maximizes the gap between "majority" and "the largest possible minority" for a given total node count.

## Key design principle
**Consensus doesn't prevent network partitions — it guarantees that at most one side of any partition can make progress, which is what actually prevents split-brain.**

## 30-second challenge
Why does a 4-node cluster not meaningfully improve fault tolerance over a 3-node cluster (majority of 4 is 3, same as majority of 3 tolerating 1 failure) — and what does this imply about choosing cluster sizes?

## Tomorrow
Day 37 (LLD) — trace a toy Raft leader election end to end: term numbers, vote requests, and the heartbeat timeout that triggers a new election, made concrete instead of conceptual.
