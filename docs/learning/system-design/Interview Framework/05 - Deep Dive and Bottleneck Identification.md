---
tags: [system-design, interview, framework]
---

# Deep Dive and Bottleneck Identification

<small>6 min read</small>

Continues [04 - Data Model and Storage Choice](04 - Data Model and Storage Choice.md).

## This is the step that's actually being scored

Steps 1 through 4 exist to get you here with a correct, boring skeleton and 15–20 minutes still on the clock. This is where the interview is actually won or lost — it's the only step with no ceiling, the one place where "I know the standard pattern" and "I can reason about a system under real stress" visibly diverge. Someone who nails requirements and estimation but then only ever describes the happy path has demonstrated organization, not engineering judgment. This chapter is about how to find the *one* thing worth going deep on, and how to reason through it once you're there.

## Picking what to go deep on

Sometimes the interviewer picks for you — "what happens if that cache node dies?" — and you should follow their lead without resistance; that's a direct signal of what they want to see, not a detour. When they don't, the right move is to pick the part of *your own design* that you're least certain would survive real load, and say so: "the part I'm least sure about is the fan-out path when a celebrity account posts — let me think through that." Naming your own weak point unprompted is a stronger signal than picking a safe, already-solved part of the design to elaborate on, because it shows you can self-assess rather than needing to be told where the risk is.

A reliable heuristic for finding it: **go back to your estimation numbers and ask which component has the largest gap between "average load" and "worst case."** Average load is rarely what breaks a system — the worst case almost always is, and the worst case is usually hiding in one of a small number of recurring shapes.

## The recurring bottleneck shapes

Most system design deep dives, across wildly different products, turn out to be one of a handful of the same underlying problems wearing different clothes:

**The hot-partition / celebrity problem.** Whatever your sharding or fan-out key is, some single key gets far more traffic than the rest — one viral tweet, one popular product, one trending hashtag. This is the exact shape [Design Twitter's](../Claude Notes/03-design-twitter.md) fan-out decision is built around, and the fix is almost always the same pattern: special-case the outlier rather than redesigning for it, e.g. the hybrid fan-out approach that treats celebrity accounts differently from everyone else.

**Thundering herd.** A cache entry expires, or a service comes back online after an outage, and every client that was waiting hits the origin at once, which can take down the very system that was just recovering. Fixes: staggered/jittered TTLs so cache entries don't all expire in the same instant, request coalescing (only one request actually goes to the origin; the rest wait on that one result), and gradual traffic ramp-up after recovery.

**Single point of failure hiding in a "simple" component.** A coordinator, a single cache instance, a lock service — anything drawn as one box in your skeleton is worth asking "what happens when this dies?" about, even if the answer is simple. This connects directly to [distributed locks](../system-design-notes/Day 29 - Distributed Locks (HLD).md) and [leader election](../system-design-notes/Day 36 - Leader Election and Consensus (HLD).md) — both exist specifically to remove single points of failure from coordination.

**Read amplification.** One user-facing request that triggers many downstream reads — loading a home timeline by querying every followee individually, rather than reading one precomputed structure. This is precisely why fan-out-on-write exists: it converts an expensive read-time amplification into cheap, pre-paid write-time work.

**Write amplification.** The mirror image — one logical write that becomes very many physical writes, as in fan-out-on-write itself for a high-follower account. Naming that a fix for one amplification problem can *become* the other amplification problem under a different load shape is a genuinely senior observation, and it's exactly the tension the fan-out trade-off table in [03-design-twitter](../Claude Notes/03-design-twitter.md) is built to make explicit.

## The structure of a good deep dive

State the failure mode concretely before proposing the fix — "if the cache node holding this key dies, every request for it hits the database simultaneously" is concrete; "we need better caching" is not. Then walk through the fix and its own new trade-off, because every fix here introduces one: replication adds consistency lag, request coalescing adds a small amount of latency for the waiting requests, jittered TTLs make cache behavior slightly less predictable to reason about. A deep dive that ends with a fix and no acknowledged cost sounds like marketing, not engineering.

## Practice

---

**Given:** a news feed system uses fan-out-on-write, exactly like [03-design-twitter](../Claude Notes/03-design-twitter.md). A user with 30 million followers posts. Diagnose the bottleneck and propose the fix.

> [!question]- Diagnose before expanding
> Which of the shapes above is this?

> [!success]- Model answer
> Write amplification, directly — one post becomes 30 million writes to precomputed timelines. The standard fix is the hybrid approach: skip fan-out-on-write above a follower threshold, and merge that account's posts into followers' timelines at *read* time instead, accepting the cost of read-time merging only for the rare high-follower case rather than paying write amplification for everyone. The trade-off to state explicitly: followers of celebrity accounts now have a slightly more expensive, slightly more complex read path than followers of ordinary accounts — the fix doesn't eliminate cost, it relocates it to the smaller, rarer case.

---

**Given:** a flash-sale system (from [01 - Requirement Gathering](01 - Requirement Gathering.md)'s coupon-code practice problem) opens redemptions at exactly 12:00:00, and 500,000 users are refreshing the page in the last 10 seconds before that.

> [!question]- Diagnose before expanding
> Which shape, and is it the same fix as the fan-out problem above?

> [!success]- Model answer
> Thundering herd, not write amplification — this is a coordinated flood at a known instant rather than an unpredictable hot key. The fix is different in kind from the fan-out fix: a virtual queue or rate limiter in front of the redemption endpoint that admits requests at a rate the backend can actually sustain, rather than a fan-out redesign. The trade-off to name: some fraction of legitimate users now wait in a queue rather than being served instantly, which is a worse individual experience in exchange for the system staying up for everyone rather than falling over for everyone.

---

## Where this hands off

You've gone deep on one real risk and proposed a fix with an honest cost attached. Closing the interview well — stating trade-offs explicitly rather than leaving them implied, and wrapping up with what you'd tackle next given more time — is [06 - Trade-offs and Wrapping Up](06 - Trade-offs and Wrapping Up.md).


## Linked from

- [Back-of-the-Envelope Estimation](02%20-%20Back-of-the-Envelope%20Estimation.md)
- [Data Model and Storage Choice](04%20-%20Data%20Model%20and%20Storage%20Choice.md)
- [Trade-offs and Wrapping Up](06%20-%20Trade-offs%20and%20Wrapping%20Up.md)
