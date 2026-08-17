---
tags: [reads, books, to-read, computer-science, decision-making]
---

# 09 — Randomness and the Power of Chance

<small>2 min read</small>

## Core idea
Some of the most effective algorithms in computer science work by deliberately introducing randomness rather than following a fully deterministic procedure. Randomized quicksort picks a random element as its pivot specifically so that no adversarial or unluckily-ordered input can consistently force it into its slow worst case; hashing schemes use randomness to spread data out and avoid collisions that a deterministic scheme could be tricked into; Monte Carlo methods use repeated random sampling to approximate answers to problems too complex to solve exactly. Christian and Griffiths use these as evidence for a genuinely counterintuitive claim: adding controlled randomness to a decision process can make it perform better, not worse, than a careful deterministic one, particularly whenever the environment might be adversarial, highly variable, or too complex to model precisely.

## Why it matters
This cuts against the instinct that a good decision-maker should always be able to point to a specific, deliberate reason for every choice, and that leaving something to chance is an admission of not having thought hard enough. The book's point is that in certain well-defined circumstances — when a deterministic rule can be exploited or gamed, or when the cost of continuing to deliberate exceeds the value of a better-considered answer — randomness is the mathematically correct move, not a fallback for when reasoning fails.

## Example from the book
The authors walk through how randomized algorithms avoid worst-case scenarios that trip up their deterministic counterparts: a deterministic quicksort has a specific input ordering that will always trigger its slowest possible performance, while a randomized version, by choosing its pivot unpredictably, makes that worst case vanishingly unlikely to actually occur regardless of the input, because there's no longer a fixed weakness for a bad input to target. They present this as the general principle behind randomization's usefulness — it defends specifically against structured, patterned failure by refusing to have a predictable structure of its own.

## Practical application
When you're stuck between two or more options that you've already deliberated over carefully and that seem genuinely close in value, recognize that continuing to deliberate has its own cost, and that flipping a coin at that point isn't giving up — it's often the rational move once your options are close enough that no further analysis is likely to reveal a real difference. Separately, when you're in a repeated, adversarial situation where a predictable pattern in your own choices could be exploited by someone else, deliberately injecting some randomness into your behavior removes the exploitable structure, the same way a randomized pivot removes quicksort's exploitable weak spot.

## Something to sit with
> [!question]- A question to think about
> Is there a decision you've been deliberating over for far longer than the stakes justify, where the options are close enough in value that a coin flip would likely serve you just as well as more analysis?


## Linked from

- [Algorithms to Live By](index.md)
