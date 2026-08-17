---
tags: [reads, books, to-read, computer-science, decision-making]
---

# 08 — Relaxation: Solving the Easier Problem First

<small>2 min read</small>

## Core idea
When a problem is too hard to solve directly — computationally intractable, or tangled up with too many real-world constraints — computer scientists often use "relaxation": temporarily removing one or more constraints to create an easier version of the same problem, solving that easier version, and using the result either as a genuinely useful approximate answer or as a bound that tells you how good any real solution could possibly be. Christian and Griffiths present this as a formal technique with real applications in optimization and routing problems, distinct from simply giving up on the hard constraints — the relaxed problem is deliberately chosen so that its solution still says something true and useful about the original, harder one.

## Why it matters
This matters because it legitimizes a move that can otherwise feel like cheating: when a real decision is paralyzed by a specific constraint — money, time, someone else's expectations, an old commitment — deliberately imagining the problem without that constraint isn't avoidance, it's a recognized problem-solving technique for extracting a usable answer from an otherwise intractable situation. The relaxed version tells you what you'd do under ideal conditions, which is frequently the clearest signal available for what to prioritize even once the real constraint is put back.

## Example from the book
The authors describe relaxation techniques used in routing and scheduling problems — for instance, temporarily allowing a delivery route to ignore a constraint like one-way streets or vehicle capacity to compute an easier, related problem, then using that easier solution's cost as a lower bound on what the real, fully-constrained problem could possibly achieve, which is useful even though the relaxed route itself isn't drivable as-is. They also draw out the double meaning of the word "relaxation" deliberately: the algorithmic technique of loosening constraints to make a problem tractable, and the everyday sense of the word — giving yourself permission to accept an approximate, imperfect answer rather than insisting on solving the full, maximally constrained version of every decision.

## Practical application
When you're stuck on a decision because of one specific constraint you can't stop fixating on, try explicitly solving the relaxed version first: ask what you'd do if that one constraint — the budget, the deadline, the person's expectations — simply didn't exist, and get a clear answer to that easier question. Then bring the constraint back and ask how close you can get to that ideal answer given the real limitation, rather than starting from scratch with the constraint baked in from the beginning. The relaxed answer won't be directly usable, but it tells you what you're actually optimizing for underneath the constraint.

## Something to sit with
> [!question]- A question to think about
> Pick a decision you're currently stuck on because of one specific limiting factor. What would the relaxed version of the answer be — the one where that constraint doesn't exist — and how far is your real, constrained option actually from it?


## Linked from

- [Algorithms to Live By](index.md)
