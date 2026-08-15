# Day 51 — Multi-Region & Disaster Recovery (HLD)

<small>9 min read</small>

## What we're learning today
Closes the roadmap. Every failure scenario since Day 19 asked "what if this node dies." Today asks the same question at the largest reasonable blast radius: what if an entire AWS region — power, network, everything — goes away. This is where every idea in the roadmap (replication, consensus, CAP, sharding) gets applied at one more level of scale.

## Core concept
**Multi-region architecture** runs a system across geographically separate regions so a single region's total failure doesn't take the whole system down. The two dominant patterns are **active-passive** (one region serves traffic, another stands by, replicated but idle) and **active-active** (multiple regions serve live traffic simultaneously) — the choice is fundamentally a repeat of Day 23's CAP/PACELC trade-off, just at region scale instead of node scale.

## Visual diagram
```
Active-Passive:
  Region A (active): serves 100% of traffic, writes here
  Region B (passive): replicates from A, serves nothing, on standby
  Region A fails -> failover -> Region B promoted to active (some downtime + potential data loss for the failover window)

Active-Active:
  Region A (active): serves traffic for nearby users, accepts writes
  Region B (active): serves traffic for nearby users, accepts writes
  Both regions replicate to each other, asynchronously
  Region A fails -> Region B already serving its own traffic, absorbs A's users too (near-zero downtime,
                     but A's writes since last sync may be lost, and conflicting writes across regions
                     need a resolution strategy)
```

