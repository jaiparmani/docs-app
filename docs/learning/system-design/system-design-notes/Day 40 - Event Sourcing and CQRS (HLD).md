# Day 40 — Event Sourcing & CQRS (HLD)

<small>8 min read</small>

## What we're learning today
Every system so far stored **current state** (a row gets updated in place). Today introduces a different model: store the **sequence of events** that led to the current state, and derive state by replaying them. This reframes several things you already know (Day 20's WAL, Day 39's Saga log) as instances of a more general pattern.

## Core concept
**Event Sourcing** stores every state change as an immutable, append-only event instead of overwriting a row — current state is a *derived view*, computed by replaying events, not the source of truth itself. **CQRS** (Command Query Responsibility Segregation) is the natural pairing: writes go through the event log (Commands), while reads are served from one or more separately-optimized, precomputed views (Queries) built by consuming that log.

## Visual diagram
```
Traditional (mutate in place):
  accounts table: {id: 5, balance: 120}
  withdraw 20 -> UPDATE accounts SET balance = 100 WHERE id = 5
  (previous balance history is gone)

Event Sourcing:
  event log: [Deposited(id=5, amt=100), Deposited(id=5, amt=50), Withdrew(id=5, amt=30)]
  current balance = replay all events = 100 + 50 - 30 = 120
  (full history preserved, current state is a computed projection)

CQRS split:
  Writes -> Command handler -> append event to log
  Log -> multiple projections -> "current balance" view (for reads)
                               -> "transaction history" view (for reads)
                               -> "fraud detection" view (for a different consumer)
```

## Explanation
- **You've already built the core mechanism twice.** [Day 20](Day 20 - Write-Ahead Log Implementation (LLD).md)'s WAL is an append-only, replayable log of changes used for crash recovery. [Day 39](Day 39 - Saga Orchestrator Implementation (LLD).md)'s persisted step log is the same idea applied to workflow state. Event Sourcing generalizes this: the log isn't a recovery mechanism *alongside* the real state — the log **is** the real state, and everything else is a derived, rebuildable view.
- **Why this is valuable beyond "we get free audit history":** you can build *multiple* independent projections from the same event log, each optimized for a different read pattern — a "current balance" view, a "monthly statement" view, a "fraud-signal" view — without them interfering with each other or requiring one denormalized table to serve every query shape. This is the direct answer to a recurring tension across this whole roadmap ([03-design-twitter](../Claude Notes/03-design-twitter.md)'s different read/write shapes, [Day 31](Day 31 - Search Systems and Elasticsearch (HLD).md)'s separate search index) generalized into a first-class architectural pattern.
- **CQRS is what makes this practical, not optional.** If reads had to replay the entire event history on every query, this would be unusably slow. CQRS's read side maintains **precomputed projections** (materialized views), updated asynchronously as new events arrive — reads hit the projection, never the raw log. This reintroduces the exact eventual-consistency trade-off from Day 23: the projection can lag the log by some small delay.
- **Rebuilding state is a first-class operation, not a disaster-recovery afterthought.** Because current state is just a replay of events, you can fix a bug in how a projection is computed by deleting the (wrong) projection and replaying the log from scratch to rebuild it correctly — something impossible with mutate-in-place storage, where the "how we got here" information is already gone.
- **The real cost: this is genuinely more complex than CRUD**, and worth naming honestly. Event schemas need to be versioned carefully (old events must remain replayable as the event format evolves), and "what's the current state of X" now always requires either a materialized projection or an explicit replay — there's no simple `SELECT * FROM accounts WHERE id = 5` shortcut.

## Real-world examples
- **Git itself is event-sourced:** the commit log is the append-only event history; your working directory's current file contents are a *derived projection* (the replay of all commits up to HEAD). Checking out an old commit is literally replaying the log to an earlier point.
- **Banking ledgers:** never mutate a balance in place — every deposit/withdrawal is an immutable ledger entry, and "current balance" is computed (or maintained as a running projection) from the full entry history — for the exact audit/compliance reasons this pattern is well suited to.
- **Kafka as an event store:** many event-sourced systems use Kafka's own log (Day 27/28) as the durable event store itself, with consumer applications building their own projections/materialized views off the same topic — Kafka's retention and replay capabilities make it a natural fit, not a coincidence.

