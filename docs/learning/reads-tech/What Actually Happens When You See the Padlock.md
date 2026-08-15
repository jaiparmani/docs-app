---
tags: [reads, tech, security, tls, networking]
---

# What Actually Happens When You See the Padlock

<small>6 min read</small>

You type a domain into a browser. Your packets leave your laptop, cross a café's router, a residential ISP, and two or three transit networks you have never heard of, then arrive at a machine you have no prior relationship with. At every hop the operator can read every byte and, with a little more effort, change them. The problem TLS solves is genuinely hard when you state it plainly: **hold a private, tamper-proof conversation with a stranger, over a channel controlled by people who may be hostile, having exchanged no secrets in advance.** The padlock in the address bar summarises a fairly elegant answer to that, and is also routinely misread.

## Two kinds of encryption, each insufficient alone

Symmetric encryption is the intuitive kind. One key both encrypts and decrypts. Modern symmetric ciphers — AES, ChaCha20 — are extremely fast, and on server-grade CPUs AES runs in dedicated instructions, so encrypted throughput is close enough to plaintext throughput that it stops being an architectural concern. This is why "TLS is expensive, terminate it at the edge and run plaintext internally" is much weaker advice than it was fifteen years ago.

It has exactly one problem, and it is the whole problem: both parties need the same key, and you cannot hand a key to a server you have never met without sending it across the very network you do not trust.

Asymmetric, or public-key, cryptography solves that. Each party has a mathematically linked key pair; what one key locks, only the other unlocks, so the public key can be shouted across a hostile network without harm. The catch is speed — public-key operations are orders of magnitude more expensive per byte, far too slow for a video stream or a chatty API.

TLS takes the obvious way out. **Use the slow asymmetric mathematics once, briefly, at the start, purely to agree on a shared symmetric key — then use the fast symmetric cipher for all the actual data.** That opening negotiation is the handshake, and everything interesting happens there.

In modern TLS the key agreement uses an ephemeral Diffie-Hellman exchange, usually over elliptic curves. Diffie-Hellman reads like a magic trick: two parties exchange public values in the clear, and each combines their own private value with the other's public value to arrive at the same shared secret — one that never crossed the wire and that an eavesdropper recording every packet cannot reconstruct. "Ephemeral" means both sides discard their private values afterward, giving forward secrecy: if the server's long-term key is stolen next year, last year's recorded traffic still cannot be decrypted, because the keys that protected it no longer exist. TLS 1.3 removed the non-forward-secret modes entirely.

## What a certificate actually claims

Diffie-Hellman alone gets you an encrypted channel to *somebody*. It does not tell you who. An attacker in the middle can run one handshake with you and another with the real server, decrypt and re-encrypt everything, and read the lot. Encryption without identity is close to worthless.

That is the certificate's job: an X.509 document containing a public key, the domain names it is valid for, a validity window, the issuer, and a signature over all of it. The server presents it during the handshake and then proves, by signing with the corresponding private key, that it holds the private half — which binds the encrypted channel to the named identity.

The signature comes from a Certificate Authority, and what a CA attests is narrower than most people assume. For the domain-validated certificate that most of the web uses, the CA asserts one thing: **at issuance time, whoever requested this certificate demonstrated control over this domain name** — typically by serving a specific file at a specific path, or publishing a DNS record. That is all. It has not vetted the company or formed any opinion about what the site does.

Certificates chain. A leaf is signed by an intermediate, which is signed by a root, and only roots are trusted directly. Your browser and OS ship with a root store — a curated list of a few hundred CA certificates — and validation walks the chain from the leaf up to something in that store, checking each signature, the dates, and that the hostname matches the certificate's subject alternative names. A server that sends the leaf but omits the intermediate is a classic production failure: it works in your browser, which may have cached the intermediate, and fails in `curl` and your Java client, which have not.

## What the padlock is not telling you

Here is the part worth internalising. The padlock means two things and only two things: the connection is encrypted, and the server proved control of the domain shown in the address bar. It does not mean the site is honest, the company is real, or your data is handled well once it arrives. Free, automated, short-lived certificates from Let's Encrypt took HTTPS from a purchased luxury to a default — and they are equally available to a phishing operation, which need only control the domain it phishes from. Browsers stopped showing anything reassuring in the URL bar precisely because users read the padlock as an endorsement rather than a statement about transport.

The other operational thing worth carrying: certificates expire, and expiry has caused more self-inflicted outages than almost anything else. It fails abruptly, on a date nobody was thinking about, often on internal service-to-service links nobody monitored, and it fails everywhere at once. The mitigation is not a calendar reminder; it is automated renewal via ACME plus alerting on days of remaining validity, treated as a real service-level indicator. TLS itself has improved too: version 1.3 pruned the negotiable cipher suites to a small modern set, removing whole categories of downgrade attack inherited from decades of legacy options, and restructured the handshake to complete in one round trip instead of two.

## The list at the bottom of everything

Follow the chain of trust down and you eventually hit bedrock, and the bedrock is a list. Essentially all confidentiality on the web rests on a set of root certificate authorities that shipped with your operating system or browser, curated by a handful of organisations, refreshed when you take an update.

Any CA in that store can issue a valid certificate for any domain — not just for its own customers, for any of them. That has failed in practice: a Dutch CA called DigiNotar was compromised in 2011, fraudulent certificates for major domains were issued and used against real users, and the CA was removed from the trust stores and did not survive it. The response over the following decade was structural. Certificate Transparency requires certificates to be logged to public append-only logs, so a domain owner can watch for certificates they never requested; CAA DNS records let a domain declare which CAs may issue for it; browser vendors distrust misbehaving CAs publicly; and certificate lifetimes have been steadily shortened, limiting the blast radius of any single mistake.

So the padlock is not a proof, it is a delegation. You are trusting that the root store on your device is intact, that its curators are doing their job, and that the transparency layer built on top would catch abuse quickly. That is a genuinely strong system — but its strength is institutional and procedural, not purely mathematical. The cryptography is the easy part. The hard part has always been deciding whose signature means anything, and that question has no cryptographic answer at all.
