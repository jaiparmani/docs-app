# Day 41 — Event Store & Replay, Implemented (LLD)

<small>6 min read</small>

## What we're learning today
Closes Block B. Day 40 explained why you'd want an event-sourced model. Today builds the two operations that actually make it work: appending events safely, and folding them into a projection efficiently — including the one optimization every real event-sourced system needs (snapshots) once history gets long.

## Core concept
An **event store** supports exactly two core operations: **append** (durably add a new event to a specific stream, e.g. one per account/entity) and **read** (fetch events for a stream, in order, from some starting point). A **projection** is built by folding (reducing) a stream of events into a current-state value; a **snapshot** is a periodically-saved projection result, so replay doesn't have to start from event zero every time.

## Visual diagram
```
Stream "account-5": [v1: Opened(bal=0), v2: Deposited(100), v3: Deposited(50), v4: Withdrew(30)]

Naive replay for current state: fold all 4 events -> balance = 120

With a snapshot at v2 (balance=100, saved):
  replay only v3, v4 on top of the snapshot -> 100 + 50 - 30 = 120
  (skipped replaying v1, v2 entirely)

Append (concurrency-safe):
  append(stream="account-5", event=Withdrew(30), expected_version=3)
  -> store checks: is stream currently at version 3? yes -> append as v4, succeed
  -> if another writer already appended v4 first: expected_version mismatch -> reject, caller retries
```

## Explanation
- **Append must be concurrency-safe using the same optimistic-concurrency idea as any concurrent-write problem you've handled before** ([Day 20](Day 20 - Write-Ahead Log Implementation (LLD).md)'s log ordering, [Day 24](Day 24 - Idempotency Keys (LLD).md)'s safe retries): the caller states the version it expects the stream to be at; if another writer already appended an event in between (version mismatch), the append is rejected and the caller re-reads the latest state and retries — this is what prevents two concurrent writers from both successfully appending "version 4," which would silently corrupt the stream's ordering.
- **Streams are partitioned per entity, not global.** Each account (or order, or user) has its own stream — this bounds replay cost to one entity's history, not the whole system's, and gives you a natural sharding key (Day 21) if the event store itself needs to scale horizontally.
- **Snapshots exist purely as a performance optimization, not a correctness requirement.** The event log alone is always sufficient to derive correct current state — a snapshot is just a cached "fold result as of event N," so replay only has to process events *after* the snapshot instead of from the beginning. This is conceptually identical to a materialized view's role in CQRS (Day 40): a precomputed shortcut, always re-derivable from the source of truth if it's ever lost or found to be wrong.
- **Snapshot cadence is a tunable trade-off**, same shape as any cache-freshness decision: snapshot every N events (or every T time) — too infrequent and replay stays expensive; too frequent and you're paying snapshot-write cost for little benefit, since replaying a handful of recent events was already cheap.
- **Reading a stream is always ordered and resumable from a version/offset** — this is what lets a projection-builder crash and resume from "the last event I successfully processed" rather than reprocessing everything, the same offset-tracking discipline as a Kafka consumer (Day 28).

```
pseudocode:
function append(stream_id, event, expected_version):
    current_version = store.getVersion(stream_id)
    if current_version != expected_version:
        raise ConcurrencyConflict  # caller re-reads and retries
    store.appendRaw(stream_id, event, version=current_version+1)

function getCurrentState(stream_id):
    snapshot = store.getLatestSnapshot(stream_id)  # {version, state} or none
    start_version = snapshot.version if snapshot else 0
    state = snapshot.state if snapshot else initialState()
    events = store.readEvents(stream_id, from_version=start_version+1)
    for event in events:
        state = apply(state, event)   # the "fold"
    return state
```

## Real-world examples
- **EventStoreDB:** a database purpose-built exactly around this append/read/snapshot model, with per-stream optimistic concurrency control identical to the pseudocode above.
- **Kafka-backed event sourcing (common in practice):** a Kafka topic partitioned by entity ID serves as the stream; partition-level ordering (Day 28) gives you the per-entity ordering guarantee for free, and consumer offset tracking gives you resumable replay for free — a case where two systems you already know (Kafka's partitioning and consumer model) directly implement this day's requirements without needing a specialized event-store product.
- **Version-controlled document editors (e.g. collaborative editing history):** "current document" is a fold over an event log of edits; periodic snapshots exist for the same reason — replaying every keystroke since document creation would be needlessly slow for a document with years of edit history.

## Interview perspective
The signal is knowing **why snapshots exist and what they don't change**: they're a performance shortcut over an already-correct replay mechanism, not a second source of truth that could drift from it — candidates who can't explain that a snapshot is always re-derivable (and therefore safe to delete and rebuild) haven't fully separated "correctness" from "performance" in this design, which is exactly the distinction Day 40's key principle was building toward.

## Trade-offs
| | No snapshots (always full replay) | With snapshots |
|---|---|---|
| Replay cost for a long-lived stream | Grows unboundedly with history length | Bounded — only events since last snapshot |
| Storage cost | Lower (event log only) | Higher (event log + periodic snapshots) |
| Correctness risk if implemented wrong | None extra | Only if a snapshot is treated as authoritative instead of derived — a real implementation bug to guard against |

## Interview question
"Two concurrent requests both try to append the next event to the same stream at the same time. Walk through exactly what prevents the stream's event ordering from being corrupted."

> [!question]- Think it through, then expand
> Which one succeeds, and how does the store know?

> [!success]- Answer
> Both requests read the stream's current version (say, 3) and attempt to append with `expected_version=3`. The store processes appends atomically per stream: the first request to reach the store succeeds, appending as version 4 and advancing the stream's version. The second request's append is then evaluated against the *new* current version (4), sees its `expected_version=3` no longer matches, and is rejected with a concurrency conflict — it never gets to write. The caller of the rejected request re-reads the now-current state (including the just-appended event) and retries its operation against the correct new version. This optimistic-concurrency check, enforced atomically at the storage layer per stream, is what guarantees only one writer ever successfully claims a given version number, keeping the stream's order well-defined.

## Key design principle
**A snapshot is a cached, always-rederivable performance shortcut — the event log alone remains the single source of truth, and any correct implementation must be able to discard all snapshots and still compute correct current state by full replay.**

## Next
Block B closes here. Combined with Days 29/30 (locks), 36/37 (leader election), this block gave you the full coordination toolkit [05-design-job-scheduler](../Claude Notes/05-design-job-scheduler.md) leaned on early. Block C starts next: Object/Blob Storage Internals (Day 42) — a direct bridge into your AWS S3 knowledge, and the prerequisite [06-design-uber](../Claude Notes/06-design-uber.md) and [08-design-youtube](../Claude Notes/08-design-youtube.md) both referenced ahead of time.
