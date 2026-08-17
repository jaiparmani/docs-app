---
tags: [reads, books, to-read, decision-making, computer-science]
---

# 06 — Bayes's Rule and Predicting How Long Things Will Last

<small>3 min read</small>

## Core idea
Bayesian reasoning updates a prior belief in light of new evidence, and Christian and Griffiths use it to answer a very specific, everyday question: given only how long something has already gone on, how much longer should you expect it to last? The honest answer, they show, depends on what kind of thing it is — specifically, on the shape of the underlying distribution of how long things like it tend to last. For quantities that follow a power-law-like distribution with no natural scale — the runtime of a hit Broadway show, the size of cities, many culturally-driven or reputation-driven phenomena — the best prediction is roughly proportional to how long it's already lasted: something that's been running a long time is likely to keep running roughly that much longer again. This is sometimes called the Copernican Principle applied to time, and it lines up closely with what's known elsewhere as the Lindy effect. For quantities that cluster around a typical value, like human lifespans, the right update instead adds a roughly fixed amount of expected remaining time regardless of current age, until very old age changes the picture.

## Why it matters
This matters because "how much longer will this last" is a question people answer constantly with pure intuition — a relationship, a job, a trend, a piece of technology, a run of good luck — and the correct answer genuinely differs depending on what kind of underlying pattern governs that thing, not on a single universal formula. Applying the wrong rule produces confidently wrong forecasts in both directions: expecting a power-law phenomenon to have a fixed remaining lifespan the way a human does badly underestimates its likely persistence, while expecting something normally-distributed to keep going in direct proportion to its age so far badly overestimates it.

## Example from the book
The authors work through the famous illustration of predicting how much longer the Berlin Wall would stand, given only that, at the time of the prediction, it had already stood for a number of years — no other information about East-West politics, no expert forecasting, just the single data point of elapsed time fed into the proportional Copernican-style rule. That crude, information-poor method produces estimates that land closer to the actual outcome than most people's confident intuitive guesses at the time, which is the authors' broader point: a mathematically principled rule using almost no information can outperform a richly-informed but intuitively-applied guess.

## Practical application
Before forecasting how much longer something will continue — a company's growth, a friendship, a habit someone else has kept up, a piece of software still in wide use — first ask what kind of distribution actually governs things like it. If it's the kind of thing where a few instances go on for a very long time and most end quickly, with no natural typical duration (most creative and cultural phenomena work this way), let its current age raise your estimate of its remaining life roughly in proportion, rather than assuming it's "due" to end soon just because it's been going a while.

## Something to sit with
> [!question]- A question to think about
> Pick something ongoing in your life you've caught yourself predicting the end of — a project, a relationship, a streak. Does it actually behave like a power-law phenomenon, where its age is evidence it'll keep going, or like a human lifespan, where age alone tells you little either way?


## Linked from

- [Algorithms to Live By](index.md)
