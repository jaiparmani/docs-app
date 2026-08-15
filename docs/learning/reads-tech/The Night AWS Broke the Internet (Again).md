---
tags: [reads, tech, engineering-history, incidents, cloud, aws]
---

# The Night AWS Broke the Internet (Again)

<small>5 min read</small>

On the afternoon of February 28, 2017, a large swath of the internet started returning errors, timing out, or simply refusing to load images. S3, Amazon's object storage service, was down in its oldest and largest region, us-east-1, and S3 is the kind of infrastructure that doesn't fail quietly. It hosts static assets for a huge number of consumer sites, backs storage for countless SaaS products, and — less visibly — sits underneath other AWS services that customers don't think of as "storage" at all. For about four hours, elevated error rates rippled through the internet, and the outage became notable for a detail almost too fitting to be true: AWS's own Service Health Dashboard, the page meant to tell customers what was going on, couldn't fully update, because part of it depended on the very S3 region that had just gone down.

The proximate cause was almost absurdly small. An engineer on the S3 team was debugging an issue with the billing subsystem, following an established playbook to take a limited number of servers belonging to one S3 subsystem offline. The command that executes this playbook takes an input specifying which servers to remove. On that day, the input was mistyped, and the command executed against a far larger set of servers than intended — enough to pull a significant amount of capacity out of two subsystems that the rest of S3, and a large fraction of AWS, quietly depended on.

## Two subsystems nobody thinks about until they're gone

S3 isn't a single monolithic service; it's built from several subsystems working together, and two of them turned out to be load-bearing for everything else. The index subsystem manages the metadata for every object stored in the region — essentially the map from "this key" to "this location on disk." The placement subsystem decides where new objects get physically stored. Both had enough capacity removed that they fell below the level needed to function, and both required a full restart to recover.

That restart was the actual outage. Removing servers is fast; a full restart of subsystems at that scale, with safety checks that validate metadata integrity along the way, is not — particularly because these subsystems hadn't needed a full cold restart in years. S3 had grown enormously since the last time anyone had exercised that path, and the recovery took far longer than anyone had planned for, precisely because the operational muscle for it had gone unused for so long that its assumptions were stale.

While the index and placement subsystems were down, S3 in us-east-1 couldn't reliably serve GET, PUT, or LIST requests. That alone would have been a serious but contained incident. What made it a story about the entire internet was what else was quietly built on top of S3 in that region: other AWS services used it to store their own metadata and configuration, the console needed it, and a number of AWS's own control-plane operations — spinning up new EC2 instances, for instance — touched S3 along the way, so the failure propagated well beyond anyone who thought of themselves as "an S3 customer."

## A small, scoped command that wasn't small or scoped

The engineer's action was, by every reasonable operational definition, routine: a documented playbook, a targeted removal, a small number of servers, run before without incident. Nothing about it looked like a company-wide risk. That's exactly the shape of the failure worth paying attention to — the danger wasn't in doing something unusual, it was in doing something ordinary against a system whose actual dependency graph nobody had fully in view. The command's blast radius, as understood by the person running it, was "some servers in one subsystem." The command's actual blast radius, as determined by what depended on those servers, was most of a region.

Before this incident, there was no tooling-level check preventing an operator from removing more capacity than a subsystem could safely lose. The check that would have caught this — a floor below which the system refuses to let you go, no matter what the input says — simply didn't exist, because nobody had needed it yet. AWS's public postmortem was candid about this, and the fix that followed was equally direct: capacity-removal tooling got a minimum threshold that it will not let an operator cross regardless of what's typed, and S3's internal subsystems were restructured to recover in smaller, independent partitions — "cells" — so that a future full restart wouldn't mean the entire region's index or placement capacity coming back online as one indivisible, hours-long event.

## The postmortem that mattered more than the outage

What makes this incident worth revisiting isn't the typo. Typos happen constantly and almost never take down a region; this one did because it landed on a system with no lower bound on how much capacity a single command could remove, and because the systems relying on that capacity had never been enumerated in one place. The interesting failure is structural: a safety property — "you cannot remove more capacity than the subsystem needs to keep running" — that felt implicit and obvious in the abstract had never actually been encoded anywhere a machine would enforce it. It lived only in the expectation that operators would type the right number.

## The lesson that outlasts the incident

The generalizable point isn't "double-check your inputs," though that's true. It's that operational safety has to be a property of the system, not a property of the operator's intentions. Any command capable of removing capacity, deleting records, or disabling a service needs a hard floor built into the tool itself — a limit the system enforces regardless of what's typed, reviewed, or assumed to be routine. "This has always worked before" is not evidence of safety; it's evidence that the failure mode hasn't been triggered yet. The scariest operations in any infrastructure are rarely the ones flagged as dangerous — those get guardrails by default. They're the ones categorized as routine, run from a playbook, performed by someone who has done it a dozen times, against a dependency graph that turns out to be much larger than the mental model anyone was carrying into the terminal that day.
