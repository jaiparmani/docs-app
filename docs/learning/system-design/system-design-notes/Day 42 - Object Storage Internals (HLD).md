# Day 42 — Object/Blob Storage Internals (HLD)

<small>7 min read</small>

## What we're learning today
Starts Block C. Every applied design that touched large files ([08-design-youtube](../Claude Notes/08-design-youtube.md), [03-design-twitter](../Claude Notes/03-design-twitter.md)'s media, [04-design-notification-system](../Claude Notes/04-design-notification-system.md)'s attachments) waved at "object storage" without opening it up. Today does — and it's a direct bridge into your existing AWS S3 knowledge, same trade-offs, different vocabulary.

## Core concept
**Object storage** stores data as immutable, flat, whole "objects" (a blob + metadata, addressed by a key) rather than as blocks in a filesystem hierarchy or rows in a database — durability comes from spreading each object's data across multiple disks/nodes, either via straightforward **replication** or the more storage-efficient **erasure coding**.

## Visual diagram
```
Replication (simple):
  Object X -> copy 1 (node A), copy 2 (node B), copy 3 (node C)
  Storage cost: 3x the object size. Survives any 2 node failures.

Erasure coding (efficient):
  Object X (split into 6 data chunks) + 3 parity chunks, spread across 9 nodes
  Storage cost: 1.5x the object size (9/6), not 3x
  Survives any 3 node failures (any 6 of the 9 chunks reconstruct the full object)
```

## Explanation
- **Object storage is not a filesystem, deliberately.** No directory tree, no partial in-place edits, no file locking semantics — an object is written whole, read whole (or by byte range), and replaced whole. This simplicity is *why* it scales so well horizontally: no cross-node coordination is needed for operations a POSIX filesystem would require (renames, directory listings, partial writes) — object storage just doesn't offer those operations.
- **Replication vs. erasure coding is a storage-cost vs. compute-cost trade-off**, the same durability-vs-cost tension as [Day 19](Day 19 - Database Replication (HLD).md)'s replica count, but with a second lever: erasure coding gets similar (often better) fault tolerance at a fraction of the storage overhead, at the cost of needing computation (encoding on write, reconstruction on a node failure) that plain replication doesn't require. This is why cold, rarely-accessed data favors erasure coding (storage cost dominates, occasional reconstruction compute is a rounding error) while hot, latency-critical data often favors replication (any replica serves a read instantly, no reconstruction math needed).
- **Objects are immutable by convention, not (usually) by hard technical constraint** — "updating" an object typically means writing a new version and repointing the key, not modifying bytes in place. This is what makes CDN caching (Day 17) so clean for object storage-backed content: an immutable object is trivially cacheable forever, with no invalidation-on-mutation problem to solve.
- **Metadata is stored and indexed separately from object data itself** — a key → {location, size, content-type, custom tags} lookup is a fast, small metadata-store query (think a distributed key-value store or Day 21-style sharded index), while the actual bytes live in the bulk storage layer. This split is why listing/searching objects by metadata can be fast even when the underlying objects are enormous and scattered across many nodes.
- **This is the same durability-vs-cost decision your AWS knowledge already names** — S3 storage classes (Standard, Standard-IA, Glacier) are essentially "how aggressively erasure-coded/how many copies, and how much retrieval latency are you willing to accept in exchange for lower storage cost" — the AIF-C01 material's vocabulary and this day's internals are describing the same mechanism from two different altitudes.

## Real-world examples
- **Amazon S3:** internally uses erasure coding (not simple 3x replication) across multiple facilities for its standard durability guarantee — the "11 nines of durability" figure is a direct consequence of this kind of chunked, erasure-coded redundancy, not "we keep 3 copies."
- **HDFS (Hadoop Distributed File System):** originally used straightforward 3x replication (simpler to implement, common in early big-data systems); later versions added erasure coding support specifically to reduce storage overhead for large, less "hot" datasets — a real example of a system offering both trade-off points depending on the data's access pattern.
- **Your [08-design-youtube](../Claude Notes/08-design-youtube.md) design:** raw uploads and transcoded renditions both live in object storage — the "5x storage for 5 resolutions" cost estimate from that note is exactly the kind of storage-cost pressure that makes cold-tier erasure coding (or storage-class tiering) a real, money-relevant decision at that scale, not just an academic one.

