---
tags: [reads, tech, engineering-history, incidents, distributed-systems, databases, github]
---

# The Network Partition That Broke GitHub

<small>6 min read</small>

On October 21, 2018, a routine piece of network maintenance in one of GitHub's East Coast data centers caused a network link between two facilities to fail for approximately 43 seconds. Forty-three seconds is not a long outage by any normal measure — most systems wouldn't notice, and most that did would recover the moment the link came back. Instead, that brief partition triggered a chain of automated decisions that left GitHub running in a degraded state for the better part of a day, with delayed webhooks, stale data, and inconsistent pull request state visible to users worldwide, and it took GitHub's engineers roughly 24 hours to fully reconcile the underlying mess and restore normal service. A network blip measured in seconds produced an incident measured in days.

## What split-brain actually looks like

GitHub's core metadata — usernames, repositories, issues, pull requests, essentially everything that isn't raw git object data — lived in a MySQL cluster, with a primary database in one data center handling all writes and replicas elsewhere for redundancy and read scaling. Sitting on top of this was an orchestration system whose job was to watch for a database failure and automatically promote a healthy replica to primary if the existing one became unreachable.

When the network link between East Coast facilities dropped, the orchestrator lost contact with the existing primary. From where it sat, this looked exactly like the primary had failed, which is the situation it existed to handle. It did what it was built to do: it promoted a different database — one sitting in GitHub's West Coast facility — to be the new primary, and started directing writes there.

The problem is that the West Coast replica was not fully caught up. Replication lag meant it was missing a small window of recent writes that had landed on the original East Coast primary just before the partition. And critically, the original East Coast primary hadn't actually died — it was still up, still reachable by clients on its own side of the partition, and for a brief window, both databases were independently accepting writes as if each were the one true source of truth. This is split-brain in its most literal form: a system built around the assumption that there is exactly one authoritative leader at any given moment, briefly and silently having two, each unaware of the other, each recording state the other doesn't have and never will unless something intervenes.

By the time the network link came back and the orchestrator's confusion resolved, GitHub had two divergent sets of writes — one small set that had landed only on the original East Coast primary during the partition, and everything that had landed on the newly-promoted West Coast primary afterward, itself missing that earlier window of data. There was no way to simply pick one and discard the other without losing real user data: comments, issue updates, security settings, all created by real people during a window when the system was quietly telling everyone it was working normally.

## Why "just fail over" needs a referee

Automatic failover is, in isolation, good engineering. A database that can't promote a new leader without a human paging in at 3am is a worse system than one that can, in the common case where the old leader is genuinely, unambiguously dead. The trouble is the word unambiguously. A network partition doesn't tell either side of the split which side is dead — it just makes each side unable to see the other, which looks identical to "the other side crashed" from purely local information.

This is why serious failover systems need more than a single node deciding, on its own judgment, that it's time to promote a new leader — they need a quorum, a majority of independent observers who agree the old leader is actually unreachable, not just unreachable from one vantage point. And they need fencing: a mechanism that guarantees the old leader, even if it's still alive and doesn't know it's been demoted, physically cannot keep accepting writes once a new leader has been promoted. Without fencing, "failover" doesn't replace the old leader — it adds a second one, and a system with two leaders that don't know about each other is worse than a system with zero, because zero leaders fails loudly and immediately, while two leaders fails quietly and compounds for as long as nobody notices.

GitHub's own account of the incident afterward pointed at exactly this gap: the orchestrator was empowered to promote a new primary based on a local, single-vantage-point view of failure, without a strong enough mechanism to guarantee the old primary was actually fenced off from continuing to serve writes.

## Availability and consistency, playing out in real time

This incident is usually filed under the CAP theorem — during a network partition, a distributed system has to choose between staying available (keep accepting reads and writes on both sides, and risk them diverging) and staying consistent (refuse writes on the minority or uncertain side, and accept downtime instead). That tradeoff sounds abstract in a classroom. GitHub lived the concrete version of it: their systems chose availability, kept accepting writes on both sides of a 43-second partition, and consistency was the thing that broke — quietly, in the background, only becoming visible as an accumulating backlog of unresolved conflicts that took an entire day of careful, mostly manual reconciliation to untangle safely, because you cannot just script your way out of merging two divergent versions of somebody's issue thread without risking silently losing one of them.

The uncomfortable part is that GitHub's original choice — favor availability, keep the site up — wasn't unreasonable in the moment. The partition really was brief. The instinct to keep serving users rather than halt everything is usually the right one. What turned a 43-second network event into a 24-hour incident wasn't the choice to favor availability; it was that the systems making that choice automatically, in seconds, didn't have the safeguards to make it safely.

## The generalizable lesson

Automated failover, like any automation acting on incomplete information, needs to be at least as conservative as the humans it's replacing about the one failure mode a single observer structurally cannot rule out: that the thing it thinks is dead is actually alive and just out of sight. The fix isn't to slow failover down across the board — most failures genuinely are what they look like, and hesitating on those has its own cost. The fix is to make the system distinguish, cheaply and quickly, between "confirmed dead by multiple independent observers, safe to fence and replace" and "unreachable from here, could be anything," and to only take the irreversible action — promoting a new leader and letting it accept writes — once you're in the first category. The cost of getting that distinction wrong isn't measured in the length of the network blip. It's measured in how long it takes to manually reconcile everything the automation quietly let diverge while nobody was looking.


## Linked from

- [1_Tech & Engineering](index.md)
