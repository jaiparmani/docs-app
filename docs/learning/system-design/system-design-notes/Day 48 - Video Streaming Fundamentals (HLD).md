# Day 48 — Video Streaming Fundamentals (HLD)

<small>5 min read</small>

## What we're learning today
[08-design-youtube](../Claude Notes/08-design-youtube.md) used adaptive bitrate streaming and CDN delivery without deriving either. Today opens up the actual mechanism — how a video becomes many small, independently-requestable segments, and why that's what makes smooth playback under changing network conditions possible at all.

## Core concept
**Adaptive bitrate streaming (ABR)** breaks each transcoded resolution into short time-segments and lets the player switch which resolution it requests *segment by segment*, based on its own real-time measurement of available bandwidth — this is what allows quality to degrade smoothly instead of the video stalling outright.

## Visual diagram
```
Manifest file (e.g. HLS .m3u8):
  1080p: [seg1.ts, seg2.ts, seg3.ts, ...]  (6 sec each)
  720p:  [seg1.ts, seg2.ts, seg3.ts, ...]
  480p:  [seg1.ts, seg2.ts, seg3.ts, ...]

Playback timeline:
  t=0s:  bandwidth good -> request 1080p/seg1
  t=6s:  bandwidth good -> request 1080p/seg2
  t=12s: bandwidth drops -> player detects slow download of seg2 -> request 480p/seg3 (same time range, lower res)
  t=18s: bandwidth recovers -> request 1080p/seg4
  (no restart, no re-buffering event visible to the user beyond a brief quality dip)
```

## Explanation
- **Why segments instead of one continuous stream per resolution:** if 1080p were one giant file, switching to 480p mid-playback would mean abandoning that download and starting a completely different file from an arbitrary byte offset — awkward and slow. Segmenting every resolution into the *same* fixed time boundaries (e.g. every 6 seconds) means switching resolution is just "request the next segment from a different resolution's list" — the segments across resolutions represent the same time range, so the switch is seamless at a segment boundary.
- **The player, not the server, makes the ABR decision.** The player continuously measures its own recent segment-download throughput and picks the next segment's resolution based on that measurement — this is a client-side control loop, not something the server or CDN decides. This matters because it means the server's job is simple (serve whichever segment is requested) and all the adaptive intelligence lives at the edge closest to the actual changing condition (the user's network).
- **The manifest file is the map, not the video data itself** — HLS (`.m3u8`) or DASH (`.mpd`) manifests just list available resolutions and their segment URLs/byte-ranges; fetching the manifest is the very first thing a player does, before any actual video data. A manifest update (e.g. live stream appending new segments) is how the player discovers new content is available.
- **This reuses [Day 17](Day 17 - CDN and Edge Caching (HLD).md)'s edge caching directly, unchanged**, because segments are just small, cacheable, immutable files (Day 42's object-storage immutability applies here too — a VOD segment never changes once created) — popular videos' segments get cached at edge nodes close to viewers; the CDN doesn't need any video-specific logic, it's caching small immutable files exactly like any other CDN use case.
- **Transcoding cost is why multiple resolutions exist at all, and it's paid once, not per-view** — this connects directly to [08-design-youtube](../Claude Notes/08-design-youtube.md)'s "why transcode upfront rather than on-demand" trade-off: the segmenting and multi-resolution encoding is expensive CPU work done once, at upload time, specifically so that every subsequent view is cheap (just serving pre-made files), the same "precompute once, read cheaply many times" pattern as [Day 11](Day 11 - Caching Strategies at Scale.md)'s caching and [10-design-search-autocomplete](../Claude Notes/10-design-search-autocomplete.md)'s precomputed top-K.

## Real-world examples
- **YouTube, Netflix, Twitch:** all use HLS and/or DASH-based adaptive bitrate streaming — the manifest-plus-segments model described above is not a simplification for teaching purposes, it's literally how these systems work in production.
- **Live streaming (Twitch):** the same manifest-and-segment model, but the manifest is continuously appended with new segments as they're produced in near-real-time, rather than being complete upfront the way a VOD manifest is — worth noting as the concrete difference live streaming introduces to this same underlying mechanism.
- **Mobile apps degrading gracefully on cellular vs. WiFi:** the visible "video looks slightly blurry for a few seconds, then sharpens" experience when switching from WiFi to cellular *is* the ABR algorithm reacting to a bandwidth drop in real time — a directly observable instance of this day's mechanism.

## Interview perspective
The signal is explaining *why* segmenting (not just "we transcode to multiple resolutions") is what enables seamless mid-playback switching — candidates who describe ABR as "the player picks a resolution" without explaining the segment-boundary mechanism are describing the outcome, not the mechanism. Bonus signal: connecting this back to CDN caching unprompted, recognizing that video segments need no video-specific CDN logic at all.

## Trade-offs
| | Single fixed resolution | Adaptive bitrate (multi-resolution, segmented) |
|---|---|---|
| Playback under variable bandwidth | Stalls/buffers when bandwidth drops below the fixed resolution's requirement | Degrades quality smoothly instead of stalling |
| Storage cost | Lowest (one rendition) | Higher (multiple renditions, ~5x from [08-design-youtube](../Claude Notes/08-design-youtube.md)'s estimate) |
| Transcoding compute cost | Lowest | Higher — every resolution transcoded at upload time |
| CDN cache efficiency | Same | Same — segments are equally cacheable regardless of resolution count |

## Interview question
"Why does the player decide which resolution to request next, rather than the server deciding and pushing the 'right' resolution to the player?"

> [!question]- Think it through, then expand
> Which side of the connection actually has the information needed to make this decision well?

> [!success]- Answer
> The player is the only side with direct, real-time visibility into the actual constraint that matters — its own recent download throughput, reflecting the specific network conditions between it and the CDN edge it's connected to. The server has no visibility into that at all; it only knows a request came in for a specific segment. Putting the decision on the server would mean guessing at network conditions it can't observe, or requiring constant client-to-server signaling that adds latency to the very decision that needs to be fast. Client-side ABR keeps the decision where the relevant information actually lives, and keeps the server simple — just serve whatever segment is requested.

## Key design principle
**Segmenting every resolution along the same time boundaries turns "switch quality" into "request a different file for the next time slice" — a small structural choice that's what actually makes adaptive streaming seamless, not the existence of multiple resolutions by itself.**

## 30-second challenge
Live streaming can't pre-transcode segments before they're created (there's no "upfront" the way VOD has). What does this imply about the acceptable latency between "content is captured" and "a segment is available to request" — and how might that trade off against transcoding quality/efficiency?

## Tomorrow
Day 49 (LLD) — sketch the actual transcoding pipeline: how an uploaded raw file becomes the multi-resolution, segmented output this note assumed already existed.
