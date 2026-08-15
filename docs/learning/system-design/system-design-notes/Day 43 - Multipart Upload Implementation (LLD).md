# Day 43 — Multipart/Resumable Upload, Implemented (LLD)

<small>5 min read</small>

## What we're learning today
Day 42 explained why object storage treats objects as immutable wholes. Today builds the client-side mechanism that reconciles that with "how do you reliably get a 2GB file into storage over a flaky connection" — the exact thing [08-design-youtube](../Claude Notes/08-design-youtube.md) referenced but didn't open up.

## Core concept
**Multipart upload** splits a large file into independent chunks (parts), uploads each separately (parallelizable, individually retryable), and only assembles them into the final object once every part is confirmed — so a single network failure loses at most one chunk's progress, not the whole upload.

## Visual diagram
```
Client: 2GB file, split into 20 x 100MB parts

1. InitiateUpload -> server returns upload_id
2. Upload part 1 (upload_id, part_number=1) -> server confirms, returns ETag
   Upload part 2 ... in parallel, independently retryable
   ...
   Upload part 14 -> network drop -> retry ONLY part 14, not parts 1-13
3. All 20 parts confirmed -> CompleteUpload(upload_id, [part1_etag, part2_etag, ...])
   -> server assembles parts into the final object, in order
4. Object now exists as a single, whole, immutable object (Day 42)
```

## Explanation
- **Why not just retry the whole upload on any failure:** for a large file over a real network, *some* failure during the transfer is likely, not exceptional — retrying from byte zero every time means a upload might never complete under bad-but-not-terrible network conditions, and wastes an enormous amount of already-transferred, still-good data. Chunking bounds the "blast radius" of any single failure to one part.
- **Each part upload is independently retryable and parallelizable** — multiple parts can be in flight simultaneously (bounded by some concurrency limit), and a failed part is retried on its own without touching the others' progress. This is the same "bound the blast radius of a single failure" instinct as Day 33's bulkheading, applied to chunks of one upload instead of separate downstream dependencies.
- **The server doesn't assemble the object until every part is confirmed.** Parts sit as incomplete, unassembled data until `CompleteUpload` is called with the full list of part identifiers (and their checksums/ETags, to verify each part arrived intact) — this preserves Day 42's immutability guarantee: nothing observable as "the object" exists, even partially, until the whole thing is verified complete. A client that abandons the upload midway simply leaves orphaned parts, never a corrupted partial object.
- **Resumability requires the client to persist upload progress somewhere durable of its own** (which parts succeeded, and the `upload_id`) — if the client itself crashes or the browser tab closes mid-upload, resuming requires knowing what was already confirmed, the same "durable progress tracking" requirement as [Day 39](Day 39 - Saga Orchestrator Implementation (LLD).md)'s orchestrator persisting state after every step.
- **Checksums per part (and often for the assembled whole) catch silent corruption** — a part that "succeeded" at the network layer but arrived with flipped bits due to a transmission error would otherwise silently corrupt the final object; verifying a checksum per part, before marking it confirmed, closes that gap.

## Real-world examples
- **AWS S3 Multipart Upload API:** exactly this mechanism, part-for-part — `CreateMultipartUpload`, `UploadPart` (returns an ETag per part), `CompleteMultipartUpload` (assembles from a list of part ETags). AWS specifically recommends multipart upload for any object over 100MB, and requires it above 5GB.
- **YouTube Studio / any large-video-upload UI showing a resumable progress bar that survives a dropped connection:** implements this pattern client-side — tracking which chunks succeeded, retrying only the failed one, and showing progress as "% of parts confirmed," not "did the whole thing succeed yet."
- **Google Drive / Dropbox large-file sync:** same chunked, resumable, checksum-verified upload pattern, adapted for continuous background sync rather than a one-shot upload.

## Interview perspective
The signal is connecting this back to Day 42 unprompted: explaining that the object doesn't exist (not even partially) until `CompleteUpload` succeeds is what shows you understand *why* multipart upload is compatible with object storage's immutability model, rather than an unrelated convenience feature. A weaker answer describes chunking as purely a "faster/more resilient upload" trick without connecting it to the underlying storage model's constraints.

## Trade-offs
| | Single whole-file upload | Multipart upload |
|---|---|---|
| Failure cost | Entire file re-uploaded on any failure | Only the failed part re-uploaded |
| Parallelism | None — one sequential stream | Multiple parts uploaded concurrently |
| Complexity | Simple | Client must track part state; server must handle assembly and orphaned-part cleanup |
| Minimum practical file size | Any | Usually only worth it above tens of MB — overhead isn't justified for small files |

## Interview question
"A client uploads 18 of 20 parts successfully, then the user closes their laptop and never resumes. What's left behind in storage, and what should the system do about it?"

> [!question]- Think it through, then expand
> The object was never assembled — so what actually exists in storage right now?

> [!success]- Answer
> 18 confirmed, unassembled parts sit in storage, associated with an `upload_id` that will never receive a `CompleteUpload` call — no object was ever created, since assembly only happens on explicit completion (Day 42's immutability guarantee holding even under an abandoned upload). Left alone, these orphaned parts consume storage indefinitely for no benefit. The practical fix is a **lifecycle policy**: automatically abort and delete incomplete multipart uploads after some timeout (e.g. 7 days of inactivity) — exactly the kind of automatic cleanup S3's own multipart upload lifecycle rules provide, so abandoned uploads don't silently accumulate storage cost forever.

## Key design principle
**Chunking a large transfer bounds the cost of failure to a single chunk, and deferring "the object exists" until every chunk is verified keeps this fully compatible with an immutable-object storage model — the two ideas (Day 42 and today) are designed to fit together, not bolted on separately.**

## Tomorrow
Day 44 (HLD) — Geospatial Indexing: a new access pattern (proximity/"near me" queries) that [06-design-uber](../Claude Notes/06-design-uber.md) depended on, opened up properly.
