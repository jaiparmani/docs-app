---
tags: [reads, tech, engineering-history, incidents, security, malware]
---

# The Worm That Accidentally DoS'd the Early Internet

<small>6 min read</small>

In November 1988, a graduate student at Cornell named Robert Tappan Morris released a self-replicating program onto the internet, which at the time was a research and academic network of roughly 60,000 connected computers, small enough that most system administrators on it more or less knew of each other. Within about 24 hours, an estimated one in ten of those machines — some accounts put it higher — had crashed or become unusably slow, universities and research labs across the country were pulling network connections to stop the spread, and what later became known as the Morris Worm had produced the first incident that looked, to the people living through it, like the internet itself breaking. Morris was not trying to cause that. His own stated intent, and the design of the program itself, both point toward something closer to a research curiosity: a program meant to quietly spread from machine to machine and report back roughly how big the internet actually was, a number nobody at the time had a good way of measuring.

## Three doors, one of them formative

The worm spread using a small number of specific weaknesses, and one of them deserves particular attention because of what it represents in the history of computer security. Unix machines of the era commonly ran a service called `fingerd`, which answered queries about who was logged into a system — a mundane, low-stakes piece of software. The version of `fingerd` on many machines had a bug: it read input from the network into a fixed-size buffer without checking whether the input was actually short enough to fit.

This is a buffer overflow, and 1988 is early enough in computing history that the bug class barely had a name yet. Feed `fingerd` a request longer than the buffer it was written into, and the extra bytes don't vanish — they spill past the end of the buffer and overwrite whatever happened to be sitting in adjacent memory, which, depending on how the program was laid out, could include the return address the program uses to figure out where to resume execution once the current function finishes. Craft the overflow carefully enough, and you can make that overwritten return address point to code of your own choosing, embedded in the very data you sent as the "oversized" request. The worm did exactly this, sending a crafted string to `fingerd` on target machines that caused it to execute a small piece of the worm's own code instead of quietly failing or crashing.

That is buffer overflow exploitation as a mechanism, essentially unchanged in principle from decades of exploits that came after it — the same basic idea reappears in browser vulnerabilities, in embedded device firmware bugs, in decades of CVEs entirely unrelated to `fingerd` or Unix or 1988. The worm also used a second route: sendmail, the mail-transfer program most Unix machines ran, had a debugging feature that, if left enabled, allowed commands to be piped in through means that were never meant to be reachable from an ordinary incoming connection. And as a third route, it simply tried lists of common and weak passwords against user accounts, because on some fraction of any large population of machines, that alone is enough.

None of these three techniques individually would have made headlines. Buffer overflows, debug flags left on in production, and weak passwords are exactly the unglamorous, almost boring categories of flaw that show up in nearly every security postmortem written since. What made 1988 different wasn't that the vulnerabilities were exotic. It's that almost nobody was thinking about them as a class of problem yet, so almost nobody had patched against them, on almost any machine, anywhere.

## The bug that turned a probe into a denial of service

Here is the detail that made the Morris Worm a genuine catastrophe rather than a curiosity that quietly measured the internet and vanished: it was explicitly designed to avoid re-infecting machines it had already infected, using a check that asked a target machine whether a copy of the worm was already running there. But Morris, apparently worried that system administrators would simply run a fake decoy process that always answered "yes, already infected" as a cheap way to inoculate their machines, built the check to sometimes ignore that answer and infect the machine again anyway — deliberately, as a countermeasure against a countermeasure that may not have even existed yet.

The consequence was that a single machine could end up running not one copy of the worm but dozens, each one independently scanning the network, independently attempting new infections, independently trying to propagate further, all consuming memory and CPU on a host whose original hardware had never been sized for that kind of load. Machines didn't go down because the worm was malicious in its payload — it carried no payload at all, no data destruction, no ransom, nothing designed to harm the machines it landed on. They went down because the reinfection logic meant a machine could accumulate an unbounded, exponentially growing number of worm processes competing for the same finite CPU and memory, until the machine simply ran out of resources to do anything else, including run the worm.

## Intent and outcome are not the same design property

It's tempting, looking back, to draw a clean line between "a research probe gauging the size of the internet" and "a denial-of-service attack that crashed thousands of machines," as though these are obviously different categories of thing separated by a wide gap in either intent or sophistication. The Morris Worm shows how thin that gap actually is. The difference between the program Morris apparently intended to write and the one that actually ran was a handful of design decisions about reinfection frequency — decisions made, by his own later account, to solve a narrow, specific problem, without fully working through what they'd do at scale across a network of tens of thousands of machines behaving the way real machines do.

A self-propagating program's behavior isn't determined by the intent behind any single infection. It's determined by what happens when you compound that behavior across every machine it reaches, repeatedly, with no human in the loop reviewing each step. Intent describes what the author wanted the first copy to do. Outcome is what falls out of running that logic exponentially, unsupervised, at whatever scale the network happens to allow — and those two things only stay aligned if every part of the design has actually been reasoned through at scale, not just at the scale of "does this work correctly on one test machine."

## The generalizable lesson

Any system built to replicate, retry, or spread itself — a worm, but also perfectly benign things like a retry loop, a cache-warming job, a service discovery mechanism, an autoscaler — inherits the same risk regardless of how good its intentions are. A small flaw in the logic that's supposed to prevent runaway growth doesn't produce a small bug; it produces an unbounded one, because the thing doing the misbehaving is itself capable of multiplying. The Morris Worm is remembered as a security story, and the buffer overflow in `fingerd` earns it a permanent place in that history. But underneath the security specifics is a systems lesson that outlasts any particular vulnerability: when you build something that can trigger more of itself, the part of the design that limits that growth is not a minor implementation detail. It is the single most safety-critical piece of logic in the entire program, and it deserves scrutiny in proportion to that, not in proportion to how simple it looks on the page.


## Linked from

- [1_Tech & Engineering](index.md)
