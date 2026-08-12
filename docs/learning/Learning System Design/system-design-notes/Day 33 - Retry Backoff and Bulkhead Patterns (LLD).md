# Day 33 — Retry, Backoff & Bulkhead Patterns (LLD)

## What we're learning today
Day 26 gave you the circuit breaker — the "stop calling a failing dependency" pattern. Today fills in the two patterns that sit around it: what to do *before* the breaker trips (retry/backoff) and how to stop one failing dependency from starving resources needed by healthy ones (bulkhead).

## Core concept
**Retry with backoff** handles transient failures by trying again after an increasing delay. **Bulkheading** isolates resource pools (threads, connections) per dependency, so one slow/failing dependency can't exhaust resources the rest of your system needs.

## Visual diagram
```
Retry with exponential backoff + jitter:
  attempt 1: fail -> wait ~100ms
  attempt 2: fail -> wait ~200ms + random(0-50ms)
  attempt 3: fail -> wait ~400ms + random(0-100ms)
  attempt 4: give up, surface error

Bulkhead:
  Thread pool for Service A calls: [T1 T2 T3 T4]   <- isolated
  Thread pool for Service B calls: [T1 T2 T3 T4]   <- isolated
  Service A hangs -> its 4 threads block -> Service B's 4 threads still free
  (vs. one shared pool: Service A hanging can consume ALL threads, starving B too)
```

## Explanation
- **Naive retry is dangerous:** retrying immediately on failure, especially from many clients at once, can turn a struggling dependency into a fully dead one — every client hammering it harder right when it's least able to cope. This is called a **retry storm**.
- **Exponential backoff** spaces out retries so load on the recovering dependency decreases over time instead of staying constant or increasing.
- **Jitter (randomization) is not optional at scale:** if every client backs off on the exact same schedule (e.g. all wait exactly 200ms), they all retry **simultaneously** again — synchronized retries recreate the exact spike you were trying to avoid. Adding random jitter to each client's wait time spreads retries out in time.
- **Bulkhead's name comes from ship design:** a ship's hull is divided into watertight compartments so one breach doesn't sink the whole ship. Applied to software: give each downstream dependency its own bounded resource pool (thread pool, connection pool, or a semaphore limiting concurrent calls), so a hung dependency can only exhaust *its own* pool, not the shared pool every other call also needs.
- **How these three patterns actually compose:** retry/backoff handles a single transient failure; the circuit breaker (Day 26) stops retrying entirely once failures are sustained, not transient; bulkheading limits the blast radius while both of those are happening. None of the three replaces the others.

## Real-world examples
- **AWS SDKs:** every AWS SDK implements exponential backoff with jitter by default for throttled/transient API errors — you don't write this yourself when calling AWS services, it's baked in specifically because retry storms against shared AWS infrastructure are a known, real failure pattern.
- **Netflix Hystrix (the library that popularized these patterns):** implemented bulkheading via per-dependency thread pools specifically so one degraded microservice couldn't starve the request-handling threads needed for unrelated calls.
- **Your Notification System ([[04-design-notification-system]]):** per-channel worker pools (push/email/SMS) *are* a bulkhead — a slow SMS provider can't consume push notification workers, because they were never in the same pool.

## Interview perspective
The differentiator here is knowing retries need **jitter**, not just backoff — candidates who say "exponential backoff" and stop are giving half the answer; the synchronized-retry failure mode is what interviewers are actually checking for. Bulkheading is the answer to "a dependency is hanging (not erroring, just slow) — what protects the rest of the system?", a subtly different failure mode than the outright failures a circuit breaker reacts to.

## Trade-offs
| | Retry+backoff | Circuit breaker | Bulkhead |
|---|---|---|---|
| Reacts to | A single failed call | Sustained failure rate | Resource exhaustion risk |
| Cost of applying too aggressively | Retry storms, wasted load | False trips on brief blips | Under-utilized capacity if pools too small |
| Applies even when the dependency is healthy | Yes (any transient blip) | No (only kicks in on sustained failure) | Always active, structural |

## Interview question
"A downstream payment service starts responding slowly (not erroring, just 10x normal latency). Your circuit breaker's failure-rate threshold hasn't tripped because requests are technically succeeding, just slow. What actually protects the rest of your system right now?"

> [!question]- Think it through, then expand
> The circuit breaker isn't the mechanism doing the protecting here — what is?

> [!success]- Answer
> Bulkheading. Since requests are succeeding (just slowly), the circuit breaker's failure-rate trigger doesn't fire — from its perspective, nothing is wrong yet. What actually limits the damage is that the payment service's calls are confined to their own bounded thread/connection pool: those threads sit blocked waiting on the slow calls, but every other dependency's calls run in separate pools, unaffected. Without bulkheading, a shared thread pool would eventually be fully consumed by slow payment calls, and *unrelated* requests (that don't even touch payments) would start failing due to thread starvation — a single slow dependency taking down the whole system.

## Key design principle
**Retry, circuit breaking, and bulkheading protect against three different failure shapes (transient blips, sustained failure, and resource starvation) — having only one of the three leaves the other two failure shapes unhandled.**

## 30-second challenge
If retries aren't idempotent-safe on the calling side (Day 24), what specifically goes wrong when a request times out, gets retried, but the original request actually succeeded server-side just after the timeout?

## Tomorrow
Day 34 (HLD) — Delivery Semantics: formalizes exactly the "what if the retried request actually succeeded" question above into the at-most-once / at-least-once / exactly-once vocabulary you've been using informally since Day 24.
