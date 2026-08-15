---
tags: [reads, tech, security, incidents, cryptography, openssl]
---

# The Heartbeat That Wasn't There

<small>5 min read</small>

On April 7, 2014, a coordinated disclosure went out for a vulnerability in OpenSSL, the cryptographic library underpinning a large share of the internet's encrypted connections — the software running behind the padlock on countless websites, mail servers, and VPNs. It was given a name, Heartbleed, and a logo, which was unusual enough at the time to make the story travel far beyond security mailing lists. Server operators spent the following days scrambling to patch, and then a second, less glamorous scramble began: revoking and reissuing certificates, and rotating passwords everywhere, because nobody could prove exactly what had leaked from any given server over the two years the bug had been sitting in shipped code, silently readable by anyone who knew to ask.

What makes Heartbleed worth understanding in detail, rather than filing away as "that one OpenSSL thing," is that the bug itself is almost absurdly simple to state. It is a masterclass in how a single missing check, in one small feature nobody thought much about, can undo the security guarantees of everything built on top of it.

## What a heartbeat is for

TLS connections are often long-lived — a VPN tunnel, a persistent API connection — and one practical problem with a long-lived connection is knowing whether the other end is still there. The Heartbeat Extension, added to TLS specifically to solve this, is almost comically simple by design: a client sends a small message containing some payload data and a number stating the length of that payload, and the server is supposed to echo the exact same payload straight back. If you get your echo, the connection is alive. That's the entire feature.

The vulnerable OpenSSL code implementing the server side of this did exactly what the specification described, and nothing more. It read the length field the client supplied, and then copied that many bytes, starting at the payload, into the reply — without ever checking that the payload the client actually sent was that long. A client was permitted to claim a payload of up to sixty-four kilobytes while sending, say, one byte of actual data. OpenSSL would allocate a sixty-four kilobyte reply buffer, copy the one real byte in, and then copy the remaining roughly sixty-four kilobytes from whatever happened to be sitting in memory immediately after that byte — and send the whole thing back to the client.

## Buffer over-reads, made concrete

This class of bug has a name — a buffer over-read — and it's worth being precise about the mechanics, because the concept recurs constantly under different names. A program's memory is not neatly partitioned by meaning; it's a flat address space, and adjacent bytes can belong to completely unrelated data structures depending on what the process happened to allocate and free before this moment. When code trusts a caller-supplied length to determine how much data to read or copy, and doesn't independently verify that the underlying buffer actually contains that much valid data, it will happily read past the end of the intended region and treat whatever garbage — or whatever secret — lives there as legitimate payload.

In OpenSSL's case, that adjacent memory could contain almost anything the process had recently handled, because TLS libraries handle extremely sensitive material as a matter of course: chunks of other users' recent HTTPS requests and responses, session cookies, login credentials submitted through forms, and — the detail that made this catastrophic rather than merely bad — the server's private key itself, or fragments of it, if it happened to be resident in the same memory region at the time. A private key is the one secret an entire certificate's worth of trust depends on; if it leaks, an attacker can impersonate the server indefinitely; every certificate on every server that had ever been vulnerable had to be treated as potentially compromised and reissued, regardless of whether anyone could prove it had actually leaked.

And the attack required none of the sophistication that phrase "cryptographic vulnerability" usually implies. No cracking, no computation, no privileged position on the network. Just a normal TLS connection to a normal, unpatched server, followed by a heartbeat request with a length field that lied. Repeat it enough times, from different connections, at different moments, and different slices of server memory come back each time — effectively a free, repeatable scan of whatever the process happened to be holding.

## Why "trust the caller's length" keeps happening

Heartbleed is not a one-off embarrassment; it's a specific, extremely common instance of a general failure pattern: code that receives a length or size value from an untrusted source and uses it to drive a memory operation without validating it against the actual bounds of the data. The same pattern underlies decades of buffer overflows, image and video parser exploits, and countless "index out of bounds" crashes that occasionally turn into something worse than a crash. It recurs because the trust is so easy to smuggle in implicitly. The code isn't reasoning "I will now trust an attacker." It's reasoning "the protocol says the length field describes the payload," which is true of well-behaved clients and says nothing at all about malicious ones. The bug isn't a lapse in cryptographic sophistication — the cryptography around it was fine. It's a lapse in the much more mundane discipline of never letting external input determine how much memory you read or write without checking it against reality first.

Languages and tooling have chipped away at this since — memory-safe languages that make buffer over-reads structurally impossible, fuzzers that specifically hunt for length-field mismatches, sanitizers that catch out-of-bounds reads in testing rather than production. But the underlying discipline that Heartbleed violated is not a technology, it's a habit: whenever a piece of data claims a size, verify the claim against something you control before you act on it. The moment code accepts "trust me, it's this long" from the other side of a network connection, it has handed a stranger the ability to decide how far into its own memory to reach. Heartbleed just happened to reach into the one place that mattered most.


## Linked from

- [1_Tech & Engineering](index.md)
