---
tags: [reads, tech, security, networking, ddos, cdn]
---

# What Actually Happens During a DDoS

<small>6 min read</small>

The phrase "DDoS attack" gets used as though it names one thing — a flood, an overwhelming wave of traffic, the internet equivalent of a mob pushing through a door. That mental model leads to a mental model of the fix, too: add more bandwidth, buy a bigger pipe, weather the storm. Sometimes that works. More often it's aiming the wrong tool at the problem entirely, because "DDoS" isn't one attack. It's a label covering three mechanically distinct categories that exhaust three different resources, and a defense built for one does close to nothing against the other two.

## Volumetric: exhausting the pipe

The category that matches the popular mental model is volumetric attacks, and their goal is exactly what it sounds like — saturate the network link into a target so completely that legitimate traffic simply cannot get through, the same way a road jams regardless of whether every car on it is going somewhere real. The brute-force version is a botnet of compromised devices all sending traffic directly at a target simultaneously, but the more efficient and more commonly seen version is a reflection and amplification attack, and it's worth understanding the trick precisely because it's elegant in an unpleasant way.

Certain protocols — DNS and NTP are the classic examples — will respond to a small query with a much larger response. An attacker spoofs the source address of their queries, replacing it with the target's IP address, and sends those small queries to large numbers of open DNS or NTP servers on the internet. Each server, doing exactly what it's supposed to do, sends its (much larger) response not back to the attacker but to the spoofed address — the target. The attacker needs only a small amount of outbound bandwidth to trigger a vastly larger amount of inbound bandwidth aimed at the victim, with the added benefit that the traffic arrives from thousands of legitimate, innocent DNS and NTP servers rather than from the attacker's own infrastructure, making it far harder to filter by source. This is why open, misconfigured DNS resolvers exposed to the whole internet are treated as a real liability even though the operator running one has no data of their own at stake — they become unwitting amplifiers for someone else's attack.

Against a purely volumetric attack, "add more bandwidth" is at least a coherent response, because the resource under attack really is bandwidth. It's also usually not the affordable one — an attacker coordinating a large botnet can often summon more attack bandwidth cheaply than a target can economically provision in defensive capacity, which is exactly why this category of defense has moved almost entirely to specialized providers with globally distributed capacity, rather than staying something an individual target provisions for itself.

## Protocol attacks: exhausting connection state

The second category doesn't need to saturate any link at all. It targets not bandwidth but the state that server software has to maintain to manage connections, and the canonical example is the SYN flood, which exploits the mechanics of how a TCP connection gets established.

A normal TCP handshake is three steps: the client sends a SYN packet, the server responds with a SYN-ACK and allocates a small amount of memory to track this half-open connection while it waits, and the client completes the handshake with an ACK. A SYN flood sends a large volume of SYN packets, typically with spoofed, unreachable source addresses, and never sends the final ACK. The server dutifully allocates tracking state for each half-open connection and waits for a completion that will never come. Because that per-connection state table has a finite size — a real, but limited, amount of memory reserved for pending connections — enough spoofed SYNs exhaust the table entirely, and the server stops being able to accept new legitimate connections, even though the actual network link carrying this traffic might be nowhere near saturated. The bottleneck here isn't bandwidth, it's a data structure with a ceiling.

This is why the fix looks different from the volumetric case. SYN cookies — a technique where the server encodes the connection state cryptographically into the SYN-ACK's sequence number instead of storing it locally, and only allocates real state once the final ACK proves the handshake is genuine — sidestep the exhaustion entirely by removing the need to hold state for connections that might never complete. More bandwidth does nothing for this category, because the pipe was never the bottleneck.

## Application-layer attacks: exhausting the expensive part

The third category is the hardest to defend against precisely because it can look, moment to moment, like real traffic — because it is real traffic, in the sense of well-formed requests over completed, legitimate connections. It targets neither bandwidth nor connection-table memory, but the actual computational cost of serving a specific request. An attacker who repeatedly hits a search endpoint that triggers an expensive database query, or a page that regenerates something computationally heavy on every load, can degrade or take down a service with a request volume that would be unremarkable for almost any other endpoint on the same site. There's no unusual packet shape to filter on, no spoofed source to block, no protocol violation to detect. Just requests that individually look completely legitimate, aimed deliberately at whichever part of the application is disproportionately expensive to serve.

Defending against this category looks less like network engineering and more like application-aware traffic management: rate-limiting per client, distinguishing real browsers from scripted clients through behavioral and fingerprinting signals, caching expensive responses so repeated identical requests don't repeat the expensive work, and challenge mechanisms — CAPTCHAs, proof-of-work challenges, JavaScript execution checks — that filter out simple scripted clients without meaningfully inconveniencing real users. None of this is a bandwidth question at all.

## Why a CDN sits at the front for all three

This is exactly the reason services like Cloudflare or Akamai sit as reverse proxies in front of a huge share of the internet's traffic rather than each site defending itself independently — a single architectural position lets one provider apply three genuinely different countermeasures, matched to which resource is actually under attack, without the origin server ever seeing most of the malicious traffic. Their globally distributed network absorbs volumetric floods across enormous aggregate capacity that no single customer could justify provisioning for themselves, and it does so by geography — traffic gets absorbed near where it originates rather than all converging on one origin. Their edge servers terminate TCP connections and handle the SYN handshake themselves, using techniques like SYN cookies at a layer the origin server never has to deal with, so a protocol attack exhausts the CDN's connection-handling infrastructure, built for exactly this, instead of the origin's. And because the CDN proxy sees the actual request pattern across the request layer, it can apply rate-limiting, caching, and bot-detection heuristics that distinguish a real user's search query from ten thousand identical automated ones — a judgment that requires seeing the application traffic, not just the packets.

## The lesson underneath the acronym

The generalizable point isn't really about DDoS at all — it's about resource exhaustion attacks generally, a category far broader than network security. Any system has some cheapest thing an adversary can do that costs the defender disproportionately more to absorb than it costs the attacker to send: an amplification protocol, a stateful handshake, an expensive query, a slow database write triggered by a cheap API call. Defending well starts with correctly identifying which specific resource is the bottleneck under attack — bandwidth, connection state, or compute — because a defense aimed at the wrong resource, however well-engineered, spends money and effort protecting a dimension nobody attacked while the real ceiling stays exactly where it was.


## Linked from

- [1_Tech & Engineering](index.md)
