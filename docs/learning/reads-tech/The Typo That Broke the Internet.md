---
tags: [reads, tech, engineering-history, aws]
---

# The Typo That Broke the Internet

<small>5 min read</small>

On the morning of February 28, 2017, an engineer at Amazon Web Services was debugging a slowdown in the billing system for S3, the storage service that quietly underpins a huge chunk of the internet — Slack, Trello, Medium, dozens of news sites, and thousands of businesses nobody's heard of, all keeping their files in S3 buckets scattered across Amazon's US-EAST-1 region in Virginia.

The billing subsystem was running slower than it should. The playbook for this, established and routine, was to take a small number of servers out of the subsystem to free up capacity. The engineer ran the command. It was supposed to remove a small set of servers. Instead, due to how the input was entered, it removed a much larger set than intended — including servers that two other, completely unrelated S3 subsystems depended on to function.

One of those subsystems handled the index — the enormous internal directory that maps every object stored in S3 to where its actual bytes live on disk. The other handled the placement of new objects. Both had been running continuously for years. Nobody currently on the team had ever needed to restart either of them from a cold start, because they'd simply never gone down. Restarting a system you've never restarted is a different problem than restarting one you restart every week — every assumption about "how long this takes" and "what order things need to happen in" is untested.

And it turned out both subsystems needed to run a full safety check across the entire metadata for the S3 region before they'd let any new state changes through — a check that, at the scale of every object stored in US-EAST-1, took far longer than anyone expected. Not minutes. Hours.

## What actually happens when "the storage layer" goes down

Here's the part that made this outage different from a normal one: S3 isn't just a service people use directly to store cat photos. It's infrastructure that other infrastructure depends on. The AWS Service Health Dashboard — the page Amazon uses to tell customers "yes, we know, we're on it" — was itself hosted partly on S3. So for a while, Amazon's own status page couldn't fully update to say S3 was down, because part of what it needed to render was, itself, unavailable. Engineers were reduced to manually posting updates through channels that didn't depend on the broken system, while customers refreshed a dashboard that couldn't tell them anything.

Multiply that by every company that had, reasonably, decided not to build their own storage layer and used S3 instead. Sites that stored user-uploaded images stopped loading those images. Apps that used S3 as a backing store for feature flags or configuration stopped starting up cleanly, because they couldn't fetch their own config. Some companies discovered, in real time, that their "resilient, multi-service" architecture had one quiet single point of failure they'd never mapped, because it was a managed service they trusted to just work.

The outage lasted around four hours before S3 was fully healthy again. Four hours doesn't sound like a long time. Measured in how much of the internet politely stopped functioning during a Tuesday morning, it was enormous.

## The actual lesson, which isn't "don't make typos"

It's tempting to read this story and conclude the lesson is "be more careful when typing commands." That's not really it, and Amazon's own postmortem didn't frame it that way either. The real lesson is about two things that show up in almost every large-scale outage if you look closely enough.

The first is that **the tool that lets you do something quickly is exactly the tool that lets you do the wrong thing quickly.** The command that removed too many servers wasn't some obscure, dangerous operation — it was the routine, well-practiced playbook for a common situation. The danger wasn't in doing something unusual; it was in a normal action having a blast radius nobody had bothered to bound. Good systems don't just make the right action easy — they make it structurally hard for a normal, well-intentioned action to accidentally remove more capacity than intended. That's the origin of things like requiring a minimum server count that can never be taken below a floor, or requiring an explicit confirmation when a removal exceeds some percentage of the fleet — safeguards that exist specifically because "a person typed the wrong number once" is not a rare or exotic failure mode. It's one of the most common ones there is.

The second is about the danger of components that never restart. A system that's been running continuously for years without ever going through a cold start has an unverified assumption baked into it: "this will restart quickly and cleanly when needed." Nobody's actually testing that assumption, because testing it means causing an outage on purpose. The system accumulates a kind of unverified confidence — everyone assumes it's fine because it's never been a problem, but "never been a problem" and "known to work" are not the same claim, and the gap between them only becomes visible at the worst possible moment. This is part of why chaos engineering — deliberately, safely breaking things in production to verify recovery actually works the way you assume it does — exists as a discipline at all. It's not recklessness. It's converting an unverified assumption into a tested fact, on a schedule you control, instead of finding out the hard way.

## Why this particular story stuck

Outages happen constantly, most of them boring and local, fixed before most users notice. This one stuck in the industry's collective memory for a specific reason: it was a moment where a huge number of engineers, at a huge number of companies, discovered simultaneously just how much of the internet's apparent stability was resting on the assumption that a single regional storage service would simply never have a bad morning. It wasn't really a story about one typo. It was a story about how much invisible, unexamined dependency had quietly accumulated underneath everyone's applications — and how a four-hour outage in one AWS region was enough to make that dependency visible to millions of people who had no idea it existed until their app stopped loading images.
