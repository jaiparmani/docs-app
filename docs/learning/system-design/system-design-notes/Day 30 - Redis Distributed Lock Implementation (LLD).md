# Day 30 — Redis Distributed Lock Implementation (LLD)

<small>4 min read</small>

## What we're learning today
Coding yesterday's Redis lock correctly — including the unique-token release pattern that prevents the classic "deleted someone else's lock" bug.

## Core concept
Acquire with `SET NX PX` (atomic, TTL-bound). Release with a Lua script that atomically checks ownership before deleting — never a plain `DEL`.

## Visual diagram
```
acquire("order-123", token=uuid, ttlMs=10000)
   -> SET lock:order-123 uuid NX PX 10000
   -> returns true if acquired, false if already locked

release("order-123", token=uuid)
   -> Lua script (atomic):
        if redis.call("GET", key) == token then
            return redis.call("DEL", key)
        else
            return 0   -- not our lock anymore, do nothing
        end
```

## Explanation
```java
class RedisDistributedLock {
    private final RedisClient redis;

    private static final String RELEASE_SCRIPT =
        "if redis.call('get', KEYS[1]) == ARGV[1] then " +
        "  return redis.call('del', KEYS[1]) " +
        "else return 0 end";

    String tryLock(String resourceKey, long ttlMs) {
        String token = UUID.randomUUID().toString();
        boolean acquired = redis.set(
            "lock:" + resourceKey, token,
            SetOptions.NX().PX(ttlMs)   // atomic: only set if absent, with TTL
        );
        return acquired ? token : null;
    }

    boolean unlock(String resourceKey, String token) {
        Object result = redis.eval(RELEASE_SCRIPT,
            List.of("lock:" + resourceKey), List.of(token));
        return Long.valueOf(1).equals(result);
    }
}

// Usage — e.g. inside the Idempotency Interceptor from Day 24:
class CriticalSection {
    void runExclusively(String resourceKey, Runnable work) {
        String token = lock.tryLock(resourceKey, 10_000);
        if (token == null) throw new LockNotAcquiredException();
        try {
            work.run();
        } finally {
            lock.unlock(resourceKey, token); // safe — only deletes if we still own it
        }
    }
}
```
Why the Lua script matters: `GET` then `DEL` as two separate calls isn't atomic — another process could acquire the lock in the gap between your `GET` check and your `DEL` call. Lua scripts execute atomically inside Redis's single-threaded engine (Day 13) — the entire check-and-delete happens as one indivisible operation.

## Real-world examples
- **Redisson** (a popular Java Redis client) implements this exact pattern plus automatic lock-extension ("watchdog") — periodically renewing the TTL while the holder is still alive, addressing the "critical section outlives TTL" problem flagged yesterday.
- **Distributed cron/batch coordination:** exactly this lock, wrapping `runExclusively()` around "process today's batch," so a fleet of 10 instances doesn't all run the same job.

## Interview perspective
Interviewers specifically probe whether you know `DEL` alone is unsafe — it's a very common (and very buggy) real-world mistake. Bringing up the Lua-script-based atomic release without being prompted is a strong signal you've actually operated distributed locks, not just read about them.

## Trade-offs
| Design choice | Benefit | Cost |
|---|---|---|
| Plain `DEL` release | Simpler code | Unsafe — can delete another holder's lock |
| Lua script + token | Correct under races | Slightly more code, still Redis-only guarantees (Day 29's caveats apply) |
| Add watchdog/heartbeat extension | Survives long critical sections | More moving parts, more failure modes to reason about |

## Interview question
"Add a watchdog that extends the lock's TTL every 3 seconds while `work.run()` is still executing. What happens if the watchdog itself fails to renew in time — walk through the failure mode."

> [!question]- Think it through, then expand
> The watchdog is itself just another piece of code that can be delayed or fail — what does that mean for the guarantee it's supposed to provide?

> [!success]- Answer
> If the watchdog thread is delayed (e.g. by a GC pause, thread starvation, or a network blip to Redis) and misses its renewal window before the TTL expires, the lock expires exactly as if there were no watchdog at all — a second node can then acquire it and start executing concurrently with the first, which is still doing its own work under the mistaken belief it still holds the lock. This is precisely Day 29's "TTL alone isn't fully safe" caveat resurfacing even with a watchdog: the watchdog reduces the *likelihood* of premature expiry under normal conditions, but doesn't eliminate it, because the watchdog's own timely execution is not itself guaranteed — a real limitation worth stating explicitly rather than presenting the watchdog as a complete fix.

## Key design principle
**Never split a check-then-act sequence across two non-atomic calls when correctness depends on it — use a script/transaction to make it one atomic operation.**

## 30-second challenge
Why does `tryLock` generate a fresh UUID *per call* rather than reusing a fixed token per resource — what specific bug would reusing a fixed token introduce?

## Tomorrow
Day 31 (HLD) — Search Systems: how Elasticsearch's inverted index makes full-text search fast, and how it shards/scores results.
