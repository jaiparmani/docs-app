---
tags: [system-design, interview, framework]
---

# Back-of-the-Envelope Estimation

<small>8 min read</small>

Continues [01 - Requirement Gathering](01 - Requirement Gathering.md).

## What this step is actually for

Nobody cares whether your final number is 40,000 QPS or 55,000 QPS — the interviewer isn't fact-checking your arithmetic against a spreadsheet they prepared earlier. What they're checking is whether the number *changes what you do next*. If you calculate "5,800 writes/sec" and then never refer to that number again for the rest of the interview, the calculation was theater. If you calculate it and then say "that's well within what a single well-provisioned Postgres instance can take, so I'm not sharding yet" — and later, when told the number is actually 10x higher, you say "okay, now I do need to shard, per [Day 21](../system-design-notes/Day 21 - Database Sharding and Partitioning (HLD).md)" — you've just demonstrated that your architecture is *derived from* the numbers, not decorated with them after the fact. That's the entire point of this step.

This also means estimation isn't a one-time step 2 activity, even though it's introduced here first. You'll come back to it in the deep dive when you need to know if a cache fits in memory, or whether a queue can absorb a burst. Step 2 is where you learn the technique; you'll use it throughout the interview.

## The four numbers, always derived in this order

1. **Traffic (QPS)** — requests per second, split by read and write, because they're almost always wildly different volumes and drive different decisions.
2. **Storage** — how much data accumulates, and over what retention period.
3. **Bandwidth** — data in motion, not at rest; this is what tells you if a CDN ([Day 17](../system-design-notes/Day 17 - CDN and Edge Caching (HLD).md)) is optional or mandatory.
4. **Memory / cache sizing** — how big is the *hot* subset of your data, because that's what has to fit in something fast (Redis, per [Day 13](../system-design-notes/Day 13 - Redis Internals (HLD).md)), not the full dataset.

Each one builds on the last. You cannot sanely estimate bandwidth before you know traffic; you cannot size a cache before you know which fraction of storage is actually hot.

## The approximations that make this tractable in your head

An interview whiteboard is not a calculator, and nobody expects precision — they expect you to be fast and roughly right, which requires deliberately rounding in a specific, defensible direction:

- **Seconds per day ≈ 86,400 ≈ ~10⁵.** Round to 100,000 and the arithmetic gets easy; the 15% error this introduces never matters at the precision this exercise needs.
- **1 million ≈ 10⁶, 1 billion ≈ 10⁹** — stay in powers of ten and multiply/divide by shifting the exponent instead of tracking exact digits.
- **1 KB ≈ 10³ bytes, 1 MB ≈ 10⁶ bytes, 1 GB ≈ 10⁹ bytes** — the same trick applied to storage; the real values (1024-based) are close enough that the powers-of-ten version is fine for this purpose.
- **State the rounding out loud.** "I'll treat a day as 100,000 seconds to keep the math simple" is a sentence that makes you look sharper, not sloppier — it shows you know the difference between precision and rigor, and that you're choosing speed on purpose.

## Latency numbers worth having memorized

You won't derive these from first principles in an interview, but knowing their *relative* order of magnitude — not the exact nanosecond figures, which drift with hardware generation — is what lets you reason about where time actually goes in a request. Roughly, moving from fastest to slowest, each step tends to be one to three orders of magnitude slower than the one before it:

| Operation | Rough scale |
|---|---|
| Reading from L1/L2 CPU cache | nanoseconds |
| Reading from RAM | ~100x slower than cache |
| Reading from SSD | ~100–1000x slower than RAM |
| Round trip within the same datacenter | roughly comparable to an SSD read, low single-digit milliseconds |
| Reading from a spinning disk (seek time) | slower again, several milliseconds |
| Round trip across regions/continents | tens to low hundreds of milliseconds — dominated by the speed of light, not the server |

The one design consequence worth internalizing from this table: **a network hop, even within a datacenter, tends to cost more than reading from disk on the same machine, and a cross-region hop costs vastly more than either.** That's the underlying reason [CDNs](../system-design-notes/Day 17 - CDN and Edge Caching (HLD).md) exist, why [multi-region](../system-design-notes/Day 51 - Multi-Region and Disaster Recovery (HLD).md) designs treat cross-region calls as something to minimize rather than something free, and why a cache hit beating a database round trip isn't really about disk speed — it's about avoiding the network hop to the DB tier entirely.

## Worked method: traffic → storage → bandwidth → cache

Take a generic pattern and walk it once, explicitly, so the practice problems below are pattern-matching against a method you've already seen rather than starting from nothing:

> "500M DAU, each user posts 1 photo/day, average photo size 2MB, retention 5 years."