## Explanation
- **This is Day 23's CAP trade-off, one level up.** Active-passive favors consistency (one clear source of truth, the active region) at the cost of failover time and availability during the failover window. Active-active favors availability (both regions always serving) at the cost of consistency (cross-region replication lag means two regions can briefly disagree, and concurrent writes to the same entity in two regions need conflict resolution — the same problem [06-design-uber](../Claude Notes/06-design-uber.md)'s CAS-based driver-status update solved at a single-database scale, now needing a cross-region answer).
- **Failover isn't instant even in active-passive, and that gap matters.** Detecting that a region is genuinely down (not just experiencing a transient blip) takes time — failing over too eagerly on a false signal causes unnecessary disruption (a region "failing over" back and forth is worse than a brief real outage); this detection delay is a direct, deliberate application of [Day 36](Day 36 - Leader Election and Consensus (HLD).md)'s heartbeat-timeout reasoning, just with a much longer timeout given the higher cost of a false positive at region scale.
- **RPO and RTO are the two numbers that actually define a disaster recovery plan**, and they're a direct trade-off against cost and design complexity: **RPO** (Recovery Point Objective) is how much data you can afford to lose (determined by replication lag — async cross-region replication has non-zero RPO by construction); **RTO** (Recovery Time Objective) is how long you can be down during failover. Active-passive with async replication might have RPO of minutes and RTO of tens of minutes; active-active can approach near-zero RTO but still has non-zero RPO for the same reason (replication isn't instant).
- **Data residency and consistency requirements can force the choice, not just performance.** Some data (Day 23's CP-leaning entities — a payment ledger, driver-assignment status) may be unsafe to allow two regions to accept conflicting writes for simultaneously; active-active for *that specific data* might not be a safe choice regardless of availability benefits, echoing [03-design-twitter](../Claude Notes/03-design-twitter.md) and [06-design-uber](../Claude Notes/06-design-uber.md)'s repeated lesson that different entities in the same system legitimately need different consistency treatment — now applied at the region level too, not just within one region.
- **This closes the roadmap's central theme deliberately**: every design in Blocks A–D made a local availability/consistency trade-off for *some specific piece of state*. Multi-region architecture is the same question, asked about the system's geographic footprint instead of its individual data stores — the reasoning tool (name the entity, then choose C or A for it) is identical at every scale from a single Redis key to an entire AWS region.

## Real-world examples
- **DynamoDB Global Tables:** an active-active multi-region offering, using last-writer-wins conflict resolution by default for concurrent cross-region writes to the same item — a concrete, named AWS example of the active-active trade-off, including its conflict-resolution cost, directly relevant to your AWS track.
- **RDS Multi-AZ + cross-region read replicas:** a common active-passive pattern — one primary region handles writes, a standby (often same-region Multi-AZ for fast failover, plus cross-region read replicas for disaster recovery) can be promoted if the primary region fails, trading some RTO for simpler consistency semantics.
- **Netflix's regional failover architecture (publicly documented):** designed to redirect all traffic away from a failing AWS region to healthy ones within minutes — a real, production active-active-leaning system built specifically because a single-region outage at their scale is an unacceptable single point of failure for the whole business.

## Interview perspective
The signal is treating this as a direct extension of Day 23's reasoning rather than a brand-new topic — naming RPO/RTO explicitly, and being able to say *which specific data* in a given design could safely be active-active versus which needs to stay single-region-authoritative (CP), the same entity-by-entity discipline this whole roadmap has repeatedly rewarded. A design that claims "we're multi-region active-active" for *everything*, without qualification, is usually a red flag that the trade-off wasn't actually thought through.

## Trade-offs
| | Active-Passive | Active-Active |
|---|---|---|
| Normal-operation availability | Same as single-region (standby unused) | Higher — traffic served closer to users, redundant capacity always live |
| Failover downtime (RTO) | Minutes to tens of minutes typically | Near-zero — other region already serving |
| Data loss risk (RPO) | Bounded by replication lag to standby | Bounded by replication lag between actives, plus conflict-resolution complexity |
| Implementation/operational complexity | Lower | Higher — conflict resolution, cross-region consistency reasoning required |
| Cost | Lower (standby capacity mostly idle) | Higher (full capacity live in multiple regions) |

## Interview question
"You're designing a system with two entities: a payment ledger and a product catalog. Would you make both active-active across regions, or treat them differently — and why?"

> [!question]- Think it through, then expand
> This is the same "name the entity before naming the choice" discipline from Day 23 — apply it here.

> [!success]- Answer
> Treat them differently. The **product catalog** (browsing, descriptions, prices — read-heavy, tolerant of brief staleness) is a strong active-active candidate: serving it from the nearest region improves latency, and a few seconds of cross-region staleness on a product description is invisible to users, the same AP reasoning as Day 23's activity-feed example. The **payment ledger** is a much worse fit for active-active writes: two regions independently accepting conflicting financial writes and needing to reconcile them after the fact risks real correctness bugs (double-processing, inconsistent balances) that are far more costly than the availability gained. The safer design keeps the ledger's authoritative writes in a single active region (or behind a consensus-based, quorum-writing multi-region setup, not simple async active-active) even if that means accepting more limited availability for that specific entity during a regional failure — exactly the same entity-by-entity CP/AP split this roadmap has applied at every smaller scale, now made explicit at the region level.

## Key design principle
**Multi-region is the same "name the entity, then choose consistency or availability for it" reasoning from Day 23, applied to a system's geographic footprint — there is no single correct multi-region strategy for a whole system, only correct strategies for each piece of state within it.**

## Scenario Practice

**Scenario 1:** A company sets an RPO of 5 minutes and an RTO of 1 hour for their primary database, then configures nightly backups as their only disaster recovery mechanism. Does this meet their stated objectives?

> [!question]- Think it through, then expand
> RPO is about how much data you can afford to lose — does a nightly backup bound that at 5 minutes?

> [!success]- Answer
> No — nightly backups mean that in the worst case (a failure occurring right before the next backup), up to nearly 24 hours of data could be lost, wildly missing a stated 5-minute RPO. A 5-minute RPO requires something closer to continuous or near-continuous replication to a standby (synchronous or tightly-lagged asynchronous replication, per [Day 19 - Database Replication (HLD)](Day 19 - Database Replication (HLD).md)), not periodic backups — this is a common real-world mismatch worth catching explicitly: RPO and RTO are targets that dictate *which mechanism* is required to meet them, they're not just labels you attach after picking a mechanism you already had for other reasons.

**Scenario 2:** A system replicates its primary database to a secondary region synchronously, guaranteeing zero data loss on regional failover. The team is proud of this but hasn't examined the cost. What's the trade-off they're likely not accounting for?

> [!question]- Think it through, then expand
> This day's key design principle borrows the "name the entity, then choose" reasoning from Day 23 — what did choosing zero data loss (synchronous cross-region replication) necessarily cost, applied to geography specifically?

> [!success]- Answer
> Synchronous replication across regions means every write has to wait for acknowledgment from a data center that could be tens or hundreds of milliseconds away purely due to physical distance — the write latency numbers from the estimation chapter's speed-of-light reasoning apply directly here. Every single write in the system now pays that cross-region round trip, all the time, in exchange for zero data loss in the rare event of a regional failure. Whether that's the right trade-off depends entirely on the entity: it might be correct for a financial ledger and clearly wrong for a comments feed, which is exactly why this day's principle insists there's no single correct multi-region strategy for a whole system — only a correct strategy for each piece of state within it, decided the same way CAP choices are decided per entity.

## Roadmap complete
This closes Days 32–51 and, combined with [03-design-twitter](../Claude Notes/03-design-twitter.md) through [10-design-search-autocomplete](../Claude Notes/10-design-search-autocomplete.md), the full path from [Day 31 - Search Systems and Elasticsearch (HLD)](Day 31 - Search Systems and Elasticsearch (HLD).md) onward. Every applied design's forward-referenced prerequisite is now a real note, not a promissory link. A natural next step, now that the full toolkit exists: revisit [03-design-twitter](../Claude Notes/03-design-twitter.md) through [10-design-search-autocomplete](../Claude Notes/10-design-search-autocomplete.md) once more and add an explicit "observability" and "multi-region" consideration to each — the two production-reasoning lenses this block added that weren't available when those notes were first written.
