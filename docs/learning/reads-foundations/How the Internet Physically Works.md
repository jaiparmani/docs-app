---
tags: [reads, foundations, networking, infrastructure]
---

# How the Internet Physically Works

<small>6 min read</small>

If you build software for a living, you spend all day on top of something you may never have looked underneath. "The cloud" is an abstraction that works extraordinarily well — right up until a cable is cut somewhere in the Red Sea, or a routing misconfiguration in one country makes half a continent's traffic vanish, and suddenly the abstraction has a very physical shape.

The single most useful correction to most people's mental model: **the internet is not a network.** It's thousands of independently owned networks that have agreed to carry each other's traffic, held together by protocols that run substantially on trust.

## It's cables, and there aren't many

Almost all intercontinental internet traffic travels through fibre optic cables lying on the ocean floor. Not satellites — satellites carry a tiny fraction, and always have. Physical glass, on the seabed, carrying pulses of light.

These cables are startlingly slender for what they do, roughly garden-hose thickness for much of their length, armoured near shore where fishing trawlers and anchors are a hazard. There are a few hundred of them worldwide, and the number of cables serving any particular route is often small enough to count on your fingers. A handful of chokepoints — narrow seas, straits, landing points where many cables come ashore in the same small area — carry a wildly disproportionate share of global traffic.

They break with some regularity. Anchors drag across them, undersea landslides bury them, fishing gear snags them. When one breaks, a specialised repair ship sails out, grapples the cable off the seabed, hauls it to the surface, splices it, and drops it back. This takes days to weeks depending on weather and how far the nearest repair vessel was. There are not many such ships.

The reason you rarely notice is redundancy — traffic reroutes over other cables — which works well until several cuts happen at once on the same route, at which point entire regions experience the internet becoming slow and strange in ways their users find inexplicable.

## Where networks meet

A cable landing on a beach doesn't get you very far by itself. The traffic has to get from one network to another, and that happens at specific buildings.

An **internet exchange point** is, physically, a facility where many networks bring their equipment and connect to each other directly. Instead of a small ISP paying a large transit provider to carry its traffic all the way around, it can plug in at an exchange and hand traffic directly to the network that wants it — cheaper, faster, and with fewer hops.

This creates real geography. Certain cities became major internet hubs for reasons of history and cable landing convenience, and traffic between two nearby countries sometimes routes through a distant hub because that's where their networks actually meet. Two users a few kilometres apart can have their packets travel thousands of kilometres to reach each other, purely because of where the interconnection happens.

## BGP, and the trust problem at its heart

Here is the part that sounds made up when you first learn it.

Networks tell each other which addresses they can reach using a protocol called **BGP** — Border Gateway Protocol. A network announces "I can reach this block of addresses," neighbouring networks propagate that announcement onward, and traffic flows toward whoever announced the most specific route.

The protocol was designed for a small, collegial internet where operators knew each other. As a consequence, its foundational assumption is that **networks tell the truth about what they can reach.** For a long time, there was very little in the protocol itself preventing a network from announcing routes to addresses it had no business claiming.

The results have been exactly what you'd expect. There have been multiple significant incidents where a network — sometimes maliciously, more often through a straightforward configuration mistake — announced routes for address space belonging to someone else, and large volumes of global traffic obediently flowed to the wrong place. In some cases services became unreachable; in others, traffic was routed through unexpected countries before continuing on.

Real mitigations exist and have been deployed steadily — cryptographic route origin validation, filtering agreements between providers, monitoring systems that alert on suspicious announcements. The situation is meaningfully better than a decade ago. But the underlying architecture still rests on a large number of independent operators configuring things correctly, which is a sociological guarantee as much as a technical one.

## The naming layer

DNS sits on top of all this, translating names humans can remember into addresses machines can route to.

It's hierarchical, which is what lets it scale. Ask for a name and the resolution walks down a tree: root servers know who handles each top-level domain, those servers know who handles each domain within it, and so on until you reach the authoritative server that actually knows the answer. Caching at every layer means the vast majority of lookups never travel far.

DNS is also, in practice, one of the more common causes of large outages, for a reason worth appreciating: it sits in front of *everything*. A service can be perfectly healthy and completely unreachable because the layer that tells clients where to find it has failed. Any engineer who has spent a long evening on an incident that eventually turned out to be a DNS problem knows the specific flavour of that realisation.

## What this means for anything you build

Several practical things fall out of the physical picture, and they're the reason it's worth knowing.

**Latency has a hard floor set by physics.** Light in fibre travels at roughly two-thirds of its vacuum speed, and cables don't run in straight lines. A round trip between distant continents costs on the order of a hundred-plus milliseconds no matter how much money you spend, because the constraint is the speed of light over an actual physical path. No amount of optimisation removes it. This is why a CDN edge location exists at all — the only way to beat the distance is to not travel it.

**"The cloud" is specific buildings in specific places.** A region is a set of data centres in a geographic area with particular fibre running into them. Choosing a region is choosing physical distance from your users and physical exposure to that area's cable routes, power grid, and jurisdiction. Multi-region architecture is, underneath the abstraction, a bet that two sets of buildings won't fail at once.

**Your service depends on organisations you have no relationship with.** Between your users and your servers sit transit providers, exchange points, and cable operators you've never heard of and cannot call. Most of the time this is invisible. Occasionally one of them makes a mistake and your dashboards show a problem that is entirely real and entirely not yours.

The abstraction is genuinely excellent — it's why any of this is buildable. But it's worth knowing, at least once, that underneath the API calls there is glass on a seabed, a building where cables meet, and a protocol quietly assuming that everyone is being honest.
