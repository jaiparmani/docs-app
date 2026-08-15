# Day 49 — Transcoding Pipeline, Sketched (LLD)

<small>6 min read</small>

## What we're learning today
Closes Block D. Day 48 assumed multi-resolution, segmented output already existed. Today traces how it's actually produced — the async pipeline turning one raw upload into the manifest-plus-segments structure the player consumes, tying together nearly every pattern from Blocks A–C in one pipeline.

## Core concept
The transcoding pipeline is an **event-driven, horizontally-scaled worker pipeline**: an upload-complete event triggers parallel transcode jobs (one per target resolution), each job's output is written to object storage, and a manifest is generated once all resolutions for a video are confirmed done.

## Visual diagram
```
Upload complete (Day 43) -> publish "video_uploaded" event -> Kafka

Kafka -> Transcode Coordinator
           |-- dispatch job: transcode to 1080p -> Worker Pool A
           |-- dispatch job: transcode to 720p  -> Worker Pool A
           |-- dispatch job: transcode to 480p  -> Worker Pool A
           |-- dispatch job: transcode to 240p  -> Worker Pool A

Each worker: reads raw file (object storage) -> transcodes -> writes segmented output (object storage)
           -> reports completion (with idempotency key = video_id + resolution)

Coordinator: tracks completion per resolution (same shape as Day 39's Saga step-tracking)
  when ALL resolutions done -> generate manifest (.m3u8/.mpd) -> mark video "ready to stream"
```

## Explanation
- **This is the exact same event-driven decoupling pattern as every fan-out design in this roadmap** — upload completion publishes an event (not a direct call), a worker pool consumes it asynchronously, same shape as [03-design-twitter](../Claude Notes/03-design-twitter.md)'s fan-out workers and [04-design-notification-system](../Claude Notes/04-design-notification-system.md)'s channel workers. The uploader gets a fast "upload received, processing" response without blocking on transcoding, which can take minutes for a long video.
- **Per-resolution jobs are independently parallelizable and independently retryable** — transcoding to 1080p and transcoding to 480p have no dependency on each other, so they run concurrently across a worker pool, and a failure in one resolution's job (worker crash, transient error) is retried on its own without redoing the others. Same bulkheading-adjacent instinct as Day 33: isolate the blast radius of one failing unit of work.
- **Completion tracking is a small-scale version of [Day 39](Day 39 - Saga Orchestrator Implementation (LLD).md)'s step-tracking**: the coordinator needs durable state answering "which resolutions are done for this video," so a crash mid-pipeline can resume (or at least correctly report incomplete state) rather than losing track and either re-processing everything or generating an incomplete manifest.
- **Each transcode job must be idempotent** (Day 24) — a retried "transcode to 720p" job (after a worker crash, redelivered by Kafka's at-least-once guarantee, Day 34) should either safely no-op if the output already exists, or safely overwrite with an identical result — never produce a corrupted partial file that a manifest could end up pointing to.
- **The manifest is only generated once every required resolution is confirmed done** — generating it early (before all resolutions exist) would let a player request a resolution that isn't ready yet. This mirrors [Day 43](Day 43 - Multipart Upload Implementation (LLD).md)'s "object doesn't exist until every part is confirmed" discipline, applied to a video's full playable state instead of a single object.
- **Failure/priority handling matters at pipeline scale, not just per-job**: a backlog of transcode jobs during a viral upload spike needs the same kind of priority queueing [04-design-notification-system](../Claude Notes/04-design-notification-system.md) used (transactional vs. bulk) — e.g. a shorter, more-likely-to-go-viral video might reasonably be prioritized over a multi-hour archival upload, a real operational decision worth naming.

## Real-world examples
- **AWS Elemental MediaConvert:** a managed transcoding service that implements almost exactly this pipeline shape — job-based, per-output-format processing, triggered by S3 upload events via EventBridge, output written back to S3 — a direct, named AWS service doing what this note describes conceptually.
- **YouTube's actual processing pipeline (publicly described in various talks):** parallel per-resolution transcoding jobs, with the video only becoming publicly available once a sufficient set of resolutions/qualities are ready — the "not all resolutions need to finish before *some* version is watchable" nuance is a real optimization production systems make (e.g. making 480p available first while 1080p is still processing), worth mentioning as an extension.
- **FFmpeg as the actual transcoding engine:** the open-source tool that does the CPU-heavy work inside each worker in a pipeline like this — worth knowing by name as "what's actually running inside the worker," even though the interesting system-design questions are all about orchestration around it, not the codec details themselves.

## Interview perspective
The signal is recognizing this pipeline as a composition of patterns you already have — async event-driven dispatch, idempotent retryable jobs, durable completion tracking — rather than a brand-new problem requiring brand-new tools. Interviewers asking about video processing at the system-design level are almost never testing codec/FFmpeg knowledge; they're testing whether you can correctly apply the orchestration patterns from earlier in the roadmap to a new, larger unit of work (a whole video instead of a single event).

## Trade-offs
| | Serial (one resolution at a time) | Parallel (this design) | "First resolution ready, publish immediately" (extension) |
|---|---|---|---|
| Time to fully ready | Sum of all resolution transcode times | Max of all resolution transcode times (much faster) | Fastest to *any* playable state |
| Complexity | Simplest | Requires completion tracking across parallel jobs | Requires the player/manifest to handle partial resolution availability |
| Worker resource usage | Lower peak, longer duration | Higher peak (all resolutions transcoding at once), shorter duration | Similar to parallel, plus incremental manifest updates |

## Interview question
"A transcode job for 720p fails and is retried by the coordinator after a worker crash. The original (failed) attempt actually finished writing a corrupted partial file to object storage before crashing. What prevents the manifest from ever pointing to that corrupted file?"

> [!question]- Think it through, then expand
> Compare this to Day 43's "object doesn't exist until confirmed complete" discipline.

> [!success]- Answer
> The same discipline as multipart upload (Day 43) applies here: a transcode job's output isn't considered "done" by the coordinator until the job explicitly reports successful completion with a verifiable result (e.g. a checksum, or an atomic "write to a temp key, then confirm-and-rename" pattern in object storage) — a crash mid-write leaves an orphaned, unconfirmed file that the coordinator never marked complete and therefore never includes in the manifest. The retried job either overwrites that same output key with a fresh, correct attempt, or writes to a new key that then gets confirmed — either way, the manifest is only generated from resolutions the coordinator has durably recorded as *confirmed* complete, never from an object's mere existence in storage.

## Key design principle
**A multi-stage async pipeline needs durable, per-stage completion tracking and idempotent retryable jobs at every stage — without both, a crash anywhere in the pipeline either loses progress or risks publishing an incomplete/corrupted result.**

## Next
Block D closes here. [07-design-chat-system](../Claude Notes/07-design-chat-system.md) and [08-design-youtube](../Claude Notes/08-design-youtube.md)'s prerequisites are now both fully derived. Block E starts next and closes the whole roadmap: Observability (Day 50) and Multi-Region/Disaster Recovery (Day 51) — the production-reasoning layer that applies across every design built so far, not a new component to add to any one of them.
