# Day 16 — Consistent Hashing Ring Implementation (LLD)

<small>3 min read</small>

## What we're learning today
Coding yesterday's ring with virtual nodes — the exact structure behind DynamoDB/Cassandra partitioning.

## Core concept
A `TreeMap<Long, Server>` gives you an ordered ring for free — Java's `ceilingKey()` does the "walk clockwise, find first server" lookup in O(log n).

## Visual diagram
```
TreeMap<hash, server> (sorted by key):
  120 -> ServerA-v3
  980 -> ServerB-v1
 2200 -> ServerA-v1
 5400 -> ServerC-v2
   ...

lookup(key): hash(key) -> ceilingKey() -> wrap to first entry if none found
```

## Explanation
```java
class ConsistentHashRing {
    private final TreeMap<Long, String> ring = new TreeMap<>();
    private final int virtualNodes;

    ConsistentHashRing(int virtualNodes) {
        this.virtualNodes = virtualNodes;
    }

    void addServer(String server) {
        for (int i = 0; i < virtualNodes; i++) {
            long hash = hash(server + "#" + i);
            ring.put(hash, server);
        }
    }

    void removeServer(String server) {
        for (int i = 0; i < virtualNodes; i++) {
            ring.remove(hash(server + "#" + i));
        }
    }

    String getServer(String key) {
        if (ring.isEmpty()) return null;
        long hash = hash(key);
        Map.Entry<Long, String> entry = ring.ceilingEntry(hash);
        // wrap around the ring if we're past the last node
        return (entry != null ? entry : ring.firstEntry()).getValue();
    }

    private long hash(String input) {
        // MD5/MurmurHash for good distribution; simplified here
        return Hashing.murmur3_128().hashString(input, StandardCharsets.UTF_8).asLong();
    }
}
```
`virtualNodes = 150` is a common production default — enough to smooth distribution without bloating the TreeMap.

## Real-world examples
- Cassandra's `Murmur3Partitioner` is functionally this structure at cluster scale, backing token-range ownership per node.
- Client-side memcached libraries embed this exact ring so **every client independently computes the same server for the same key** — no coordination service needed for routing.

## Interview perspective
Interviewers watch whether you handle the **wrap-around case** (`ceilingKey` returns null when the hash exceeds every node on the ring — you must loop back to `firstEntry()`). Missing this is the single most common bug in whiteboard implementations. They also probe: "what if `addServer` is called concurrently with `getServer` from multiple threads?" — a chance to discuss `ConcurrentSkipListMap` as a thread-safe swap-in.

## Trade-offs
| Design choice | Benefit | Cost |
|---|---|---|
| TreeMap (single-threaded) | Simple, O(log n) | Not thread-safe under concurrent add/remove |
| ConcurrentSkipListMap | Thread-safe | Slightly more overhead per op |
| More virtual nodes | Smoother distribution | More memory, slower rebuild on scale events |

## Interview question
"How would you extend this ring to support **weighted servers** — e.g., a beefier node should receive 2x the keys of a standard node?"

> [!question]- Think it through, then expand
> What's the one lever that directly controls how much of the ring a server occupies?

> [!success]- Answer
> Give the beefier server 2x the virtual nodes on the ring (e.g. 300 instead of 150). Since key share is proportional to how much of the ring's hash space a server's virtual nodes cover, doubling its virtual node count roughly doubles its expected share of keys — no change needed to the lookup logic itself, `addServer()` just loops more times for that specific server.

## Key design principle
**A sorted map is often the simplest correct implementation of "find the next thing going clockwise" — don't reach for a custom tree structure when TreeMap already solves it.**

## 30-second challenge
If `virtualNodes` is too low (say, 3), what specific symptom would you see in production metrics that tells you it's a virtual-node problem and not a hashing-algorithm problem?

## Tomorrow
Day 17 (HLD) — CDNs and edge caching: getting content physically closer to users.
