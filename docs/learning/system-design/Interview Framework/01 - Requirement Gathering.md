---
tags: [system-design, interview, framework]
---

# Requirement Gathering

<small>8 min read</small>

Continues [00 - The Framework](00 - The Framework.md). For a fast, in-the-room reference once you've internalized the reasoning below, see the existing [Requirement Gathering checklist](../Requirement Gathering checklist.md).

## Why the prompt is vague on purpose

"Design Twitter" is not an incomplete question that the interviewer forgot to finish. It's a deliberately underspecified prompt, and the underspecification *is* the test. In a real job, nobody hands you a complete spec either — product asks for "a notifications system" and it's your job, not theirs, to surface that "notifications" could mean push, email, in-app, or all three, and that the answer changes the entire design. An interviewer who watches you start drawing boxes for a prompt like that without asking a single question isn't watching someone confident — they're watching someone who's going to build the wrong thing in production and find out during code review, or worse, after launch.

So the actual skill being tested in the first five minutes isn't "do you know what a home timeline is." It's: **can you convert an ambiguous request into a bounded, agreed-upon problem before you start solving it.** That's a distinct, practicable skill, and it's what this chapter is for.

## Two categories of questions, and why the order matters

**Scope questions** come first — they determine *what you're building at all*. Only once scope is fixed do **scale questions** make sense, because scale questions are meaningless without a fixed feature set: asking "how many users?" before you know whether you're building the whole product or one feature of it gets you a number you can't use.

**Scope — what's actually in the room:**
- Which features are in scope, which are explicitly out? ("Just posting and following, or also DMs and ads?")
- What's the core user action, and what's a nice-to-have? (Twitter's core action is reading the timeline, not posting — this changes what you optimize for, and it's exactly the asymmetry [03-design-twitter](../Claude Notes/03-design-twitter.md) is built around.)
- Is this a green-field system, or are we extending something that exists? (Changes whether migration/backward-compatibility is a constraint.)

**Scale — the numbers that will drive your estimation chapter:**
- Roughly how many users, and what fraction are active daily? (Total users almost never matters — daily active users does, because that's what drives load.)
- What's the read:write ratio, even roughly? (This single number decides more architecture than almost anything else — it's why [03-design-twitter](../Claude Notes/03-design-twitter.md) spends a whole section on it before touching a diagram.)
- What latency matters, and to whom? (A user posting a tweet can tolerate 500ms. A user loading their timeline cannot — see [Day 17](../system-design-notes/Day 17 - CDN and Edge Caching (HLD).md) and [Day 46](../system-design-notes/Day 46 - WebSockets Long Polling and SSE (HLD).md) for why "which path is latency-sensitive" changes the tool you reach for.)
- Consistency requirements — can a follower see a new tweet 5 seconds late, or must it be instant? (This is [CAP](../system-design-notes/Day 23 - CAP Theorem and PACELC (HLD).md), asked as a question about one specific entity instead of recited as theory.)

## The trap: asking questions to perform, not to learn

A subtler failure than asking nothing is asking questions whose answers you're not actually going to use. "What programming language should the backend be in?" is a real question in some job, but it doesn't change anything about a system design answer, so asking it just burns your 5-minute budget and signals that you're pattern-matching "ask questions" as a ritual rather than doing it because you need the information. Every clarifying question should trace forward to a decision later in the interview — if you can't say what you'd do differently based on either answer, don't ask it.

The other trap is over-asking: spending 12 minutes interrogating an interviewer who's deliberately being vague because they *want* you to make and state reasonable assumptions where the answer genuinely doesn't matter. If a question doesn't change your design either way, say the assumption out loud and move on — "I'll assume standard web latencies, not a real-time trading system" costs five seconds and demonstrates judgment; asking it as a question costs a minute and demonstrates the opposite.

## Practice

Four prompts you haven't seen a full walkthrough for elsewhere in this vault. For each: pause, write down the questions you'd actually ask, then expand.

---

**Prompt: "Design a hotel booking system."**

