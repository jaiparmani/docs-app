# Day 32 — API Gateway & Service Discovery (HLD)

<small>6 min read</small>

## What we're learning today
Everything from Day 11–31 assumed "the client talks to the app server" as a given. Once you have more than a handful of services, two new questions appear: what does the client actually talk to, and how does one service find another? This day answers both, and sets up the vocabulary the rest of Block A/B leans on.

## Core concept
An **API Gateway** is the single entry point clients talk to — it terminates the client connection, then routes to the right internal service. **Service discovery** is how a gateway (or any service) finds the current network location of another service, given that instances scale up/down and get replaced constantly, so a hardcoded IP list is never correct for long.

## Visual diagram
```
Client -> API Gateway -> [routing, auth, rate limiting] -> Service A (3 instances)
                                                          -> Service B (5 instances)

Service Registry (source of truth: "who's alive, where")
  Service A: [10.0.1.4:8080, 10.0.1.9:8080, 10.0.2.1:8080]
  Service B: [10.0.3.2:8080, ...]

Gateway asks Registry -> picks an instance -> forwards request
```

## Explanation
- **Why not let clients call services directly:** every client would need to know every service's address, handle auth per-service, and re-implement rate limiting/retries per client. The gateway centralizes cross-cutting concerns (auth, [load balancing](Day 25 - Load Balancing and Reverse Proxy (HLD).md), rate limiting from [01-rate-limiter](../Claude Notes/01-rate-limiter.md)) in one place instead of duplicating them everywhere.
- **Service registry, two patterns:**
  - *Client-side discovery:* the caller queries the registry itself, then picks an instance and calls it directly (Netflix Eureka style). Fewer network hops, but every caller needs registry-aware logic.
  - *Server-side discovery:* the caller always calls a fixed address (e.g. the gateway or a load balancer), which queries the registry on the caller's behalf (Kubernetes Service, AWS ELB style). Simpler callers, one more hop.
- **Health checks are what make the registry trustworthy:** an instance that crashed but never deregistered is worse than useless — it's a routing target that will fail every request sent to it. Registries rely on active health checks or heartbeats (same TTL/lease idea as [Day 30](Day 30 - Redis Distributed Lock Implementation (LLD).md)'s lock expiry) to evict dead instances automatically.
- **Gateway vs. plain load balancer:** a load balancer ([Day 25](Day 25 - Load Balancing and Reverse Proxy (HLD).md)) picks *which instance* of one service to hit. A gateway additionally decides *which service* to route to based on the request path/host, and layers in auth, rate limiting, request transformation — a superset of a load balancer's job, not a replacement for it.

## Real-world examples
- **Kubernetes:** a `Service` object is a built-in registry + server-side discovery mechanism — pods register automatically, `kube-proxy` routes to healthy pods only.
- **Netflix's original microservices stack:** Eureka (registry) + Ribbon (client-side load balancing) — the client-side discovery pattern by name.
- **AWS API Gateway + ALB:** API Gateway handles routing/auth/throttling at the edge; target groups behind an ALB handle instance-level health checks and load balancing — the two concerns split across two AWS services, mirroring the gateway-vs-load-balancer distinction above.

## Interview perspective
Weak answers treat "API Gateway" as a magic box that "handles routing." The signal is naming the specific cross-cutting concerns it centralizes (auth, rate limiting, request routing, sometimes response transformation/aggregation) and being able to say what happens when a service instance dies mid-traffic — health checks evict it from the registry, in-flight requests to it fail and get retried elsewhere ([tomorrow's topic](Day 33 - Retry Backoff and Bulkhead Patterns (LLD).md)), new requests never get routed to it again.

## Trade-offs
| | Client-side discovery | Server-side discovery (gateway/LB) |
|---|---|---|
| Extra network hop | No | Yes (through gateway/LB) |
| Caller complexity | Higher (registry-aware) | Lower (calls a fixed address) |
| Centralized policy (auth, rate limit) | Harder — logic duplicated per caller | Easy — one place |

## Interview question
"A new instance of Service A just started but hasn't passed its first health check yet. Should the registry route traffic to it?"

> [!question]- Think it through, then expand
> Consider what happens if you route to it too early, versus what the cost is of waiting.

> [!success]- Answer
> No — route only after the first successful health check. Routing to an instance before it's confirmed healthy risks sending live traffic to something still initializing (e.g. still loading a cache, not yet connected to its DB) — those requests fail. The cost of waiting one health-check interval is small and bounded; the cost of routing early is unpredictable request failures. This is the same "don't trust unconfirmed state" instinct as waiting for a quorum ack in replication (Day 19), applied to instance readiness instead of write durability.

## Key design principle
**The registry is a source of truth about liveness, not intent — an instance that hasn't proven it's healthy yet is treated identically to one that's down.**

## 30-second challenge
Service discovery assumes the registry itself is highly available. What happens to routing if the registry goes down — and which of Day 23's CAP categories does a service registry usually fall into?

## Scenario Practice

**Scenario 1:** A newly deployed service instance registers itself with the service registry immediately on startup, before it's finished loading its configuration and warming its cache. What happens to the first few requests routed to it, and how should registration actually be sequenced?

> [!question]- Think it through, then expand
> This day's key design principle distinguishes liveness from intent — is "the process has started" the same thing as "the process is ready to serve traffic"?

> [!success]- Answer
> The first requests routed to it will likely fail or be slow, because the registry only knows the process exists, not that it's actually ready — registration should happen only after a readiness check passes (config loaded, cache warmed, dependencies reachable), not the instant the process boots. This is the gap between "started" and "healthy" the key design principle is pointing at: a naive registry that trusts self-reported liveness the moment a process comes up will route real traffic into a not-yet-ready instance, which is a self-inflicted version of exactly the failure this day's architecture exists to prevent.

**Scenario 2:** The API gateway itself goes down. What happens to the entire system, and what does this tell you about how the gateway should be deployed?

> [!question]- Think it through, then expand
> Everything in this day's design routes through the gateway — what does that make it, architecturally?

> [!success]- Answer
> If there's only one gateway instance, its failure takes down every service behind it — it's a single point of failure for the whole system, exactly the shape called out in the interview framework's deep-dive chapter. The fix is the same as for any other stateless-ish component in this roadmap: run multiple gateway instances behind a load balancer ([Day 25 - Load Balancing and Reverse Proxy (HLD)](Day 25 - Load Balancing and Reverse Proxy (HLD).md)), so no single instance failing takes the front door down with it. The gateway centralizing auth and routing (this day's core concept) is valuable specifically because it simplifies every service behind it — but that centralization only pays off if the gateway layer itself is built to survive losing any one instance.

## Tomorrow

Day 33 (LLD) — Retry, Backoff, and Bulkhead patterns: what a gateway/caller actually does when a downstream instance (found via today's discovery mechanism) starts failing.
