# Day 15 — Consistent Hashing (HLD)

<small>3 min read</small>

## What we're learning today
Every sharded system you'll design from here on — databases, caches, Kafka partitions — depends on this. It's the answer to: "how do you distribute keys across N servers without a full reshuffle every time N changes?"

## Core concept
Naive sharding uses `hash(key) % N`. The problem: when N changes (server added/removed), almost **every** key remaps to a different server — a cache-wide stampede. Consistent hashing bounds the damage to roughly `1/N` of keys.

## Visual diagram
```
              Hash Ring (0 to 2^32-1)
                    0
                 /     \
          ServerC        ServerA
              |             |
          (keys here    (keys here
           go to C)       go to A)
                \         /
                 ServerB
              (remaining keys)

Key lookup: hash(key) -> walk clockwise -> first server node hit
```

## Explanation
- Map both **servers** and **keys** onto the same circular hash space (e.g., 0 to 2³²).
- A key belongs to the first server found walking clockwise from its hash position.
- **Add a server:** it only steals keys from its immediate clockwise neighbor — everyone else's keys stay put. Compare to `% N`, where adding one server reshuffles nearly everything.
- **Remove a server:** its keys fall to the next server clockwise — again, only a local effect.

**The hotspot problem:** with only a few servers on the ring, key distribution can be very uneven (one server's arc might be huge). Fix: **virtual nodes** — each physical server gets placed on the ring 100-200 times under different hash points. This smooths distribution and makes failure impact proportional across all remaining servers, not dumped on one neighbor.

## Real-world examples
- **DynamoDB** and **Cassandra** use consistent hashing (with virtual nodes) as their core partitioning mechanism.
- **Memcached client libraries** (e.g., libketama) use it so adding a cache node doesn't invalidate your entire cache fleet.
- **CDN routing** (Day 17 topic) uses a similar ring concept to route users to the nearest edge node without a central lookup table.

## Interview perspective
This question tests whether you understand *why* naive modulo sharding fails at scale — not just whether you can recite "consistent hashing" as a buzzword. Interviewers will push: "what if one server ends up owning 80% of the ring?" — if you don't proactively bring up virtual nodes, that's the gap they're probing for.

## Trade-offs
| Approach | Rebalance cost on scale change | Distribution evenness | Complexity |
|---|---|---|---|
| `hash % N` | Nearly 100% of keys move | Even (if N stable) | Trivial |
| Consistent hashing (no virtual nodes) | ~1/N of keys move | Can be very uneven | Medium |
| Consistent hashing + virtual nodes | ~1/N of keys move | Even | Higher |

## Interview question
"You're sharding a Redis cache for 50M users across 10 nodes using consistent hashing. One node fails. Walk through exactly which keys are affected and where they go — and what happens to in-flight reads during the transition."

> [!question]- Think it through, then expand
> On the ring, which keys were ever "owned" by the failed node — and where does the ring send them now?

> [!success]- Answer
> Only the keys whose hash positions fell between the failed node's virtual node positions and the *previous* node clockwise are affected — roughly 1/10th of all keys, not all of them (consistent hashing's core property, Day 15's whole point). Those keys' lookups now resolve to whichever node is next clockwise on the ring from each failed virtual node position, since the ring simply skips the missing entry. In-flight reads for those affected keys will miss the cache (the new owning node never had them cached) and fall through to the database — a temporary spike in DB load and latency for that ~1/10th slice of traffic, self-healing as the new owning node repopulates its cache via normal cache-aside misses. The other ~90% of keys are completely unaffected and keep hitting a warm cache the entire time.

## Key design principle
**Design for the failure/scaling event, not just the steady state — the real test of a partitioning scheme is what happens when N changes, not when it's fixed.**

## 30-second challenge
With only 3 physical servers and no virtual nodes, why might Server A end up owning 70% of the ring purely by hash-position luck — and how many virtual nodes per server would you propose to fix it (roughly)?

## Tomorrow
Day 16 (LLD) — implementing a **consistent hashing ring with virtual nodes** in Java.