1. **Traffic:** 500M photos/day ÷ 100,000 sec/day ≈ **5,000 writes/sec** average. (Real traffic isn't flat — peak is typically 2–3× average, so provision for ~10–15k/sec at peak, and say so.)
2. **Storage:** 500M photos/day × 2MB = 1PB/day. Over 5 years (≈1,800 days): **~1.8 exabytes.** That number alone tells you object storage (Day 42), not a relational database, is the only sane choice for the media itself — a decision the estimation *made for you*, rather than one you asserted from taste.
3. **Bandwidth:** 5,000 writes/sec × 2MB ≈ 10GB/sec of upload traffic alone. Read traffic (people viewing photos) is typically far higher than write — if reads outnumber writes 20:1, that's ~200GB/sec of read bandwidth, which is precisely the number that makes a CDN non-negotiable rather than a nice-to-have.
4. **Cache:** you would never try to cache 1.8 exabytes. Instead ask: what fraction of photos get viewed in, say, the last 24 hours? If it's the most recent 1% of content driving 80% of views (a realistic power-law assumption, worth stating explicitly), the *hot* set is 1PB/day × 1 day ≈ 1% of daily volume — a number small enough to reason about caching for, unlike the full archive.

Notice the shape: each step's output becomes the next step's input, and each one eliminated at least one architectural option outright. That elimination is the actual deliverable of this whole exercise.

## Practice

Three more problems. Do the arithmetic yourself before expanding — the goal is fluency with the method, not memorizing these specific answers.

---

**Problem: A chat app has 100M daily active users, each sending an average of 40 messages/day, average message size 200 bytes (mostly text). Estimate write QPS and daily storage.**

> [!question]- Work it through
> Powers of ten, in order: traffic first, then storage.

> [!success]- Model answer
> - Messages/day: 100M × 40 = 4B messages/day.
> - QPS: 4B ÷ 100,000 sec/day = **40,000 writes/sec average** (peak likely 2–3× that, so provision for ~100k/sec).
> - Storage/day: 4B × 200 bytes = 800GB/day of raw message content.
> - Over a year: 800GB × 365 ≈ **~290TB/year** — large, but nowhere near the exabyte range of a media-heavy product, which tells you this can likely live in a well-sharded conventional database rather than requiring object storage, unlike the photo example above. The shape of the number, not just its size, is what should drive the next design decision.

---

**Problem: A video platform has 5M videos uploaded per month, average length 10 minutes, and stores 3 resolution variants per video (roughly 50MB per minute of video per variant, all resolutions combined). Estimate monthly storage and average write bandwidth.**

> [!question]- Work it through
> Watch the units — this problem gives you "per month," which needs converting before you can compare it against the per-second figures you're used to.

> [!success]- Model answer
> - Storage per video (all 3 variants combined): 10 min × 50MB/min = 500MB.
> - Monthly storage: 5M videos × 500MB = 2.5PB/month.
> - Seconds in a month: ~30 days × 100,000 sec/day (using the same day-approximation) = 3M sec/month.
> - Average write bandwidth: 2.5PB ÷ 3M sec ≈ **~830MB/sec** sustained average.
> - The immediate follow-on question this should raise in the interview, unprompted: uploads aren't the bottleneck here at all — the read/streaming side is, since one popular video gets replayed by orders of magnitude more people than uploaded it once. This is exactly the setup [Day 48](../system-design-notes/Day 48 - Video Streaming Fundamentals (HLD).md) and Day 49 cover — the estimation here is what earns you the right to say "the interesting problem isn't storage, it's distribution."

---

**Problem: A rate limiter needs to track request counts per user for 50M active users, with a sliding window of the last 60 seconds. Estimate the memory footprint needed if each user's state is a counter plus a timestamp (roughly 16 bytes).**

> [!question]- Work it through
> This one is a pure memory-sizing question — no traffic or bandwidth involved, just: how much does state cost if you have to hold one per user.

> [!success]- Model answer
> - 50M users × 16 bytes = **800MB.**
> - The number matters because it's small enough to comfortably fit in a single Redis instance's memory ([Day 13](../system-design-notes/Day 13 - Redis Internals (HLD).md)) — which tells you a rate limiter for this scale does not need to be sharded or distributed across multiple cache nodes; a single well-provisioned instance (with a replica for availability) is sufficient, and reaching for a more complex distributed counter here would be *over*-engineering, not diligence. Knowing when the numbers say "you don't need the fancy version" is as much a signal of seniority as knowing when they say you do.

---

## Where this hands off

You now have the numbers that will justify every choice in the next three chapters: [High-Level Design](03 - High-Level Design and API Definition.md) uses traffic to decide how many service tiers you need, [Data Model & Storage Choice](04 - Data Model and Storage Choice.md) uses storage and the read:write ratio to pick a database, and [the deep dive](05 - Deep Dive and Bottleneck Identification.md) uses cache sizing to reason about what actually breaks under load.


## Linked from

- [Data Model and Storage Choice](04%20-%20Data%20Model%20and%20Storage%20Choice.md)
- [High-Level Design and API Definition](03%20-%20High-Level%20Design%20and%20API%20Definition.md)
- [Trade-offs and Wrapping Up](06%20-%20Trade-offs%20and%20Wrapping%20Up.md)
