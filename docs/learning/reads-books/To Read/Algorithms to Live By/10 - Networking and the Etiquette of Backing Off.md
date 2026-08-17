---
tags: [reads, books, to-read, computer-science, communication]
---

# 10 — Networking and the Etiquette of Backing Off

<small>3 min read</small>

## Core idea
The protocols that let computers reliably talk to each other over unreliable networks solve problems that look strikingly like problems in human conversation. Christian and Griffiths focus on two pieces of TCP, the protocol underlying most internet traffic: acknowledgment, where the receiving computer sends a small signal back confirming a message actually arrived, and exponential backoff, the rule for what to do when a message seems to have failed — wait a random, steadily-growing interval before retrying, rather than either giving up immediately or retrying instantly and repeatedly. Both exist to solve the same underlying problem: two parties trying to coordinate reliably over a channel that might drop information, without either party being able to fully see what's actually happening on the other end.

## Why it matters
This gives a precise structure to two very ordinary but under-examined social behaviors. The steady stream of "mm-hmm," nodding, and small verbal backchannel a listener gives during conversation functions exactly like a TCP acknowledgment packet — a constant low-cost signal that the message is getting through, whose absence (silence, a blank expression) is itself informative and typically prompts the speaker to slow down, repeat, or check in, the conversational equivalent of a sender retransmitting after a dropped packet. Exponential backoff, meanwhile, gives a principled answer to a genuinely common dilemma — how persistently to keep reaching out to someone who isn't responding — that neither instructs endless immediate retries nor total withdrawal after one attempt, but a specific, gradually widening interval between attempts.

## Example from the book
The authors describe TCP's exponential backoff explicitly: after a failed transmission, the protocol doesn't retry instantly, since an instant retry is likely to hit the same congested or broken conditions that caused the first failure; it waits, then doubles (or otherwise multiplicatively increases) its wait time after each subsequent failure, up to some ceiling, so that persistent failures are met with steadily decreasing effort rather than either constant hammering or a single attempt and silence. They connect this directly to strategies for handling unresponsive contact with another person — repeated immediate follow-ups read as pestering for the same reason immediate retransmission floods an already-struggling network, while a single attempt with no follow-up abandons a channel that may simply have had a temporary problem.

## Practical application
When someone stops responding and you're deciding how hard to keep trying to reach them, apply backoff explicitly rather than defaulting to either extreme: space your follow-ups out with a gradually increasing interval — days, then longer, then longer again — rather than repeating the same message on a short fixed schedule or giving up after the first silence. In conversation, notice how much your own steady stream of small acknowledgment signals — or their absence — is silently telling the other person whether to keep going, repeat themselves, or check whether they're actually being heard.

## Something to sit with
> [!question]- A question to think about
> Think of an unanswered message you're currently deciding whether to follow up on. Are you about to retry too soon and too often, the way a naive network retransmits into ongoing congestion — or have you gone silent too early, treating one dropped packet as a permanently broken connection?


## Linked from

- [Algorithms to Live By](index.md)
