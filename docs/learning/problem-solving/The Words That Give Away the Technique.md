---
tags: [reads, algorithms, pattern-recognition, interview-prep, problem-solving]
---

# The Words That Give Away the Technique

<small>5 min read</small>

The story a problem tells you is almost always disposable. Meeting rooms, gas stations, rotting oranges, stock prices, a robot on a grid — these are costumes, and a competent setter could re-dress the same underlying question a dozen different ways without changing a single line of the intended solution. What cannot be re-dressed is the actual requirement, because that is the part the solution has to satisfy. Somewhere in the statement, usually in one clause, the setter has to say precisely what they want, and that clause is where the technique leaks out.

This is the companion skill to reading constraints. The bound on n tells you which complexity class you're allowed to land in; the phrasing tells you which family of techniques gets you there. Together they usually narrow a problem to one or two candidate approaches before you've written anything, which is most of what separates "I stared at it for fifteen minutes" from "I knew where to start."

## The Signals Worth Memorising

Some phrases are close to deterministic.

**"Contiguous subarray"** or **"substring"** means the elements are adjacent, which means a window over the array is a legal object to maintain, which means sliding window or prefix sums are live. The moment the word becomes **"subsequence"** instead, the window dies — subsequences can skip elements, there is no contiguous region to slide, and you are almost certainly in dynamic programming territory. That single word swap changes the entire solution family, which is why it is worth reading twice.

**"Kth largest"**, **"top K"**, **"K most frequent"** means you never need the whole ordering, only repeated access to an extreme. That is a heap, and the giveaway is that sorting would compute far more information than the question asked for.

**"Minimize the maximum"**, **"maximize the minimum"**, **"smallest capacity such that"**, **"minimum days to"** is the strongest single signal in the entire catalogue. This phrasing means the answer is a number in a searchable range, and that checking "is X achievable" is easier than computing the optimum directly. You binary search the answer space, not the array. People miss this constantly because binary search was taught as a thing you do to a sorted list, and here there is often no sorted list in sight.

**"Number of ways"**, **"count the distinct"**, **"how many paths"** means counting, and counting problems decompose into sums of subproblems — dynamic programming, or occasionally combinatorics with a closed form.

**"Next greater"**, **"previous smaller"**, **"nearest element that is"** means monotonic stack. So does the histogram-shaped problem in disguise.

**"Lexicographically smallest"** usually means greedy with a stack, building the answer left to right and popping when a later character improves the prefix.

**"Shortest path"** in an unweighted graph or grid means BFS, because BFS visits in order of distance and the first time you reach a node is the shortest way to reach it. Add weights and it becomes Dijkstra. Add negative weights and it becomes Bellman-Ford. The word "shortest" is doing the work in all three; the edge weights decide which.

**"Prerequisites"**, **"ordering such that"**, **"dependencies"** means topological sort, and the follow-up question is almost always cycle detection, because a cycle is exactly when no valid ordering exists.

**"All possible"**, **"generate every"**, **"return all combinations"** means backtracking, and it will be paired with a tiny n in the constraints, which is the two signals agreeing with each other.

**"In-place"** or **"O(1) extra space"** is a constraint masquerading as a phrasing signal, and it usually means pointer manipulation, index arithmetic, or encoding information into the sign or magnitude of existing values rather than allocating anything new.

**"Sorted array"** stated in the input description is not decoration. It is the setter telling you that binary search or two pointers is available, and that an O(n log n) solution which begins by sorting is leaving the gift unopened.

## Why the Leak Is Unavoidable

It is worth understanding why this works at all, because it is not a trick of any particular problem set. A problem must state its requirement unambiguously or it is not well-posed. "Find the longest run of distinct characters" cannot be phrased in a way that hides the contiguity requirement, because contiguity *is* the requirement — remove it and you have asked a different question with a different answer. The setter can obscure the domain, the units, the narrative, and the variable names. They cannot obscure the thing being optimised or the shape of the object being returned, because those are load-bearing.

So the reliable move is to strip the story deliberately. Read the problem once for narrative, then read it again asking only: what object am I returning, what property must it have, and what am I optimising? Those three answers, in the problem's own words, are the signal. Everything else is set dressing.

## False Friends

The heuristic has failure modes, and they are worth knowing so you don't over-trust it.

"Maximum subarray sum" contains the word "maximum" and the word "subarray" and is neither a heap problem nor a sliding window problem in the usual sense — negative numbers break the window invariant, and it is famously a small dynamic program (Kadane's). Sliding window in its standard form needs a monotonic relationship between window size and the quantity you are tracking; negative values destroy that, which is why "subarray sum" problems split cleanly into the all-positive case (window works) and the general case (prefix sums with a hash map, or DP).

"Find the median" sounds like sorting or a heap, and in a static array it is a selection problem; in a stream it becomes the two-heap technique. Same word, different technique, decided by whether the data arrives all at once.

And plenty of problems carry two signals at once, which is not a contradiction but a composition — "kth smallest in a sorted matrix" is genuinely both a heap problem and a binary-search-on-the-answer problem, and both solutions are correct with different complexities. Two signals usually means two valid approaches, and the constraints tell you which one is expected.

The signals are priors, not proofs. But starting from a strong prior and checking whether it survives contact with the specific problem is a dramatically better process than starting from nothing and hoping the approach occurs to you, and the difference compounds over a few hundred problems into what looks from the outside like intuition.


## Linked from

- [2_Problem Solving](index.md)
