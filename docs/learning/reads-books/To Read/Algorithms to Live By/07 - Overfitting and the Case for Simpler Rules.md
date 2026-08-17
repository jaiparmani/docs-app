---
tags: [reads, books, to-read, decision-making, computer-science]
---

# 07 — Overfitting and the Case for Simpler Rules

<small>3 min read</small>

## Core idea
A statistical model overfits when it captures the noise in its training data along with the real underlying pattern, producing something that matches the specific examples it was built on extremely well and then performs badly on new cases, because it learned quirks of that particular data rather than the general rule. Christian and Griffiths walk through the tools built to guard against this — cross-validation, which tests a model against data it wasn't built on, and regularization, which deliberately penalizes complexity so a model has to earn the right to be intricate rather than defaulting to it. The core insight is counterintuitive: a simpler model that fits the specific training data slightly worse will often predict new, unseen cases better than a complex model that fits the training data almost perfectly.

## Why it matters
The authors extend this directly to real decision-making: an elaborate, highly-tailored plan built around every detail of today's exact circumstances is, structurally, an overfit model — it may be optimal for today's specific conditions but brittle and poorly suited to tomorrow's slightly different ones. A simple rule of thumb, by contrast, sacrifices some precision on any single case in exchange for holding up reasonably well across many different future cases it wasn't specifically built for. This reframes "why do experienced people so often lean on blunt heuristics instead of detailed case-by-case reasoning" — it's not a shortcut born of laziness, it's the same tradeoff a well-regularized model makes on purpose.

## Example from the book
The book discusses regularization techniques such as the Lasso, which forces a statistical model to actively justify each added variable rather than including one just because it slightly improves the fit to existing data, and connects this to the broader idea of "early stopping" — deliberately halting a model's training before it's had the chance to fully memorize its training set, because the version partway through training often generalizes better than the fully-converged one. The parallel the authors draw is to advice and expertise: heuristics passed down through experience function like a regularized model, tuned across many past cases rather than perfectly fit to any single one, which is exactly why they hold up decently across new, only-somewhat-similar future situations.

## Practical application
When you're building an elaborate plan that accounts for every specific detail of the present situation, ask whether you're optimizing for today's conditions in a way that would break as soon as something small changed — a sign of overfitting a life decision the way a model overfits data. Favor a somewhat simpler, more generic plan or rule when you expect the underlying conditions to shift, and reserve highly detailed, case-specific planning for situations you're confident will stay exactly as they are. When in doubt, a blunter heuristic that's worked across many past situations is often the better bet against an intricately optimized plan for exactly one imagined future.

## Something to sit with
> [!question]- A question to think about
> Think of a plan you've built that's highly tailored to your exact current circumstances. If one of those circumstances changed next month, would the plan still hold up — or is it overfit to a moment that's already starting to pass?


## Linked from

- [Algorithms to Live By](index.md)
