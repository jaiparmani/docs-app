---
tags: [reads, algorithms, terminology, dynamic-programming, problem-solving]
---

# Subarray, Subsequence, Subset

<small>4 min read</small>

Three words that look interchangeable, sound interchangeable, and commit you to three entirely different solution families. Misreading one for another is among the most expensive mistakes available in a timed setting, because it does not announce itself — you will produce a working, well-written, correct solution to a question nobody asked.

## What Each One Actually Permits

A **subarray** is a contiguous slice. `[2, 3]` is a subarray of `[1, 2, 3, 4]`; `[1, 3]` is not, because you skipped an element. An array of length n has n(n+1)/2 subarrays, which is O(n²) — a quadratic number of candidates, small enough that enumerating them is sometimes viable and small enough that a linear-time technique is usually the target. Contiguity is what makes a sliding window a legal object: a window has a left edge and a right edge and everything between them is included, which is only meaningful if "between" means something. The string version of the same idea is a **substring**.

A **subsequence** preserves relative order but may skip freely. `[1, 3]` is a subsequence of `[1, 2, 3, 4]`; `[3, 1]` is not, because order is fixed. There are 2ⁿ subsequences, because each element is independently in or out. That exponential count is the whole story: you cannot enumerate them past about n = 20, so any subsequence problem with a meaningful input size must have overlapping subproblems you can exploit, which is why "subsequence" is very nearly a synonym for "dynamic programming."

A **subset** drops the order requirement too — it is just a selection of elements, and `{3, 1}` and `{1, 3}` are the same subset. Also 2ⁿ of them. Subset problems tend toward backtracking, bitmask enumeration, or the knapsack family of DP.

## The Distinction in Practice

Put the three side by side on the same input and the divergence is stark.

*Longest increasing **subarray*** is a single linear pass: track the current run, reset when it breaks, keep the best. O(n), a few lines, no table.

*Longest increasing **subsequence*** is a genuinely different problem — the classic O(n²) DP, or O(n log n) with a patience-sorting trick. Nothing about the linear scan survives, because the elements forming the answer need not be adjacent, and greedily resetting on a decrease throws away candidates that were still viable.

*Maximum **subarray** sum* is Kadane's algorithm, O(n). *Maximum **subset** sum with no two adjacent* is House Robber, a different DP. Same array, same word "maximum", unrelated solutions.

This is also where the sliding window boundary lives, and it explains a confusion that otherwise looks arbitrary. A window is a contiguous region by construction. The instant a problem says "subsequence," the window has nothing to slide over, and any instinct to reach for two pointers is misdirected effort. Conversely, seeing "subarray" should make you actively suspicious of a DP table, because contiguity usually admits something cheaper.

## Reading It Off the Constraints

The vocabulary and the constraints corroborate each other, which is a useful consistency check when you are unsure you read correctly.

If the problem says "subsequence" or "subset" and n is 20 or under, the 2ⁿ enumeration is being invited directly — bitmask over all subsets, roughly a million operations, comfortably fast. If it says "subsequence" and n is 10⁵, exhaustive enumeration is off the table by a margin of about thirty thousand orders of magnitude, so there must be a polynomial DP with a state space small enough to fit. If it says "subarray" and n is 10⁵, you are looking for a linear or n-log-n technique over contiguous ranges: sliding window, prefix sums, or a monotonic structure.

When the word and the bound disagree with your instinct, trust them over the instinct. Two independent signals pointing the same way is about as much confirmation as a problem statement ever offers.

## The Cheap Habit

The habit worth building costs about four seconds: on first read, find the word, and say out loud which of the three it is and therefore what it rules out. "Subsequence — so no window, and 2ⁿ unless there's structure, so probably DP." That sentence, spoken before any design work, prevents the specific failure of solving an adjacent problem beautifully and discovering it on submission.

It is also the most common source of a wrong answer that passes several test cases before failing, since small examples frequently have the same answer under both readings — `[1, 2, 3]` has the same longest increasing subarray and subsequence, and so does most short well-behaved input. The divergence shows up exactly when the data gets interesting, which in a contest means the large hidden cases and in an interview means the follow-up.


## Linked from

- [2_Problem Solving](index.md)