## Interview perspective
The signal is recognizing event sourcing as **the same append-only-log idea you've already used twice** (WAL, Saga log), generalized — not a brand-new, unrelated concept to memorize. A strong answer also volunteers the honest cost (schema evolution complexity, no simple point-read shortcut) rather than presenting event sourcing as a strictly-better replacement for CRUD — it's a deliberate trade for specific benefits (audit history, multiple independent projections, rebuildability), not a universal upgrade.

## Trade-offs
| | Traditional (mutate in place) | Event Sourcing + CQRS |
|---|---|---|
| History/audit trail | Lost on update, unless explicitly logged separately | Free — it's the storage model itself |
| Multiple read-optimized views | Requires separate ETL/sync pipelines, bolted on | Natural — just another projection off the same log |
| Query simplicity | Simple point reads | Requires a materialized projection; no ad-hoc point read against the raw log |
| Implementation/operational complexity | Lower, well-understood | Higher — schema evolution, projection rebuild tooling, eventual consistency to reason about |

## Interview question
"A projection ('current balance per account') has a bug that's been computing balances incorrectly for the last month. How do you fix it, and what does Event Sourcing give you here that a traditional mutate-in-place system wouldn't?"

> [!question]- Think it through, then expand
> What does a traditional system have left to recover from, versus what an event-sourced system has?

> [!success]- Answer
> Fix the projection's computation logic, then **delete the incorrect projection and rebuild it by replaying the full event log from the beginning** — the corrected logic runs against the same immutable, complete history, producing correct balances for every account, including the past month. A traditional mutate-in-place system has no equivalent recovery path: the intermediate states that led to today's (wrong) balances were already overwritten and destroyed by every update since — there's no "true history" left to recompute from, only whatever the current (buggy) balance happens to be. This replay-to-fix capability is one of Event Sourcing's most concrete, non-obvious practical benefits.

## Key design principle
**Storing the sequence of changes instead of just the current value turns "state" from a fixed fact into a derived, rebuildable computation — which is what makes multiple independent views and retroactive bug fixes possible in the first place.**

## 30-second challenge
If an event's *schema* changes (e.g. a `Withdrew` event gains a new required `reason` field), what has to be true about how old events (recorded before the schema change) are still replayed correctly?

## Scenario Practice

**Scenario 1:** An event-sourced account has accumulated 500,000 events over several years. Every time the system needs the current balance, it replays all 500,000 events from the beginning. What's the practical problem, and what's the standard fix?

> [!question]- Think it through, then expand
> Does "storing the sequence of changes" mean every read has to recompute from the very first event, forever?

> [!success]- Answer
> Replaying the full history on every read gets slower as the event log grows without bound, which eventually makes normal reads impractically slow — this is a real operational cost of event sourcing, not a hypothetical one. The standard fix is **snapshotting**: periodically persist the computed current state (e.g., every 1,000 events) alongside the log, so a read only needs to load the most recent snapshot and replay events *since* that snapshot, not from the beginning of time. This doesn't compromise the core value of event sourcing (the full history remains available for audit or replay from any point) — it just avoids paying the full replay cost on every single read.

**Scenario 2:** With CQRS, a write updates the event log, and a separate read model (optimized for queries) is updated asynchronously afterward. A user submits a change and immediately queries the read model, but sees their old data. Is this a bug?

> [!question]- Think it through, then expand
> Is the read model kept in sync with the write side synchronously or asynchronously — and where have you seen this exact shape before in this roadmap?

> [!success]- Answer
> Expected behavior, not a bug, under the standard CQRS pattern — the read model is a derived projection updated asynchronously after the write lands in the event log, so there's an inherent lag, structurally identical to [replication lag](Day 19 - Database Replication (HLD).md) between a primary and a read replica. If "read your own write" is a hard requirement for this specific interaction, the fix is the same as in the replication case: route that particular read to a source that's guaranteed current (query the event log or write model directly) for a short window after the user's own write, rather than eliminating the async read-model pattern everywhere, which would give up the query-optimization benefit CQRS exists to provide.

## Tomorrow

Day 41 (LLD) — build the actual append-only event store and replay logic underlying today's concept: how events are appended, read back in order, and folded into a projection.
