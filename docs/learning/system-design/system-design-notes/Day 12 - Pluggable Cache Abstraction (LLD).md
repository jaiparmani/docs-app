# Day 12 — Pluggable Cache Abstraction (LLD)

<small>3 min read</small>

## What we're learning today
Turning yesterday's 4 caching strategies into swappable Java code — same Strategy Pattern you used for Rate Limiter (Day 6) and Feed Ranking (Day 10).

## Core concept
A `Cache<K,V>` interface with interchangeable implementations. Business code never knows (or cares) whether it's talking to a cache-aside or write-back cache.

## Visual diagram
```
        <<interface>>
           Cache<K,V>
         /      |       \
CacheAsideCache WriteThroughCache WriteBackCache
        \        |        /
         DataStore (DB) + RedisClient
```

## Explanation
```java
interface Cache<K, V> {
    V get(K key);
    void put(K key, V value);
}

class CacheAsideCache<K, V> implements Cache<K, V> {
    private final RedisClient redis;
    private final DataStore<K, V> db;

    public V get(K key) {
        V value = redis.get(key);
        if (value == null) {
            value = db.read(key);
            if (value != null) redis.set(key, value, TTL);
        }
        return value;
    }

    public void put(K key, V value) {
        db.write(key, value);      // DB is source of truth
        redis.invalidate(key);     // let next read repopulate
    }
}

class WriteBackCache<K, V> implements Cache<K, V> {
    private final RedisClient redis;
    private final Queue<K> flushQueue; // background worker drains this

    public void put(K key, V value) {
        redis.set(key, value, TTL);
        flushQueue.offer(key);     // async flush, like NotificationWorker (Day 7)
    }
    public V get(K key) { return redis.get(key); }
}

class CacheFactory {
    static Cache<?, ?> getCache(CacheStrategy strategy) {
        return switch (strategy) {
            case CACHE_ASIDE -> new CacheAsideCache<>();
            case WRITE_BACK  -> new WriteBackCache<>();
        };
    }
}
```
Notice `WriteBackCache` reuses the exact async-worker pattern from your Notification Service — a queue + background drainer. This is a recurring building block, not a one-off.

## Real-world examples
- Spring's `@Cacheable` / `@CachePut` annotations are a production version of this abstraction — swap `CacheManager` beans without touching service code.
- Netflix's EVCache wraps multiple Memcached clusters behind one interface so callers never know about replication topology.

## Interview perspective
This tests **Open/Closed Principle**: can you add a new strategy (e.g., Read-Through with async refresh) without editing existing classes? Interviewers watch whether you hardcode `if (strategy == "cache_aside")` branches into business logic — that's a design smell they're specifically probing for at Senior level.

## Trade-offs
| Concern | Cache-Aside | Write-Back |
|---|---|---|
| Code complexity | Low | Higher (needs flush worker + failure handling) |
| Coupling to DB | App owns fetch logic | Background worker owns it |
| Failure blast radius | Cache down → slower reads | Cache down → **data loss** if unflushed |

## Interview question
"Add a `ReadThroughCache` that lazily refreshes expiring keys in the background before they're requested (avoiding the cold-miss penalty). What changes, and what stays untouched?"

> [!question]- Think it through, then expand
> Where does the refresh logic live, relative to the `Cache<K,V>` interface?

> [!success]- Answer
> What changes: a new `ReadThroughCache` class implementing the same `Cache<K,V>` interface, plus a background scheduler that checks keys nearing TTL expiry and proactively re-fetches them from the DB before a real request ever misses. What stays untouched: the interface itself, and every caller — `CacheFactory` just returns a different implementation, and business code (e.g. `OrderRepository`-style callers) never changes, because it only ever depended on `Cache<K,V>`, never a concrete class. That's the entire point of the abstraction from Day 12's key design principle.

## Key design principle
**Isolate the consistency model behind an interface — the strategy should be a config choice, not a code fork.**

## 30-second challenge
Write just the method signature for `CacheFactory.getCache()` such that strategy selection happens via a config value at startup, not a hardcoded `new` call anywhere in service code.

## Tomorrow
Day 13 (HLD) — Redis internals: why it's single-threaded, eviction policies, and RDB vs AOF persistence.
