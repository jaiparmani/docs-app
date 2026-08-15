---
tags: [reads, tech, javascript, npm, open-source-infrastructure]
---

# The Package That Broke the Internet

<small>6 min read</small>

In March 2016, a developer named Azer Koçulu got into a naming dispute with the messaging company Kik over a package he had published to npm, the JavaScript package registry, called `kik`. Npm sided with Kik and reassigned the package name. In protest, Koçulu unpublished every package he had ever published to the registry — around 250 of them. One of those packages was called `left-pad`. It was eleven lines of code. It took a string and padded it with a character until it reached a given length, the kind of thing most developers could write correctly in under a minute if they needed it.

Within hours, builds started failing across a large fraction of the JavaScript ecosystem. Projects that had nothing to do with string padding, and whose authors had never heard of `left-pad`, could not install their dependencies or run their CI pipelines. Babel, one of the most widely used tools in the JavaScript world, was affected. So were countless projects that depended on Babel, or on something that depended on Babel, without any of those developers ever having typed `npm install left-pad` themselves. Npm restored the package within a few hours under emergency policy, but the incident became the standard reference point for a question the industry had been avoiding: what happens when the software supply chain has a single point of failure that nobody can see, because it's eleven lines deep in somebody else's dependency tree.

## Semantic versioning is a promise, not a guarantee

Npm packages are versioned under semantic versioning — a scheme of `major.minor.patch` numbers where, by convention, a patch increment means a bug fix with no behavior change, a minor increment means new functionality that's backward compatible, and a major increment means something broke. Package authors declare their dependencies not as exact versions but as ranges: a caret (`^1.2.0`) means "anything compatible with 1.2.0 up to but not including 2.0.0," a tilde means an even narrower range. The entire system works by trusting that authors follow the convention.

This is what makes dependency resolution largely automatic and, most of the time, invisible. When you install a project, npm doesn't fetch the exact versions the author tested against — unless a lockfile pins them — it resolves each range to whatever the newest matching version happens to be at install time. That's convenient because it means bug fixes propagate without anyone doing anything. It's also the reason `left-pad` disappearing was catastrophic rather than merely annoying: the packages that depended on it weren't asking for a specific, cached copy. They were asking the registry, at build time, for whatever satisfied their version range, and the registry no longer had an answer. The failure didn't happen when the code ran. It happened when the code tried to be assembled in the first place.

## A tree you never chose to plant

The deeper cause is transitive dependencies — the fact that your project's dependencies have their own dependencies, which have their own, forming a tree that can easily run tens of thousands of packages deep for a project whose own `package.json` lists a couple dozen direct entries. The JavaScript ecosystem, more than most, developed a culture of small, single-purpose packages: rather than writing a ten-line utility inline, it became idiomatic to pull in a package for it, because npm made publishing and installing frictionless. That culture is not obviously wrong — small, focused packages are easier to audit individually and easier to reuse — but it has a compounding effect on the shape of the dependency graph. Nobody sits down and decides to depend on `left-pad`. A tool you chose depends on a tool it chose, four or five layers removed, and by the time the chain reaches you, you have no visibility into it at all. Most developers whose builds broke that day had never seen the name `left-pad` before the outage.

This is the part that makes the incident more interesting than "a developer threw a tantrum." The package itself had no importance — it wasn't clever, it wasn't hard to replace, several engineers wrote functionally identical replacements within the hour. What made it dangerous was purely structural: it sat, unexamined, at a chokepoint in a graph that thousands of unrelated projects happened to route through. Criticality in a dependency graph isn't about how much a piece of code does. It's about how many paths run through it, and that number is a property of the graph, not of the code.

## The registry itself is the single point of failure

Widen the lens further and the actual lesson isn't about `left-pad` or even about transitive depth — it's about what a package registry is. Npm, at the time, allowed any author to unpublish any package at will, with no grace period and no consideration of how many other packages depended on it. The registry was the sole source of truth for what `left-pad@1.0.0` actually contained; there was no distributed or cached fallback baked into the default tooling that most projects relied on. So the moment the registry's answer to "what is `left-pad`" changed from "here's the code" to "nothing," every build that hadn't already cached a copy broke simultaneously, worldwide, regardless of how trivial the missing code was.

A single point of failure doesn't require a single point of importance. It requires a single point of *lookup* that many independent things depend on without redundancy. The registry was that point. This is why npm's actual fix wasn't just restoring the package — it was changing the unpublish policy going forward, restricting how and when packages could be pulled once other packages depended on them, because the structural vulnerability was never really about `left-pad`. It was about how much of the internet's build infrastructure ultimately terminates in one registry's willingness to keep answering the same query the same way indefinitely.

## The size of the thing was never the risk

The instinct to assess risk by asking "how important is this component" is a natural one, and it's the wrong question for supply chains. The right question is "how many things fail if this one answer changes," which is a property of position in a graph, not of complexity or size. An eleven-line utility with no dependencies of its own, written by someone with no obligation to maintain it, sitting at a chokepoint used by thousands of unrelated projects, is a bigger risk than a genuinely complex library that only three people import.

This generalizes past package managers. DNS records, shared authentication libraries, a single internal config service, a widely reused Terraform module, a common base Docker image — any of these can become the `left-pad` of an organization: unglamorous, apparently replaceable in isolation, and structurally load-bearing in a way that's only visible once you ask not "what does this do" but "what depends on this, transitively, without knowing it." Lockfiles and pinned versions blunt the immediate blast radius, and that's worth doing. But the durable habit is auditing your dependency graph by depth and fan-in, not by importance — because the thing that breaks everything is rarely the thing anyone thought to watch.


## Linked from

- [1_Tech & Engineering](index.md)
