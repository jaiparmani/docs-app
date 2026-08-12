# Day 37 — Raft Leader Election, Traced (LLD)

## What we're learning today
Day 36 explained *why* consensus prevents split-brain. Today traces Raft's actual state machine and message flow so "leader election" stops being a vocabulary word and becomes a mechanism you could reason about node-by-node.

## Core concept
Every Raft node is always in exactly one of three states — **Follower**, **Candidate**, or **Leader** — and moves between them based on timeouts and vote counts. The entire election protocol is: followers wait for heartbeats; if one times out, it becomes a candidate and requests votes; if it gets a majority, it becomes leader.

## Visual diagram
```
        heartbeat received
Follower ------------------> stays Follower
   |
   | election timeout (no heartbeat, randomized ~150-300ms)
   v
Candidate --(increments term, votes for self, requests votes)-->
   |                                                   |
   | wins majority                          | discovers higher term / loses
   v                                                   v
 Leader                                            Follower (retry as candidate later)
   |
   | sends periodic heartbeats (AppendEntries, possibly empty)
   v
(stays Leader until it stops hearing from majority, or a higher term appears)
```

## Explanation
- **The randomized timeout is the detail that actually prevents election chaos.** If every follower used the exact same timeout, they'd all become candidates simultaneously on leader failure, split the vote evenly, fail to reach majority, and re-time-out simultaneously again — an infinite tie. Raft randomizes each node's timeout within a range (e.g. 150–300ms) specifically so one node almost always times out first, becomes a candidate, and gathers votes before others even start their own election.
- **A vote is a promise, and it's exclusive per term.** Each node votes for at most one candidate per term, first-come-first-served (whoever asks first, if that candidate's log is at least as up to date — full log-comparison rules are a Day-38-adjacent topic, not needed to understand election itself). This exclusivity is *why* majority guarantees at most one winner: two candidates can't both collect votes from an overlapping majority of the same fixed set of single-vote-per-term nodes.
- **RequestVote RPC, concretely:** a candidate sends `RequestVote(term, candidate_id)` to every other node. A follower grants the vote if the candidate's term is at least as high as its own current term *and* it hasn't already voted this term. This is a simple, stateless-per-request check — no complex negotiation.
- **Heartbeats are just empty AppendEntries RPCs.** Once elected, the leader periodically sends `AppendEntries` (even with no new log entries — an empty heartbeat) to every follower. As long as followers keep receiving these before their own timeout fires, they stay followers and never start an election. This is the exact mechanism Day 36's "missed heartbeat triggers new election" was describing.
- **Discovering a higher term always wins.** If a leader or candidate ever receives a message (from anyone) carrying a higher term number than its own, it immediately reverts to Follower and updates its term — this is what forces a partitioned-then-reconnected old leader to step down once it sees evidence a new election already happened without it.

## Real-world examples
- **etcd's Raft implementation:** exactly this state machine, in production, backing Kubernetes' cluster state — a `kubectl` command's write ultimately depends on etcd's Raft leader being correctly, uniquely elected via this protocol.
- **HashiCorp Consul and Vault:** both use Raft (via HashiCorp's own `raft` library) for leader election among their server nodes, same RequestVote/AppendEntries mechanism.
- **CockroachDB / TiDB:** use Raft per data range/shard (not just once for the whole cluster) — meaning a large cluster runs *many* independent Raft groups simultaneously, each electing its own leader for its own shard. Worth knowing this scales beyond "one leader for the whole system."

## Interview perspective
Being able to trace "follower times out → becomes candidate → requests votes → wins or loses → becomes leader or reverts" node-by-node, and explaining *why the timeout is randomized*, is what separates "I've heard of Raft" from "I understand leader election." The randomized-timeout detail specifically is a frequent follow-up probe, because it's the one piece candidates who only memorized the three-state diagram tend to miss.

## Trade-offs
| | Fixed timeout for all nodes | Randomized timeout per node (Raft's choice) |
|---|---|---|
| Risk of split votes / repeated ties | High — synchronized timeouts | Low — one node almost always times out first |
| Implementation complexity | Simpler | Marginally more (range instead of a constant) |
| Election speed | Unpredictable under contention | Fast, converges in one or few rounds typically |

## Interview question
"Node A is the current leader. A network partition isolates A from the rest of the cluster, but A itself doesn't crash. What does A believe about its own leadership, and what does the rest of the cluster do?"

> [!question]- Think it through, then expand
> A never received any signal telling it to stop being leader — what does that imply?

> [!success]- Answer
> A keeps believing it's the leader indefinitely — it never receives any message telling it otherwise, since it's simply cut off, not crashed. Meanwhile, the majority partition stops receiving A's heartbeats, times out, and elects a new leader with a higher term number. If the partition heals and A tries to act as leader again (e.g. sends a heartbeat), any node that has seen the higher term will reject A's messages and A will discover the higher term itself, immediately reverting to Follower. This is precisely the term-number mechanism from Day 36 resolving the "leader that isn't dead, just unreachable" case — the system briefly has two nodes that *believe* they're leader, but only one (the majority side's) can ever get writes acknowledged, which is what actually matters for correctness.

## Key design principle
**Randomizing the election timeout isn't a minor implementation detail — it's the specific mechanism that keeps elections fast and avoids repeated split votes; understanding Raft without it is understanding the diagram, not the protocol.**

## 30-second challenge
Why does a candidate need to reset its own election timeout and re-request votes if it doesn't win a majority within one round (e.g. due to a split vote) — what would happen if it just gave up?

## Tomorrow
Day 38 (HLD) — Distributed Transactions (2PC vs Saga): a different coordination problem — not "who's in charge," but "how do multiple services commit or roll back together" — and why Saga, not 2PC, is what most real systems actually reach for.
