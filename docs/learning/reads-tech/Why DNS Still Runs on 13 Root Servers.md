---
tags: [reads, tech, dns, networking, internet-infrastructure]
---

# Why DNS Still Runs on 13 Root Servers

<small>6 min read</small>

People who've heard the number at all tend to repeat it with a bit of dread: the entire internet's naming system depends on thirteen root servers, and surely that's a wildly fragile way to run something this size — thirteen machines, somewhere, that if they all went down at once would take the addressable web with them. The number thirteen is real. Almost everything the sentence implies about it is wrong, and the actual explanation involves a packet-size limit from a 1980s protocol spec and a routing trick that turns one IP address into hundreds of physical machines without the rest of the internet needing to know.

## What the root actually does

When a DNS resolver needs to look up a domain it has no cached answer for, and it's starting completely cold, it begins at the root. The root doesn't know where `example.com` lives, but it knows where the servers responsible for `.com` are, and it hands back that referral. The resolver then asks a `.com` server, which refers it further down, until eventually something answers authoritatively. The root is the top of that referral chain — the fixed, universally agreed-upon starting point every resolver on earth trusts by default, because its addresses are shipped as a small "root hints" file baked into essentially every DNS resolver implementation in existence.

That root zone is served by thirteen named identities: `a.root-servers.net` through `m.root-servers.net` — the letters of the alphabet, a through m, which is where the number comes from. This naming scheme and count were established in the 1990s, and it has been essentially frozen ever since, for reasons that have nothing to do with how much redundancy anyone thought was appropriate.

## Why thirteen, specifically

The original DNS specification constrained UDP responses to 512 bytes, because DNS was designed to run over UDP without fragmentation, and a response that exceeded the path's safe packet size risked being dropped or mangled on 1980s-era networks. A referral response from the root doesn't just need to list which servers are authoritative — it needs to include their IP addresses too (glue records), so the resolver doesn't have to make another lookup just to find the lookup server. Fit a DNS header, the query section, and a list of server names plus IP addresses into a 512-byte UDP packet, and the number of root servers you can list before running out of room comes out to right around thirteen. It wasn't chosen as an optimal redundancy figure. It was backed into as the largest number that fit inside a decades-old packet-size ceiling, and it stuck.

That ceiling is largely obsolete today — EDNS0 extensions let resolvers negotiate larger UDP responses, and DNS can fall back to TCP when needed — but the thirteen-identity structure has enormous installed-base inertia. Root hints files are baked into operating systems, resolver software, embedded devices, and appliances all over the world, most of which nobody is actively maintaining. Changing the number of root identities would mean coordinating a change to one of the most widely and passively depended-upon configuration files on the planet. Nobody has judged that worth doing, especially once a much better solution for the actual resilience problem arrived without requiring it.

## Thirteen names, hundreds of machines

That solution is anycast, and it's the part that actually answers the fragility worry. Each of the thirteen root letters is operated by a different organization — universities, government agencies, commercial operators, ICANN itself among them — and each operator doesn't run their letter from a single physical machine. They advertise the same IP address for that letter from dozens or, in aggregate across all thirteen, well over a thousand physical server sites distributed across the globe.

Anycast makes this work at the routing layer, and the trick is almost deceptively simple: the same IP prefix gets announced via BGP, the internet's core routing protocol, from many distinct physical locations simultaneously. Ordinary internet routers, doing nothing special, just running standard BGP best-path selection, will naturally route a packet toward whichever announcing location is topologically closest — fewest autonomous-system hops, best routing metric — from the router's own vantage point. The querying resolver does nothing different than sending a UDP packet to a fixed IP address. It has no idea there are hundreds of possible destinations behind that address, and it doesn't need to. The network fabric itself resolves "closest" transparently, one hop of routing decision at a time, all the way to whichever instance is nearest the query's origin.

The resilience this buys is substantial and largely invisible in normal operation. If a physical instance serving one root letter goes down — hardware failure, fiber cut, a denial-of-service attack aimed at that specific site — BGP simply stops hearing that route from that location and reconverges, sending subsequent queries to the next-nearest instance advertising the same address. Nobody's root hints file has to change. No resolver anywhere has to be told anything. The famous root server DDoS attacks over the years, including large coordinated ones, have been absorbed largely for this reason: an attacker aiming at "a root server" is usually only reaching whichever anycast instances are nearest to their own attack traffic's origin, not the global population of instances serving that letter everywhere else.

## The number is a legacy contract; the resilience is somewhere else entirely

The general shape of what happened here is worth naming on its own, because it recurs constantly in long-lived infrastructure: a fixed number, baked into an interface that an enormous number of independent systems depend on without renegotiation, becomes effectively unchangeable — not because it's still the right number, but because changing it costs more than the number is actually worth arguing about. Rather than fight that constraint, the engineering response was to build all the actual scaling and resilience underneath the interface, invisibly, without touching the part everyone else depends on staying fixed.

The same pattern shows up across the internet's oldest protocols. IPv4 address exhaustion didn't get solved by renegotiating the 32-bit address field everyone's software assumed — it got solved by inserting NAT underneath, so the public-facing contract never had to change. HTTP/2 preserved HTTP/1.1's request-response semantics while completely replacing the framing and multiplexing underneath, precisely so that decades of application code built against "HTTP works this way" wouldn't need to know anything changed. The transferable lesson isn't really about DNS. It's that when you're staring at some fixed, seemingly arbitrary constant deep in a system's public interface, the productive question usually isn't "why don't they just change it" — it's "what did they build underneath it instead," because that's almost always where the real engineering, and the real answer, is sitting.


## Linked from

- [1_Tech & Engineering](index.md)