## Interview perspective
Most candidates can say "we'd use S3 for this." The differentiator is being able to explain *how* durability is actually achieved underneath (erasure coding vs. replication) and reason about the trade-off — being asked "why not just replicate 3x everywhere" and having an actual answer (storage cost at scale) rather than treating "S3 handles it" as a black box.

## Trade-offs
| | Replication (Nx copies) | Erasure coding |
|---|---|---|
| Storage overhead | High (e.g. 3x for 3 copies) | Lower (e.g. 1.5x for a 6+3 scheme) |
| Read latency | Fastest — any full copy serves directly | Slightly higher if reconstruction is needed |
| Compute cost | None extra | Encoding on write, reconstruction on node failure |
| Best fit | Hot, latency-sensitive data | Cold/warm, large-volume, cost-sensitive data |

## Interview question
"Why doesn't object storage support in-place partial edits (e.g. 'change byte 500 of this 1GB file') the way a traditional filesystem does?"

> [!question]- Think it through, then expand
> Think about what in-place mutation would require across a system that's erasure-coded/sharded across many nodes.

> [!success]- Answer
> An object's data may be split into chunks and spread across multiple nodes (especially under erasure coding), with parity chunks computed from the whole object's content. A partial in-place edit would require recomputing and rewriting parity chunks, coordinating the change across every node holding a piece of that object, and handling concurrent readers mid-update — real cross-node coordination cost, for every single mutation. Treating objects as immutable (write a new full version instead) sidesteps all of that: writes are self-contained and don't require touching or recomputing anything about existing, already-durable objects, which is exactly the simplicity that lets object storage scale horizontally without the machinery a POSIX filesystem needs.

## Key design principle
**Object storage trades filesystem-style flexibility (partial edits, directory operations) for horizontal scalability and simple, strong durability — immutability isn't a limitation bolted on, it's the design choice that makes the scalability possible.**

## 30-second challenge
A video platform stores raw uploads (rarely re-read after transcoding) and transcoded renditions (read constantly by viewers) in the same storage tier today. What's the concrete cost argument for splitting these into different storage tiers?

## Scenario Practice

**Scenario 1:** An application tries to append a few bytes to the end of an existing object in an object store, the way it would append to a line in a local log file. Why doesn't this operation exist, and what has to happen instead?

> [!question]- Think it through, then expand
> This day's key design principle says immutability isn't bolted on — it's what makes the scalability possible. What would partial in-place edits cost that immutability avoids?

> [!success]- Answer
> Object storage doesn't support partial in-place edits because objects are treated as whole, immutable units distributed and replicated across a system — supporting arbitrary byte-range mutation would require coordinating partial updates across every replica of that object consistently, which reintroduces exactly the kind of complex, coordinated-write problem ([replication](Day 19 - Database Replication (HLD).md) consistency, essentially) that treating objects as immutable wholes was designed to avoid. To "append," the application has to read the object, construct a new version with the appended content, and write it back as a brand-new object (or a new version, if versioning is enabled) — more work per logical append, in exchange for the storage layer never having to solve partial-mutation consistency at massive scale.

**Scenario 2:** A client uploads a 50GB file as a single PUT request. The upload fails at 90% completion due to a flaky connection. What has to happen next, and how does multipart upload change this outcome?

> [!question]- Think it through, then expand
> With a single-request upload, what state is a 90%-complete transfer left in when it fails?

> [!success]- Answer
> With a single PUT, a failure at 90% means the entire 50GB has to be re-uploaded from scratch — the object store has no partial object to resume from, since (per the immutability point above) an object typically only exists once it's been fully and successfully written. Multipart upload avoids this by splitting the file into independently-uploaded parts (each with its own ID), so a failure only requires re-uploading the specific part that failed, and the parts already successfully uploaded stay intact until the client explicitly completes the multipart upload by assembling them — turning a single large, fragile transfer into many small, independently-retryable ones, which is exactly why it's the standard approach for large-object uploads over unreliable networks.

## Tomorrow

Day 43 (LLD) — Multipart Upload: the client-side mechanism (already previewed conceptually in [08-design-youtube](../Claude Notes/08-design-youtube.md)) for getting a large file into object storage reliably, chunk by chunk, resumable after a network failure.
