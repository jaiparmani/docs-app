---
tags: [reads, tech, engineering-history, aws, architecture]
---

# The Memo That Accidentally Built AWS

<small>6 min read</small>

Sometime around 2002, Jeff Bezos sent an internal email to engineering at Amazon. It was short. It was not a strategy document, it did not lay out a product vision, and as far as anyone outside the company can tell, it was never published, leaked in full, or officially confirmed. What we have instead is a paraphrase from memory, written nine years later by Steve Yegge — an engineer who spent several years at Amazon before moving to Google — in a long internal rant about platform thinking that he accidentally posted publicly in 2011. The rant went viral. The memo became canon. It is worth holding that provenance in mind: this is one of the most influential architectural documents in modern computing, and we know it the way we know most oral history, which is imperfectly.

The substance, as Yegge recalled it, ran roughly like this. All teams will expose their data and functionality through service interfaces. Teams must communicate with each other only through those interfaces — no direct linking, no reading another team's data store, no shared-memory backdoor, no back door of any kind. It doesn't matter what technology you use to do it. All service interfaces, without exception, must be designed from the ground up to be externalizable — meaning the team must plan and design to be able to expose the interface to developers outside the company. And then the closing line, which is why anyone remembers the memo at all: anyone who doesn't do this will be fired.

## The unglamorous middle years

Most retellings jump straight from the memo to AWS, as though the second followed the first the way a punchline follows a setup. It didn't. What actually followed was several years of tedious, morale-testing work.

Consider what "no direct database access" means to a team that has been reading another team's tables for three years. Every one of those reads is now a feature request against someone else's roadmap. You need an endpoint. They need to build it, version it, document it, and keep it alive. Latency that used to be a local join becomes a network hop with a timeout policy and a retry story and a failure mode you now have to design for. Data that used to be transactionally consistent because it lived in one database is now eventually consistent across two services, and someone has to decide what the system does in the gap. Debugging stops being a stack trace and starts being a distributed-tracing problem.

That is the ordinary cost of service decomposition, and Amazon paid it early, at scale, without the tooling that exists today — no Kubernetes, no service mesh, no managed message brokers, no OpenTelemetry, no well-trodden literature on how to do this. They were inventing the operational discipline while enforcing it. Yegge's account, and most secondhand accounts since, describe this period as genuinely painful.

## The clause that changed everything

Strip the memo down and the first three points are just good, aggressive modularity. Plenty of organizations have arrived at "services talk over interfaces" without producing anything like AWS. The clause that did the historical work is the fourth: **all interfaces must be designed to be externalizable from day one.**

This is a deceptively large demand. An internal interface can be sloppy in ways that are invisible until you try to expose it. It can assume the caller is trusted, so it has no real authentication and no authorization model. It can assume the caller is friendly, so it has no rate limiting and no quota. It can assume the caller is in the same building, so it has no meaningful documentation — the docs are a person named Dave. It can return internal identifiers, leak implementation details in its error messages, and change shape without warning because everyone who calls it sits in the same standup.

Requiring externalizability forces every one of those assumptions into the open. You need authentication because the caller might be a stranger. You need metering because you might have to bill for it. You need hard versioning because you can't make the caller upgrade. You need real documentation because there is no Dave. You need a stable, defensible boundary because you no longer control both sides of it.

And here is the accident: a team that has done all of that has not built an internal service. It has built a product. The gap between "storage that other Amazon teams use over an API" and "storage that anyone on the internet uses over an API" collapses to little more than a pricing page and a signup flow. When Amazon started shipping infrastructure publicly — SQS in 2004, then S3 and EC2 in 2006 — the hardest architectural work was already several years done. Selling it was not a pivot. It was noticing what they were standing on.

It would be too tidy to say the memo alone produced AWS; the actual origin story involves a specific set of people, a specific proposal about standardized infrastructure, and a business insight about selling undifferentiated heavy lifting. But those ideas were only actionable because the systems underneath them had already been forced into a shape that could be sold.

## Conway's Law, deliberately weaponized

Melvin Conway's 1967 observation was descriptive, not prescriptive: organizations produce designs that mirror their own communication structures. Teams that talk constantly build coupled systems. Teams separated by a floor, a time zone, or a reporting line build interfaces, because an interface is the cheapest way to stop talking.

The mandate reads as someone taking that description and running it backwards. If communication structure determines architecture, then to get the architecture you want, legislate the communication structure. Banning direct database reads is not really a database rule. It is a rule about what conversations are allowed to happen and in what form. Amazon's two-pizza teams — small, autonomous, owning a service end to end — are the organizational half of the same design. The architecture and the org chart were built as one artifact.

This is the part that survives into everything since. When teams today argue about service boundaries, they usually argue about the technology: how big should a microservice be, do we need a mesh, is this too chatty. The memo suggests those are downstream questions. The real question is which boundaries you are prepared to enforce socially — because an architectural boundary that the org chart doesn't respect will be routed around within a quarter, and a boundary the org chart does respect will hold even if the implementation behind it is mediocre.

## Contracts you can't quietly renegotiate

The reason "designed to be externalizable" works isn't that it makes interfaces nicer. It's that it removes an escape hatch.

An internal interface is a contract between people who can renegotiate it in a hallway. That renegotiability feels like velocity, and it is, right up until the point where it means nothing about the boundary is actually true — the interface is only a suggestion, and the real contract is a shared understanding that dies when people change teams. An externalizable interface can't be renegotiated in a hallway, because one party isn't in the building. Every guarantee has to be written down, enforced in code, and honored by strangers.

That constraint costs you real speed in year one. What it buys is a system whose boundaries are load-bearing rather than aspirational — and, as it turned out, a system whose parts could be sold individually, because each of them was already a thing that could stand up in front of someone who owed you nothing.
