# Day 17 — CDNs & Edge Caching (HLD)

## What we're learning today
Redis solved "close to your app server." CDNs solve "close to the user, anywhere in the world" — the last piece of the latency puzzle before a response reaches a browser.

## Core concept
Physics is a hard constraint: light in fiber takes ~130ms round-trip Mumbai-to-US. No amount of backend optimization fixes that. A **CDN** caches content at edge nodes geographically near users, so requests never leave the continent for static/cacheable content.

## Visual diagram
```
User (Mumbai) --> Nearest Edge Node (Mumbai PoP)
                        |
                cache HIT? --> return in ~10ms
                        |
                cache MISS?
                        |
                 Origin Server (say, US-East)
                        | (fetch once, cache at edge)
                 Edge Node caches response
```

## Explanation
- **Pull CDN:** edge node fetches from origin on first miss, caches it (TTL-based) — this is cache-aside (Day 11) applied geographically.
- **Push CDN:** you proactively upload content to edge nodes ahead of demand — used for large media releases (game patches, movie premieres) where a cold-cache stampede on launch would overwhelm origin.
- **What's cacheable:** static assets (JS/CSS/images) are easy. Dynamic, personalized content (a logged-in user's feed) generally isn't — though some CDNs support edge compute (Cloudflare Workers, Lambda@Edge) to personalize *at* the edge without a full origin round-trip.
- **Cache invalidation at the edge is hard:** unlike Redis where you control one cluster, invalidating a CDN means propagating a purge across hundreds of global PoPs — often eventually consistent, taking seconds to minutes.

## Real-world examples
- **Netflix's Open Connect** — their own CDN, placing appliances directly inside ISP data centers, because video bandwidth at their scale makes third-party CDN costs and control insufficient.
- **YouTube video CDN** — serves the popular tail (viral videos) from nearly every edge node, but long-tail unpopular videos may still miss and hit origin — a direct parallel to LRU eviction under limited edge storage.

## Interview perspective
When designing YouTube, Instagram, or Netflix, interviewers expect you to say "CDN" for media delivery without prompting — it's assumed infrastructure at Senior level. What differentiates strong answers is discussing the **invalidation problem** and **cache-hit ratio tuning** (TTL choice, cache-control headers) rather than just naming CloudFront/Akamai as a checkbox.

## Trade-offs
| | Pull CDN | Push CDN |
|---|---|---|
| Setup effort | Low (automatic on miss) | High (manual/scheduled upload) |
| Cold-start cost | First user per region pays a miss | None — pre-warmed |
| Best for | Long-tail, unpredictable content | Predictable, high-demand launches |

## Interview question
"Design the caching layer for Instagram's image delivery — profile pictures (rarely change) vs. story content (expires in 24h) vs. a newly uploaded viral post (sudden spike). How do TTLs and invalidation strategy differ across these three?"

> [!question]- Think it through, then expand
> Each of the three has a different natural "expiry" already built into the product — use that.

> [!success]- Answer
> Profile pictures: long TTL (days), pull CDN is fine — rare changes mean occasional staleness is cheap, and active purge (via a versioned URL, same trick as the 30-second challenge below) handles the rare update. Story content: TTL set to match the story's own 24h expiry — no need for active invalidation at all, since the content is meant to disappear on a schedule the cache can just mirror. A newly uploaded viral post: this is the push-CDN case — pre-warming edge nodes ahead of the predictable demand spike (once virality is detected) avoids a stampede of cache misses all hitting origin simultaneously the moment it starts trending.

## Key design principle
**Push the cache-aside pattern as physically close to the user as the data's mutability allows — the CDN is just Redis's geography-aware cousin.**

## 30-second challenge
A user updates their profile picture. It's cached at 50 global edge nodes with a 24h TTL. What are two different strategies to make the update visible faster than waiting for natural TTL expiry?

*(Hint: cache-busting via versioned URL vs. active purge API — compare cost and speed.)*

## Tomorrow
Day 18 (LLD) — Database indexing internals: B-Trees and B+Trees, and why almost every DB index uses the latter.
