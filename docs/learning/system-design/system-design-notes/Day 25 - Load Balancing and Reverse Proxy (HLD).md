# Day 25 — Load Balancing & Reverse Proxy (HLD)

## What we're learning today
You've referenced "Load Balancer" since Day 3 without unpacking it. Today: L4 vs L7, and the algorithms deciding which backend gets each request.

## Core concept
A load balancer distributes incoming traffic across multiple backend servers. **Layer 4 (transport)** balances based on IP/port only — fast, protocol-agnostic. **Layer 7 (application)** inspects HTTP content (headers, cookies, URL path) — smarter routing, more overhead.

## Visual diagram
```
                     Client
                       |
              [Load Balancer / Reverse Proxy]
               /         |          \
          Server A    Server B    Server C

L4: routes by IP/port, doesn't see HTTP content
L7: reads Host header/path/cookie -> can route
    /api/video -> video-service
    /api/chat  -> chat-service
```

## Explanation
- **L4 load balancing:** operates on TCP/UDP packets. Doesn't decrypt or inspect HTTP. Extremely fast, low overhead — used when you just need raw distribution (e.g., in front of a homogeneous fleet).
- **L7 load balancing (reverse proxy):** terminates HTTP/TLS, reads the request, and can route based on path, header, or cookie — enabling microservice routing (`/api/orders` → order-service), A/B testing via headers, and session affinity via cookies. Costs more CPU (TLS termination, header parsing) but is what you need for anything beyond "any server will do."
- **Algorithms:**
  - **Round Robin:** cycle through servers in order — simple, assumes uniform request cost and uniform server capacity (often false).
  - **Least Connections:** route to the server currently handling the fewest active connections — better for uneven request durations (e.g., some requests are slow video processing, others instant).
  - **Consistent Hashing (Day 15) at the LB layer:** route the same client/session to the same backend repeatedly — needed for **sticky sessions** (in-memory session state) or to maximize cache-hit rate on that backend.
  - **Weighted variants:** give bigger servers a higher share, same principle as weighted virtual nodes (Day 16).

## Real-world examples
- **AWS ALB** = L7 (path-based routing across microservices). **AWS NLB** = L4 (raw TCP throughput, used for extreme scale or non-HTTP protocols).
- **NGINX** commonly runs as an L7 reverse proxy for routing + TLS termination in front of a Java/Spring Boot fleet — likely already in your JPMC stack.
- **Netflix's Zuul / Spring Cloud Gateway** — L7 gateway with dynamic routing rules per microservice, plus circuit breaking (Day 26 preview) built in.

## Interview perspective
Interviewers check if you know *when* to reach for L7 vs L4 — "just put a load balancer in front" without specifying the layer is a shallow answer. They'll also probe: "what happens to the load balancer itself — is it a single point of failure?" (Answer: LBs are typically deployed in active-passive or active-active pairs with a floating IP / DNS-based failover — the LB needs its own redundancy story.)

## Trade-offs
| | L4 | L7 |
|---|---|---|
| Speed | Faster, lower overhead | Slower (TLS termination, parsing) |
| Routing intelligence | None (IP/port only) | Path/header/cookie-based |
| Use case | Raw throughput, non-HTTP | Microservice routing, sticky sessions |

## Interview question
"Design load balancing for a video streaming service where video processing requests take 30s+ but metadata requests take 10ms. Which algorithm, and why does Round Robin actively hurt you here?"

> [!question]- Think it through, then expand
> Round Robin's assumption is "every request costs about the same" — is that true here?

> [!success]- Answer
> Least Connections is the right fit. Round Robin ignores request cost entirely — it just cycles through servers in order, so a server can easily get handed three slow 30-second video-processing requests in a row purely by rotation timing, while another server sits idle after finishing its quick metadata requests. Least Connections routes to whichever server currently has the fewest active connections, which naturally accounts for request duration: a server tied up with a long-running video job looks "busy" and gets skipped for new requests until it frees up, exactly the adaptive behavior this uneven-cost workload needs.

## Key design principle
**Choose the load-balancing layer based on how much routing intelligence you need — L4 for raw speed, L7 the moment you need to look inside the request.**

## 30-second challenge
Your Feed Ranking Engine (Day 9-10) needs sticky sessions for an A/B experiment cohort. Which LB algorithm enables that, and how does it connect to something you built on Day 16?

## Tomorrow
Day 26 (LLD) — implementing a **Circuit Breaker** state machine, the resilience pattern that protects your load-balanced fleet from cascading failures.
