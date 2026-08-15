---
tags: [system-design, interview, framework]
---

# Trade-offs and Wrapping Up

<small>6 min read</small>

Continues [05 - Deep Dive and Bottleneck Identification](05 - Deep Dive and Bottleneck Identification.md).

## Say the trade-off, don't just make the choice

Every non-trivial decision earlier in the interview had a cost attached, whether or not you said it out loud. The final few minutes are where you go back and make those costs explicit, because a design presented as if it had no downsides reads as either naive or evasive — neither is the impression you want to leave with. "We chose eventual consistency for the timeline" is a statement of fact. "We chose eventual consistency for the timeline, which means a follower can occasionally see a stale view for a few seconds after a new post — we accepted that because [availability](../system-design-notes/Day 23 - CAP Theorem and PACELC (HLD).md) mattered more than instant consistency for this specific read path" is a trade-off, and it's the second version that's actually being listened for.

A simple habit that produces this automatically: for every major decision in your design, be ready to answer "what did this cost us, and who pays it?" If you can't answer that for a decision you made, it's worth revisiting whether the decision was actually reasoned through or just defaulted to.

## The recurring trade-off axes

A small number of tensions account for most of what comes up across very different systems, and having them ready as vocabulary makes the wrap-up conversation faster and sharper:

- **Consistency vs. availability** — [CAP/PACELC](../system-design-notes/Day 23 - CAP Theorem and PACELC (HLD).md), the one you'll invoke most often.
- **Latency vs. accuracy** — a cached, slightly-stale answer served instantly vs. a fresh, always-correct answer that's slower. The flash-sale queue from [05 - Deep Dive and Bottleneck Identification](05 - Deep Dive and Bottleneck Identification.md) is this same axis wearing a different name: latency for some users vs. reliability for the whole system.
- **Storage cost vs. compute cost** — precomputing and storing more (fan-out-on-write) vs. computing more at read time and storing less (fan-out-on-read). [03-design-twitter](../Claude Notes/03-design-twitter.md)'s central decision, restated at this more general level.
- **Simplicity vs. flexibility** — a monolith is simpler to operate and reason about; services let pieces scale independently at the cost of operational complexity. Revisits the question raised in [03 - High-Level Design and API Definition](03 - High-Level Design and API Definition.md).
- **Write amplification vs. read amplification** — doing more work now (on write) to make later reads cheap, or doing less work now and paying for it on every read instead. Named explicitly in the deep-dive chapter; worth restating here as a general axis rather than a one-off observation.

## Closing strong: what "wrap-up" actually covers

**Summarize in thirty seconds, not three minutes.** Restate the core design decision and the one trade-off that mattered most — not a recap of every box on the whiteboard. If the interviewer wanted a full recap they'd ask for one; a long summary at the end usually reads as stalling.

**Name what you didn't build, and why that was the right call for the time you had.** "I didn't design the monitoring and alerting layer in detail, but I'd want dashboards on queue depth and cache hit rate specifically, since those are the two things most likely to degrade silently before they cause a visible outage" — this is a direct callback to [Day 50](../system-design-notes/Day 50 - Observability Metrics Logging Tracing (HLD).md), and mentioning it unprompted signals you think about a system's entire lifecycle, not just the moment it first works.

**If asked "how would this fail, and how would you know?"** — treat it as an invitation to talk about the difference between a system that fails loudly (an alert fires, someone gets paged) and one that fails silently (data quietly goes stale or inconsistent and nobody notices until a customer complains). The second kind is almost always worse, and noticing that distinction unprompted is a strong closing signal.

**Don't invent new scope in the last two minutes.** If the interviewer hasn't asked about, say, internationalization or GDPR compliance, raising it now doesn't demonstrate thoroughness — it demonstrates poor time management, since you're introducing a new open thread with no time left to actually reason about it.

## Practice

---

**Given:** you've just presented a chat system using WebSockets for real-time delivery ([Day 46](../system-design-notes/Day 46 - WebSockets Long Polling and SSE (HLD).md)), with messages also durably stored so history survives a reconnect. The interviewer asks: "What's the trade-off in guaranteeing message delivery here?"

> [!question]- Answer before expanding
> Which of the recurring axes does this map to?

> [!success]- Model answer
> This is latency vs. reliability, and possibly consistency vs. availability depending on how you've built acknowledgment. If a message must be durably written and acknowledged before the sender sees "sent," you've added latency to every message to guarantee it survives a crash. If you optimistically show "sent" the instant the message leaves the client, you've reduced perceived latency but created a window where a message could appear sent but never actually be delivered if the server crashes before persisting it. Naming which one you chose, and that the other option existed, is the answer — not just describing the mechanism.

---

**Given:** wrapping up the hotel booking system from [01 - Requirement Gathering](01 - Requirement Gathering.md). The interviewer asks: "If you had another 20 minutes, what would you build next?"

> [!question]- Answer before expanding
> What's a good answer here, and what's a bad one?

> [!success]- Model answer
> A good answer names something specific and justified by what's already been discussed: "I'd want to go deeper on the overbooking-prevention mechanism under concurrent writes — I sketched that it needs a locking strategy but didn't fully design it, and that's the part most likely to have a subtle bug at scale." A bad answer is vague ("make it more scalable," "add more features") — it doesn't demonstrate that you know which specific part of your own design is weakest, which is the same self-assessment skill the deep-dive chapter asked for, now applied retrospectively to the whole interview.

---

## The full loop, closed

[00 - The Framework](00 - The Framework.md) → [01 - Requirement Gathering](01 - Requirement Gathering.md) → [02 - Back-of-the-Envelope Estimation](02 - Back-of-the-Envelope Estimation.md) → [03 - High-Level Design and API Definition](03 - High-Level Design and API Definition.md) → [04 - Data Model and Storage Choice](04 - Data Model and Storage Choice.md) → [05 - Deep Dive and Bottleneck Identification](05 - Deep Dive and Bottleneck Identification.md) → here. Next time you work through a Design X applied question or a fresh prompt, run it through these seven steps deliberately, out loud, start to finish — that repetition is what turns this from a reference document into a reflex.


## Linked from

- [Deep Dive and Bottleneck Identification](05%20-%20Deep%20Dive%20and%20Bottleneck%20Identification.md)
