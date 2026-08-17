---
tags: [reads, books, to-read, computer-science, productivity]
---

# 04 — Caching and the Logic of a Messy Desk

<small>3 min read</small>

## Core idea
Computers keep a small amount of very fast, expensive memory (cache) alongside a much larger amount of slow, cheap memory (disk), and the entire performance of the system depends on a good policy for deciding what stays in the fast, limited space and what gets evicted to make room. Christian and Griffiths walk through the theoretically ideal policy — evict whatever won't be needed again for the longest time, which requires knowing the future — and the best practical approximation to it that doesn't require knowing the future: Least Recently Used, or LRU, which simply evicts whatever hasn't been touched in the longest time. LRU works because, empirically, what you used recently is a strong predictor of what you'll need again soon.

## Why it matters
This reframes the instinct to keep frequently-used items close at hand — a cluttered desk, a nightstand, a pile by the door — not as a failure to organize but as an approximately optimal caching strategy that most people already run instinctively. The book's point isn't that mess is always fine; it's that a specific, common kind of "mess" — a pile where recently used things end up on top and untouched things sink to the bottom — is structurally identical to an LRU cache, and LRU is a well-studied, genuinely good policy, not a lazy one. The failure mode isn't the pile itself, it's a pile that never gets touched at all, so nothing ever gets evicted and the whole cache overflows.

## Example from the book
The authors describe a pile of papers on a desk, added to from the top as new things arrive, as functionally equivalent to a data structure computer scientists call a stack, and note that because whatever you pull out and use gets returned to the top rather than back to its original position, the pile self-organizes over time so that frequently needed items stay near the top and rarely needed ones drift toward the bottom — without anyone deliberately sorting anything. They contrast this with a filing cabinet organized alphabetically, which requires real maintenance effort to keep updated and gives no benefit for the specific, lopsided way real usage actually concentrates on a small recently-touched subset of items.

## Practical application
For a physical space that keeps re-accumulating clutter no matter how often you tidy it, stop fighting the pile and start managing it like a cache instead: let new and recently used items land on top or up front, and periodically evict only from the bottom or back — the stuff that's had the longest stretch untouched — rather than re-sorting the whole thing from scratch. Apply the same logic digitally: a "recently opened" or "recently used" view in a messy folder of files is usually a better real interface into it than trying to impose a perfect folder hierarchy you'll never consistently maintain.

## Something to sit with
> [!question]- A question to think about
> Is there a pile or drawer in your life you've felt guilty about that's actually functioning as a decent cache — recently used things near the top, forgotten things at the bottom — where the real problem is just that it's never been evicted from at all?


## Linked from

- [Algorithms to Live By](index.md)
