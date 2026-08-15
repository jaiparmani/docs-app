---
tags: [reads, tech, networking, browsers, web, systems]
---

# What Happens Between You Typing a URL and the Page Appearing

<small>6 min read</small>

This is the question every systems interview eventually asks, and most people can recite the shape of the answer: DNS, then TCP, then TLS, then HTTP, then the page renders. What that recitation usually skips is the reason for any of the ordering, which means it functions as trivia rather than understanding. Each of these layers exists because the layer beneath it solves a narrower problem than the one you actually have, and stacking them in this specific order is what makes "type a name, get a page" possible at all. Take any one of them away and something specific and predictable breaks — which is the more useful way to hold the whole sequence in your head.

## DNS: turning a name into an address, with an escape hatch

Computers route traffic using numeric addresses, not names, so the first problem is translating `example.com` into an IP address. The browser checks its own cache, then the operating system's, and if neither has an answer, asks a recursive resolver — typically run by your ISP or a public service — which, if it doesn't already have the answer cached, walks the DNS hierarchy: a root server points it toward the servers for `.com`, those point it toward the authoritative servers for `example.com`, and those finally return the address, which gets cached at every layer along the way according to a time-to-live the domain owner sets.

The reason this indirection exists, rather than everyone just memorizing IP addresses, isn't really about human convenience — it's that it lets the address behind a name change without breaking every reference to that name. A company can move its infrastructure to a new data center, switch cloud providers, or fail over to a backup server, and every browser, bookmark, and hardcoded link on the internet keeps working, because they never pointed at an address in the first place. They pointed at a name, and the mapping from name to address is the one thing DNS lets you change cheaply.

## TCP: turning unreliable packets into a reliable stream

The address DNS hands back gets you to a machine, but the underlying network — IP — makes no promises. Packets can arrive out of order, arrive duplicated, or simply not arrive. That's an acceptable tradeoff for a network built to route packets independently and efficiently across an enormous, unreliable, globally distributed set of links, but it's an unusable foundation for something like loading a web page, where you need every byte, in order, exactly once.

TCP is the layer that manufactures that guarantee on top of IP's indifference. The three-way handshake — SYN, SYN-ACK, ACK — isn't ceremony; it's the two sides agreeing on starting sequence numbers, which is what lets either side later detect a gap, a duplicate, or an out-of-order arrival and correct for it. Everything downstream of the handshake — retransmission of lost packets, reassembly in the right order, flow control so a fast sender doesn't overwhelm a slow receiver — depends on that initial exchange of state. Without it, "HTTP request" and "HTTP response" wouldn't be reliable concepts; they'd be probabilistic ones.

## TLS: turning a reliable stream into a private, authenticated one

TCP gets you a reliable channel to *some* machine, but says nothing about which machine that actually is, or who else might be reading the bytes in transit. Every hop between you and the server — your home router, your ISP, transit providers, the coffee shop access point — is a place someone could intercept or alter plaintext traffic without either endpoint knowing.

TLS closes both gaps at once. The handshake — reduced to a single round trip in TLS 1.3, down from two in earlier versions — lets client and server agree on a shared symmetric key without ever transmitting that key in the clear, using asymmetric cryptography for the negotiation and switching to fast symmetric encryption for the actual data. Interleaved with that key exchange is certificate validation: the server presents a certificate chaining back to a certificate authority the browser already trusts, which is what prevents a malicious network from simply pretending to be `example.com` and terminating your connection itself. Skip this layer and every request and response — cookies, passwords, session tokens, page content — travels as plaintext past every intermediate hop, which is the entire reason the padlock icon exists as a distinct, checkable thing.

## HTTP: the actual request, and what the server does with it

Only now does the browser send anything resembling "get me the page." An HTTP request is a method, a path, a set of headers, and optionally a body, and the server's response is a status code, headers, and typically a body of HTML. Between the request landing and the response leaving, the server does whatever work the application requires — routing the request to a handler, querying a database, assembling a template, possibly checking a cache or CDN edge closer to the user that intercepted the request before it ever reached the origin server at all. Everything below this layer exists purely to deliver this exchange reliably and privately; this is the layer where the exchange actually means something.

## Rendering: from bytes to pixels

The response body is just a string of HTML characters, and turning it into what you see is itself a small pipeline. The browser's HTML parser reads the markup and builds the DOM, a tree of nodes representing the document's structure — and it does this incrementally and forgivingly, correcting malformed markup on the fly rather than halting, because the web's backward-compatibility guarantee depends on old, imperfect pages continuing to render. In parallel, CSS gets parsed into the CSSOM, a tree describing styles. The two combine into a render tree containing only the nodes that will actually be visible, which then goes through layout — computing the exact size and position of every element — and paint, converting that geometry into actual pixels, often composited across separate GPU layers for elements like animations that need to update independently. This is why a stylesheet in the document head blocks the first paint: the browser cannot safely compute the render tree without knowing the styles, so it withholds rendering rather than paint something it may have to immediately redo.

## The lesson underneath the checklist

The reason this sequence is worth understanding rather than memorizing is that each layer's entire job is to take a narrower, more reliable promise than the one you actually need and hand it up to the next layer, which builds a slightly stronger promise on top. IP promises nothing about delivery; TCP turns that into reliable ordered bytes; TLS turns that into a private, authenticated channel; HTTP turns that into meaningful request-response semantics; the renderer turns that into pixels a human can read. None of these layers could do its job if it also had to solve the problems above and below it — the decomposition is what makes each piece simple enough to get right, and it's also, not incidentally, where all your latency lives. When a page "feels slow," it is slow inside one of these specific stages, and knowing which one — a cold DNS lookup, a distant TCP round trip, a certificate chain that's too long, a server doing unnecessary work, a stylesheet blocking paint — is the difference between fixing the actual problem and guessing at it.


## Linked from

- [1_Tech & Engineering](index.md)
