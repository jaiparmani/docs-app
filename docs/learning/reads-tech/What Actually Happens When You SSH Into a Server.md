---
tags: [reads, tech, security, networking, cryptography, ssh]
---

# What Actually Happens When You SSH Into a Server

<small>6 min read</small>

Most engineers type `ssh user@host`, glance at a prompt they've seen a hundred times, hit enter, and are in — and could not, if pressed, explain what actually happened between the keystroke and the shell appearing. That's a reasonable place to be, in the sense that SSH is designed precisely so you don't have to think about it. But the protocol underneath is doing something genuinely interesting: establishing a private, authenticated channel with a machine you may have never spoken to before, over a network you don't control, and doing it in a way that never once transmits the actual secret the connection depends on. Walking through it precisely is worth doing once, because the mechanism reappears, with variations, in essentially every secure protocol you use.

## First, an ordinary connection

SSH starts the way any network connection starts — a standard TCP three-way handshake to the server's port, conventionally 22. At this point nothing about the conversation is special yet; it's just a reliable, ordered byte stream between two machines, with no encryption and no identity established on either side.

The first thing exchanged over that raw connection is a version string — each side announces which SSH protocol version and which specific software implementation it's running, in plaintext, as a single line of text. This sounds trivial but it matters: both ends need to agree they're speaking a protocol version the other understands before doing anything more elaborate, and server administrators sometimes deliberately obscure this line because it also hands a would-be attacker a free hint about which known vulnerabilities might apply to that specific software version.

## Negotiating how to talk securely

With versions confirmed, both sides exchange lists of algorithms they support — for key exchange, for the symmetric cipher that will encrypt the actual session, for message authentication, for compression — in order of preference. Each side picks the first mutually supported option from the other's list. This negotiation is what lets SSH evolve over decades without breaking compatibility: a client and server built years apart, with different sets of algorithms considered acceptable, can still agree on a common subset, and it's also the layer where deliberately weak or deprecated algorithms — protocol version 1, older ciphers with known weaknesses — get excluded by servers configured not to offer them at all.

## Agreeing on a secret without ever sending it

Now comes the part that actually deserves the word cryptographic. The client and server need a shared symmetric key to encrypt the rest of the session, and they need to arrive at it without ever transmitting that key across a network an attacker might be reading. The mechanism is a Diffie-Hellman key exchange, and the trick, however many times you've seen it, is worth restating precisely: each side generates a private random value and derives a corresponding public value from it, using math specifically chosen so that combining your own private value with the other party's public value produces the same result as they get combining their private value with your public value — a shared number that only the two of you can compute, even though only the public values ever crossed the wire. An eavesdropper who captured every single packet of this exchange still cannot derive the shared secret, because doing so requires solving a problem — the discrete logarithm problem, typically over an elliptic curve in modern SSH — believed to be computationally infeasible at the key sizes in use. That shared secret becomes the basis for the symmetric session key that encrypts everything from this point forward, with password prompts, file transfers, and shell output all riding inside it.

## The prompt everyone clicks through

Diffie-Hellman alone establishes an encrypted channel to somebody, but says nothing about who — a machine sitting between you and the real server could run this same exchange with you, decrypt everything, and forward it on, and you'd never see anything obviously wrong. This is why the server presents a host key during the exchange, and why the very first time you connect to a given host, you get the prompt: "the authenticity of host X can't be established... are you sure you want to continue connecting?" along with a fingerprint of that key.

That prompt is SSH admitting, honestly, that it has no independent way to verify this is really the server you think it is — no certificate authority, no chain of trust, nothing but the key itself. What SSH actually does is called trust-on-first-use: you accept the key once, ideally after checking the fingerprint against some independent source, and the client then stores it locally. Every subsequent connection compares the server's presented key against that stored fingerprint, and if it ever changes, the client refuses to connect and displays a loud warning instead of the quiet prompt from before. That mismatch is precisely what a machine-in-the-middle attack would produce, since an attacker can't reproduce the real server's private key — so the warning exists specifically to catch that scenario on every connection after the first. TOFU is a real compromise: it does nothing to protect the very first connection against an attacker who's already positioned in the middle at that exact moment, but it protects every connection after that against precisely the attack that would otherwise be invisible.

## Proving who you are without showing your hand

With an encrypted, host-verified channel established, the last step is proving your own identity to the server — authentication — and SSH supports two structurally different approaches. Password authentication is the simple one: your password travels to the server over the now-encrypted channel and the server checks it, which is safe from eavesdropping thanks to the encryption already in place, but still means the server sees, and briefly handles, your actual password.

Public-key authentication is built to avoid that entirely, and the mechanism is the more elegant of the two. Your private key never leaves your machine — not encrypted, not otherwise, ever. The server, having been given your public key in advance, sends a challenge, and your client uses the private key to produce a digital signature over that challenge and sends back only the signature. The server verifies the signature against the public key on file and, if it's valid, knows with cryptographic certainty that whoever answered holds the corresponding private key, without that key — or even a signature over the whole session's data — ever having crossed the wire. Signing a challenge rather than the private key itself, or the session's actual traffic, means an attacker who intercepts every message of this exchange still has no way to derive the private key or reuse the signature for anything else; it was tied to this one server-generated challenge, in this one exchange, and is worthless afterward.

## Handshakes are a recurring shape, not an SSH-specific trick

Once you've traced through SSH's handshake once, it's hard not to notice the same skeleton in TLS, in signed API requests, in most modern authentication protocols: establish a shared secret through math that never requires transmitting the secret itself, verify identity through a signature over a challenge rather than by ever revealing the credential that produced it, and treat trust in an unfamiliar party as its own explicit, separately-solved problem rather than something encryption automatically provides for free. Encryption answers "can anyone else read this." Authentication answers a completely different question — "am I actually talking to who I think I am" — and conflating the two, treating an encrypted channel as though it were automatically a trusted one, is where a surprising number of real security failures actually live. SSH's design keeps them visibly, deliberately separate, which is exactly why the protocol has aged as well as it has.


## Linked from

- [1_Tech & Engineering](index.md)