> [!question]- What would you ask, and why?
> Think about: what makes booking systems structurally hard (hint: it's not the browsing).

> [!success]- Model answer
> - **"Can two users book the same room for overlapping dates, or must we prevent that?"** — this is the whole problem. If double-booking is unacceptable, you need a concurrency-safe reservation mechanism (this is the same shape as [distributed locking](../system-design-notes/Day 29 - Distributed Locks (HLD).md) — you're locking a room-date range, not a row).
> - **"Is this single-hotel or a marketplace of many hotels/hosts?"** — changes whether inventory is centrally owned (simpler) or externally synced via each host's own calendar (an integration and consistency problem on top of the booking one).
> - **"Do we need to support cancellation and partial refunds?"** — determines whether a booking is a single atomic write or a state machine (pending → confirmed → cancelled → refunded) that needs to be modeled explicitly.
> - **"What's the read pattern — mostly search/browse, or mostly checking availability for a specific date range?"** — search is a different scaling problem (closer to [Day 31](../system-design-notes/Day 31 - Search Systems and Elasticsearch (HLD).md)) from availability-checking (closer to inventory locking).
> - Scale: rough number of hotels/rooms and bookings/day — a booking system for 500 hotels and one for 500,000 are different systems, not the same one at a bigger size.

---

**Prompt: "Design a flash-sale coupon/discount code system."**

> [!question]- What would you ask, and why?
> Think about: what's different here from a normal e-commerce write path.

> [!success]- Model answer
> - **"Is there a hard cap on the number of redemptions?"** ("first 10,000 people get 50% off") — if yes, this becomes a race-condition problem at massive concurrency, the same core issue as an [inventory-decrement race](../system-design-notes/Day 35 - Bloom Filters (LLD).md), and needs an atomic counter (e.g. `DECR` in Redis, per [Day 13](../system-design-notes/Day 13 - Redis Internals (HLD).md)) rather than a naive read-then-write.
> - **"Is traffic expected to spike sharply at a known time (sale starts at noon) or steadily?"** — a known spike changes this from a capacity-planning problem into a **thundering herd** problem, which is a different design conversation (rate limiting, queueing, maybe a virtual waiting room).
> - **"Can a code be reused by the same user, or one redemption per user?"** — determines whether you need per-user idempotency tracking (connects directly to [Day 24](../system-design-notes/Day 24 - Idempotency Keys (LLD).md)) or just a global counter.
> - **"What happens if the redemption succeeds but the payment fails afterward?"** — surfaces whether you need to reserve-then-confirm (two-phase) or can safely decrement-then-rollback-on-failure.

---

**Prompt: "Design a food delivery order-tracking system (a rider's live location shown to the customer)."**

> [!question]- What would you ask, and why?
> Think about: what kind of data is flowing here, and how fresh does it need to be.

> [!success]- Model answer
> - **"How frequently does the rider's location need to update on the customer's screen?"** — every 3 seconds is a very different bandwidth/infra problem than every 30. This is a direct estimation input, and it decides whether you need a persistent connection at all (see [Day 46](../system-design-notes/Day 46 - WebSockets Long Polling and SSE (HLD).md)) or whether polling is genuinely fine.
> - **"Do we need historical location data (the route taken), or only the current position?"** — current-only is a hot, ephemeral, overwrite-in-place value; historical is an append-only log, a completely different storage shape.
> - **"How many concurrent active deliveries are we tracking at once?"** — this is the number that decides whether a single WebSocket-fanout server tier is enough or you need the sharded connection-management approach from Day 47.
> - **"Does the customer need to see other riders, or only their own?"** — rules out or in any actual geospatial *search* (per [Day 44](../system-design-notes/Day 44 - Geospatial Indexing (HLD).md)) versus a simple single-value lookup, which is a much smaller problem than it initially sounds.

---

**Prompt: "Design a collaborative document editor (Google Docs–style)."**

> [!question]- What would you ask, and why?
> Think about: what's fundamentally different here from every CRUD system you've designed so far.

> [!success]- Model answer
> - **"Do multiple users need to edit the same document simultaneously, with each seeing the other's changes live?"** — if yes, this is not a database-and-cache problem at all; it's a **conflict resolution** problem (operational transformation or CRDTs), and admitting you'd need to research the specific algorithm rather than bluffing a from-scratch design is itself a strong, senior answer — most interviewers aren't expecting you to derive OT/CRDTs live.
> - **"Is offline editing with later sync required?"** — if yes, conflicts can't be resolved with "last write wins" at the server, because two people may have diverged for hours; this pushes hard toward CRDTs specifically, since they're designed to merge divergent offline states deterministically.
> - **"What's the granularity of a 'change' — character-level, or coarser (paragraph, whole-document)?"** — character-level is what makes real-time cursors and live typing feel right, but multiplies the write volume enormously versus a coarser model.
> - **"Do we need full version history / the ability to restore an earlier version?"** — turns this into an append-only event log of every operation (echoes Day 41) rather than a system that only stores current state.

---

## The habit to build

Before every practice problem in this vault from now on — Design X included — force yourself to write down 3–4 questions and your own answers to them *before* reading the model design. The estimation chapter next assumes you've already done this step; every number in it depends on an assumption you're supposed to have made here first.


## Linked from

- [Back-of-the-Envelope Estimation](02%20-%20Back-of-the-Envelope%20Estimation.md)
- [Data Model and Storage Choice](04%20-%20Data%20Model%20and%20Storage%20Choice.md)
- [Deep Dive and Bottleneck Identification](05%20-%20Deep%20Dive%20and%20Bottleneck%20Identification.md)
- [Trade-offs and Wrapping Up](06%20-%20Trade-offs%20and%20Wrapping%20Up.md)
