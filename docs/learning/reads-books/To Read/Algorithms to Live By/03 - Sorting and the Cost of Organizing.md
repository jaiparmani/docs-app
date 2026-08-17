---
tags: [reads, books, to-read, computer-science, productivity]
---

# 03 — Sorting and the Cost of Organizing

<small>3 min read</small>

## Core idea
Sorting algorithms — the computer-science machinery for putting a list into order — come with well-understood costs. A comparison-based sort takes on the order of n log n operations to fully order n items, and that cost has to be weighed against what the ordering actually buys you afterward. Christian and Griffiths make the point that sorting is never free, and that the entire reason to pay the sorting cost is to reduce a later, repeated cost: once something is sorted, finding any item in it is fast; if it's never going to be searched, or searched only rarely, the sorting was wasted effort. The decision to organize something at all, in other words, is itself an optimization problem — comparing the one-time cost of sorting against the number of times and speed with which you expect to need to find something in it.

## Why it matters
This directly undercuts the assumption that a fully ordered, alphabetized, labeled system is always the more "put together" or virtuous state to aim for. Whether sorting is worth it depends entirely on your actual search frequency, and for a great many personal collections — a bookshelf, a filing cabinet, a set of old photos — that frequency is low enough that the sorting investment never pays for itself. The book's sorting chapter also uses single-elimination sports tournaments as a sorting example with a genuine flaw: a bracket reliably identifies a winner, but it does not reliably identify the second-best competitor, since the second-best team may simply have had the misfortune of being paired against the champion early and lost only that one match — a clean illustration of how a sorting process can look authoritative while quietly not answering the question people assume it answers.

## Example from the book
The authors point to large personal or institutional book collections as the clearest everyday case: a public library, searched constantly by many people who don't know where anything is, earns back its shelving and cataloguing costs many times over, which is why libraries invest heavily in it. A personal bookshelf, searched occasionally by one person who already has a rough sense of where things are, often doesn't — the owner may be able to find most books by rough memory and visual landmark faster than a fully alphabetized system would let a stranger find them, making the alphabetizing project a net loss of time relative to what it returns.

## Practical application
Before reorganizing any pile, drawer, shelf, or folder structure, estimate honestly how often you actually search it and how costly each individual search currently is. If you rarely search it, or searches are already fast enough by rough memory, skip the sorting project entirely — the hours spent organizing will very likely exceed the hours it would have taken to just search unsorted, however satisfying imposing order feels in the moment. Reserve real sorting effort for the collections you or others search often and where an unsorted search is genuinely slow.

## Something to sit with
> [!question]- A question to think about
> Think of something in your life you've been meaning to "finally organize." Have you actually estimated how often you search it — or is the urge to sort it really about how it looks rather than what it would save you?


## Linked from

- [Algorithms to Live By](index.md)
