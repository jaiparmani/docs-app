---
tags: [reads, books, to-read, amazon, aws, innovation]
---

# 06 — Turning Internal Infrastructure Into AWS

<small>3 min read</small>

## Core idea
Amazon Web Services didn't start as a plan to sell cloud computing to the world. Stone traces its roots to a much more mundane internal problem: every team building a new feature or service inside Amazon kept re-solving the same underlying infrastructure problems — storage, compute, databases — from scratch, because there was no shared, standardized layer underneath the applications. Engineers including Chris Pinkham and Benjamin Black worked on a proposal to standardize that infrastructure internally, so Amazon's own developers could provision compute and storage without rebuilding the plumbing every time. The idea that this same standardized infrastructure could be sold externally, to any developer or company that had the same problem Amazon did, came somewhat later and had to be argued for internally as its own business case, championed in large part by Andy Jassy.

## Why it matters
AWS is arguably the single most consequential bet to come out of the whole story, and Stone's account is useful precisely because it shows how unglamorous and internally contested the origin was — it wasn't obvious even inside Amazon that this was a business, let alone the business it eventually became. The pattern is worth naming on its own: a capability built purely to solve your own operational problem can turn out to be more valuable, sold externally, than the original problem it was built to solve. That's a different kind of opportunity than either "build a new product" or "expand into a new market" — it's "look at what you already built for yourselves and ask who else has this exact problem."

## Example from the book
Amazon launched S3 (storage) in March 2006 and EC2 (compute) in August 2006, the first pieces of what became AWS, priced initially in a way that undercut the cost of maintaining equivalent infrastructure in-house for most companies. Stone describes real internal skepticism about whether a retail company had any business selling infrastructure to other businesses, including outside developers and eventually large enterprises — a case that had to be made and re-made before AWS was treated as a serious strategic priority rather than a side project. Years after the book's 2013 publication, AWS grew to generate a majority of Amazon's total operating profit, even though retail remained the much larger business by revenue.

## Practical application
Look at the internal tools, processes, or systems your own team or company has built purely to solve its own operational headaches — the things nobody thinks of as a "product" because they were never meant to be sold. Ask directly: does anyone else, outside our walls, have the exact problem this was built to solve? The AWS story suggests that question is worth asking seriously and periodically, not as a one-time brainstorm, because the answer that mattered most at Amazon wasn't obvious the first time it came up either.

> [!question]- A question to think about
> What is the "AWS" sitting inside your own organization right now — infrastructure or process built only to solve an internal problem — that nobody has seriously asked whether outsiders would pay for?


## Linked from

- [The Everything Store](index.md)
