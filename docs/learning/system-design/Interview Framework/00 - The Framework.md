---
tags: [system-design, interview, framework]
---

# The Framework — How to Run a System Design Interview

<small>5 min read</small>

Everything so far — Days 11 through 51, the Design X applied questions — has been building your vocabulary: what a bottleneck looks like, what tool fixes it, what it costs you in exchange. This chapter is different. It's not about *what* to know, it's about *what to do with 45 minutes and a whiteboard*, which is a distinct skill that plenty of people who know the material still fail at, because they never separated it out and practiced it on its own.

The reason this needs its own chapter: an interviewer is not grading you on whether you eventually arrive at a correct architecture. They're grading you on the *process* you used to get there — because that process is a proxy for how you'll behave on a real team, where nobody hands you a clean spec and the cost of skipping a step shows up three months later as an outage. Someone who draws a beautiful, correct diagram in total silence after zero clarifying questions gets a worse score than someone who asks good questions, estimates badly, but reasons out loud the whole way — because the second person just demonstrated the thing you can't teach in a bootcamp, and the first person just demonstrated memorization.

## The seven steps

Every one of these gets its own chapter, with practice questions and revealed answers. This note is the map.

| # | Step | What it produces | Typical time (45 min interview) |
|---|---|---|---|
| 1 | Requirement Gathering | A scoped, agreed-upon problem | 5 min |
| 2 | Back-of-the-Envelope Estimation | Numbers that constrain your design | 5 min |
| 3 | High-Level Design & API Definition | Boxes, arrows, and endpoint signatures | 10 min |
| 4 | Data Model & Storage Choice | Schema + database type, justified | 5 min |
| 5 | Deep Dive & Bottleneck Identification | One component, fully reasoned through | 15 min |
| 6 | Trade-offs & Wrap-up | Explicit acknowledgment of what you didn't optimize for | 5 min |

That adds to 45 because it's meant to — this is a budget, not a suggestion. The single most common failure mode in mock interviews isn't picking the wrong database. It's spending 25 minutes on requirements and estimation because the candidate is stalling, then panic-drawing an architecture in the last 10 minutes with no time left to go deep on anything. The deep dive (step 5) is where the actual signal lives — it's the only step with no ceiling on how impressive it can be — so the first four steps exist to *buy you time to get there*, not to be interesting in their own right.

## Why the order is the order

Each step is a prerequisite for the next one being done well, not just a checklist item:

- You can't estimate (step 2) until you know what you're building (step 1) — "design Twitter" and "design Twitter's DM feature" have wildly different QPS.
- You can't choose a database (step 4) responsibly until you have a read:write ratio and data volume (step 2) — "SQL vs NoSQL" isn't a taste preference, it's a numbers-driven decision, covered properly in that chapter.
- You can't pick what to go deep on (step 5) until the high-level design (step 3) exists — you need the whole map before you know which region of it is actually risky.
- You can't discuss trade-offs (step 6) meaningfully until you've made real decisions (steps 3–5) — "it depends" said with nothing attached to it is not a trade-off discussion, it's a stall.

This mirrors something you already know from the concept days: [CAP theorem](../system-design-notes/Day 23 - CAP Theorem and PACELC (HLD).md) isn't a fact you recite, it's a lens you apply to a specific entity in a specific design — the framework here is the same idea one level up. It's not a script to recite; it's an order of operations that keeps you from making a decision before you have the information to make it well.

## What "good" sounds like at each step

The chapters ahead go deep on each one, but the shared thread across all seven is: **narrate the reasoning, not just the conclusion.** "I'm choosing Cassandra" is a conclusion. "Our write volume is 40:1 over reads and we don't need multi-row transactions, so I want a write-optimized store — Cassandra fits, though I'd also consider DynamoDB if we're already on AWS" is reasoning, and it's the reasoning that's being scored, not whether Cassandra was the "correct" answer. There often isn't one correct answer. There's very often a wrong *process*.

## A worked example, at a glance

Rather than a practice question here, walk one prompt through all seven steps in miniature, so you can see the shape before the chapters unpack each piece:

**Prompt:** "Design a system that lets users create polls and vote on them."

1. **Requirements:** Single-choice or multi-choice? Can a user change their vote? Do we need real-time result updates, or is a refresh acceptable? → assume single-choice, no vote changes, near-real-time results (a few seconds of lag is fine).
2. **Estimation:** 10M polls/day, average 50 votes/poll → 500M votes/day ≈ 5,800 writes/sec average. Reads (viewing results) are the dominant load, easily 20× that.
3. **High-level design:** `POST /polls`, `POST /polls/{id}/vote`, `GET /polls/{id}/results`. Client → load balancer → poll service → vote service → aggregation.
4. **Data model:** Votes are high-volume, append-only, no need for joins — a wide-column or key-value store per poll, with a periodically-updated aggregate count cached separately from the raw vote log.
5. **Deep dive:** The interesting problem is the *read* path for results on a viral poll — this is a caching and invalidation problem, not a voting problem, and it's where you'd spend most of your 15 minutes.
6. **Trade-offs:** Near-real-time (cache with a few seconds of staleness) over strict real-time — trades a small accuracy window for the ability to survive a 10x traffic spike without falling over.

That's the whole shape. Chapters 1 and 2 next.


## Linked from

- [Learning System Design](../index.md)
- [Requirement Gathering](01%20-%20Requirement%20Gathering.md)
- [Trade-offs and Wrapping Up](06%20-%20Trade-offs%20and%20Wrapping%20Up.md)
