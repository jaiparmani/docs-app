---
tags: [system-design, roadmap]
---

# Day-by-Day Roadmap — Day 32 Onward

<small>5 min read</small>

Continues [Day 31 - Search Systems and Elasticsearch (HLD)](system-design-notes/Day 31 - Search Systems and Elasticsearch (HLD).md) and [03-design-twitter](Claude Notes/03-design-twitter.md). Same pattern as Days 11–31: an **HLD day** (the concept, the trade-off, why it exists) paired with an **LLD day** (build/trace the actual mechanism), then periodic **Applied Design** checkpoints that force you to combine several days into one real interview-shaped system — same role [03-design-twitter](Claude Notes/03-design-twitter.md) just played for Days 11–31.

Order is deliberate: each block only starts once its prerequisites exist. Don't skip ahead to Uber before geospatial indexing exists, or to Chat before you've done real-time connection scaling — the applied days are where gaps actually surface.

## Block A — Finishing Resilience & Delivery Semantics
*You have circuit breakers (Day 26) and idempotency (Day 24). This block completes "what happens on failure/retry" before you touch consensus.*

| Day | Type | Topic | Why here |
|---|---|---|---|
| 32 | HLD | API Gateway & Service Discovery | Ties Load Balancing (25) into how microservices actually find each other — needed context for everything after |
| 33 | LLD | Retry, Backoff & Bulkhead patterns | Completes the resilience trio started by Circuit Breaker (26) |
| 34 | HLD | Delivery Semantics: at-most-once vs at-least-once vs exactly-once | Formalizes what Idempotency (24) and Kafka (28) already implied but never named directly |
| 35 | LLD | Bloom Filters | Classic building block for cache-miss avoidance and dedup — small, concrete, high reuse value |
| **Applied 04** | — | **Design a Notification/Push System** | Reuses Design Twitter's fan-out (03) + this block's delivery semantics (34) + idempotency (24). This was literally flagged as the next step at the end of [03-design-twitter](Claude Notes/03-design-twitter.md). |

## Block B — Coordination & Distributed Systems Seniority
*This is the block the Syllabus calls "where seniority begins." Distributed Locks (29/30) is the natural on-ramp.*

| Day | Type | Topic | Why here |
|---|---|---|---|
| 36 | HLD | Leader Election & Consensus (Raft/Paxos intuition) | Direct extension of Distributed Locks (29) — locks assume a coordinator; this is how you get one without a single point of failure |
| 37 | LLD | Trace/implement a toy Raft leader election (heartbeats, term numbers) | Makes "consensus" concrete instead of a vocabulary word |
| 38 | HLD | Distributed Transactions: 2PC vs Saga | The multi-service version of the atomicity problem — connects back to CAP (23) |
| 39 | LLD | Saga orchestrator with compensating transactions | Implementation of Day 38's more practical answer (Saga over 2PC in most real systems) |
| 40 | HLD | Event Sourcing & CQRS | Reframes "state" as a log of events — directly reusable in Kafka (28) and WAL (20) terms you already have |
| 41 | LLD | Append-only event store / replay logic | Concrete version of Day 40 |
| **Applied 05** | — | **Design a Distributed Job Scheduler** | Reuses Leader Election (36/37), Distributed Locks (29/30), Idempotency (24) — a genuinely hard applied problem once, not before, this block exists |

## Block C — Storage Internals & Geospatial
*Object storage ties directly into your AWS track (S3). Geospatial is the one prerequisite Uber-style problems need that nothing so far has covered.*

| Day | Type | Topic | Why here |
|---|---|---|---|
| 42 | HLD | Object/Blob Storage Internals (erasure coding vs replication, chunking) | Direct bridge to your AWS S3 knowledge — same trade-offs, different vocabulary |
| 43 | LLD | Multipart/chunked upload implementation | Concrete version of Day 42 |
| 44 | HLD | Geospatial Indexing (geohash, quad-trees) | Missing prerequisite for any location-based applied design |
| 45 | LLD | Geohash proximity search implementation | Concrete version of Day 44 |
| **Applied 06** | — | **Design Uber (ride-hailing / driver matching)** | Reuses Geospatial (44/45), Consistent Hashing (15/16), Distributed Locks (29/30) for driver-assignment races |

## Block D — Real-Time Communication & Media
*Chat and video are both "Day 23's 30-second challenge" made real — message delivery vs. presence/read-receipts as different CAP choices in the same system.*

| Day | Type | Topic | Why here |
|---|---|---|---|
| 46 | HLD | WebSockets, Long Polling, SSE — connection scaling | New primitive: previous systems were request/response, this is long-lived state per connection |
| 47 | LLD | Connection/session management at scale (sticky sessions, presence) | Concrete version of Day 46 |
| **Applied 07** | — | **Design a Chat System (WhatsApp-style)** | Directly answers Day 23's open question: message delivery is CP-leaning, read receipts/presence are AP — now you can actually justify both in one design |
| 48 | HLD | Video Streaming Fundamentals (chunking, adaptive bitrate, CDN reuse) | Reuses CDN/Edge Caching (17) for a new content type |
| 49 | LLD | Chunked upload + transcoding pipeline sketch | Concrete version of Day 48 |
| **Applied 08** | — | **Design YouTube (upload + streaming)** | Combines Day 48/49 with Object Storage (42/43) and CDN (17) |

## Block E — Production Reasoning & Capstones
*Everything above was "how do I build the system." This closes with "how do I know it's working, and what happens when a whole region dies" — the production-judgment layer the whole roadmap has been building toward.*

| Day | Type | Topic | Why here |
|---|---|---|---|
| 50 | HLD | Observability: metrics, logging, distributed tracing | The question "where's the bottleneck / what failed" needs tooling, not just architecture |
| 51 | HLD | Multi-region & active-active architectures, disaster recovery | Closes "what happens when the network partitions" at the region level, not just the node level |
| **Applied 09** | — | **Design a News Feed (Instagram-style)** | Same fan-out skeleton as Design Twitter (03), plus a ranking layer — shows you what changes and what doesn't when chronological becomes algorithmic |
| **Applied 10** | — | **Design Search Autocomplete** | Trie-based, contrasts directly with Elasticsearch's inverted index (31) and B-Trees (18) — a good note to close on since it forces you to say *why* neither of those two structures is the right fit here |

## How to use this
- Keep the HLD→LLD pairing — the LLD day is where "I understand the concept" becomes "I could actually build this," and that gap is usually where interview answers fall apart.
- Don't do an Applied day until every prerequisite day in its row is done — that's the point of the ordering.
- If a day feels too easy given what you already know, that's a signal to skip straight to its Applied checkpoint rather than pad it out artificially.

## Related
[Syllabus](Syllabus.md) · [Requirement Gathering checklist](Requirement Gathering checklist.md) · [03-design-twitter](Claude Notes/03-design-twitter.md) · [Day 31 - Search Systems and Elasticsearch (HLD)](system-design-notes/Day 31 - Search Systems and Elasticsearch (HLD).md)
