# Day 14 — LRU Cache From Scratch (LLD)

## What we're learning today
Yesterday you learned Redis approximates LRU eviction. Today you build the real thing — a classic that shows up both as a LeetCode problem (#146) and inside real cache implementations.

## Core concept
LRU needs O(1) `get` and O(1) `put`. A HashMap alone gives O(1) lookup but no ordering. A Linked List alone gives ordering but O(n) lookup. Combine them: **HashMap<Key, Node> + Doubly Linked List** for ordering.

## Visual diagram
```
HashMap: { A -> NodeA, B -> NodeB, C -> NodeC }

Doubly Linked List (most-recent <-> least-recent):
HEAD <-> NodeC <-> NodeA <-> NodeB <-> TAIL
         (MRU)              (LRU - evict this on capacity overflow)
```

## Explanation
```java
class LRUCache<K, V> {
    class Node { K key; V value; Node prev, next; }

    private final int capacity;
    private final Map<K, Node> map = new HashMap<>();
    private final Node head = new Node(), tail = new Node();

    LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    V get(K key) {
        Node node = map.get(key);
        if (node == null) return null;
        moveToFront(node);
        return node.value;
    }

    void put(K key, V value) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            node.value = value;
            moveToFront(node);
            return;
        }
        if (map.size() == capacity) {
            Node lru = tail.prev;
            remove(lru);
            map.remove(lru.key);
        }
        Node node = new Node();
        node.key = key; node.value = value;
        addToFront(node);
        map.put(key, node);
    }

    private void moveToFront(Node n) { remove(n); addToFront(n); }
    private void remove(Node n) { n.prev.next = n.next; n.next.prev = n.prev; }
    private void addToFront(Node n) {
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n;
    }
}
```
Every operation — lookup, move-to-front, evict — is O(1) because pointer manipulation on a doubly linked list never requires traversal.

## Real-world examples
- Redis' `allkeys-lru` uses an **approximated** version (samples a few keys, evicts the oldest among them) — true LRU tracking for millions of keys is too memory-expensive, so production systems trade exactness for speed.
- Java's `LinkedHashMap` with `accessOrder=true` gives you this exact structure built-in — worth knowing for take-home assignments, but implement it manually in interviews since that's the actual ask.

## Interview perspective
This is one of the most common LLD/DSA-crossover questions at every company on your list. Interviewers check: do you reach for HashMap+DLL immediately, or fumble toward O(n) solutions first? They also probe edge cases — updating an existing key's value, capacity of 0 or 1, and whether your `remove`/`addToFront` handle the sentinel head/tail nodes correctly without null-pointer bugs.

## Trade-offs
| Approach | Get | Put | Space |
|---|---|---|---|
| HashMap + DLL (this) | O(1) | O(1) | O(capacity) |
| TreeMap by timestamp | O(log n) | O(log n) | O(capacity) |
| Array + linear scan | O(n) | O(n) | O(capacity) |

## Interview question
"Extend this to an **LFU** (Least Frequently Used) cache — evict by access frequency, not recency, with O(1) operations."

> [!question]- Think it through, then expand
> A single DLL only captures one ordering (recency). LFU needs to order by frequency instead — what structure captures "all keys with frequency N," and how do you find the minimum frequency in O(1)?

> [!success]- Answer
> Use a HashMap of frequency → DLL (a "frequency bucket" for each distinct access count), plus a separate HashMap of key → node for O(1) lookup, plus a tracked `minFrequency` pointer. On access, move a key from its current frequency's DLL to the next frequency's DLL (incrementing its count), and if that emptied the old minimum-frequency bucket, bump `minFrequency` up by one. Eviction removes the tail of the `minFrequency` bucket's DLL. Every operation stays O(1) because you're never scanning to find "the least frequent key" — the `minFrequency` pointer and bucket structure track it directly, the same trick as Day 14's HashMap+DLL avoiding a scan for "the least recently used key."

## Key design principle
**When you need both fast lookup and fast ordering, combine two data structures rather than forcing one to do both jobs.**

## 30-second challenge
Your `put()` for an existing key calls `moveToFront` — but does a `get()` on a key that doesn't exist need to touch the linked list at all? Why does that distinction matter for correctness?

## Tomorrow
Day 15 (HLD) — Consistent Hashing: why `hash(key) % N` breaks the moment you add or remove a server.
