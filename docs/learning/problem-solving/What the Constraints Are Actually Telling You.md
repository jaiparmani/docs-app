---
tags: [reads, algorithms, complexity, interview-prep, problem-solving]
---

# What the Constraints Are Actually Telling You

<small>6 min read</small>

Most people read the constraints section of a problem last, if at all, and treat it as bookkeeping — the range you'd check before writing `int` versus `long`, nothing more. That is backwards. The constraints are the most information-dense sentence on the page. Before you have fully parsed what the problem is asking, the bound on n has already told you which family of algorithms the setter had in mind, and usually rules out three or four approaches you might otherwise have wasted ten minutes trying. Reading constraints first, deliberately, as a signal rather than a formality, is a distinct skill from solving the problem, and it is the one that turns "I don't know where to start" into "I know roughly what shape the answer has to be."

## The Operations Budget

The trick underneath all of this is a single number: judges and interview settings both implicitly assume a machine that executes on the order of 10⁸ simple operations per second. A typical time limit of one to two seconds therefore buys you somewhere around 10⁸ to a few times 10⁸ total operations before you time out. That figure is not exact — it depends on the language (Python commonly gets two to five times the nominal limit precisely because it's five to ten times slower per operation than C++), on whether the operations are cache-friendly array touches or pointer-chasing, and on constant factors your particular algorithm carries. But as a first-pass budget it is remarkably reliable, and it converts an abstract complexity class into a concrete yes-or-no question: does f(n) fit under roughly 10⁸?

That conversion is the entire value of the exercise. "Is O(n²) fast enough" is unanswerable in the abstract — it depends entirely on n. "Is 10¹⁰ operations fast enough" has an immediate answer, and you get to that second question the moment you know both the growth rate and the actual bound on n.

## Reading n Backwards Into an Algorithm

Run the arithmetic across the ranges you actually see, and a table falls out:

| n up to | Budget spent by | What's in scope |
|---|---|---|
| ~10–12 | O(n!) or O(2ⁿ · n) | brute-force permutations |
| ~20–25 | O(2ⁿ) | bitmask DP, subset enumeration |
| ~100 | O(n⁴) | four nested loops, small DP over multiple dimensions |
| ~500–1,000 | O(n³) | Floyd–Warshall-shaped problems, triple loops |
| ~5,000 | O(n²) | pairwise comparisons, simple DP tables |
| ~10⁵–10⁶ | O(n log n) | sorting-based approaches, heaps, balanced trees, divide and conquer |
| ~10⁸ | O(n) | single-pass or two-pointer solutions, linear DP |
| ~10⁹ and beyond, or n given as a *value* rather than array length | O(log n) or O(√n) | binary search, number-theoretic approaches, math closed forms |

The direction this table is meant to be read is backwards from how it's usually taught. Courses present complexity classes and then show you problems that happen to fit each one; in practice you start from the bound the setter handed you and it tells you which row you're on before you've designed anything. See n ≤ 20 in a problem statement and you can be fairly confident, before reading another line, that the intended solution touches bitmask DP or some form of exhaustive-but-pruned search over subsets — no comparison-based or purely greedy approach naturally produces a 2ⁿ ceiling; something in the problem structure is forcing you to consider subsets, and the constraint is confirming it. See n ≤ 5,000 with a plainly stated "find the pair" flavor, and an O(n²) double loop is very likely simply the expected answer, not a fallback while you look for something cleverer — spending twenty minutes hunting for an O(n log n) trick that the constraints never asked for is a common and avoidable way to lose time.

The reverse signal matters just as much. If n climbs to 10⁵ or higher, anything O(n²) is instantly disqualified — 10¹⁰ operations is roughly a hundred times over budget — and that elimination is worth having in hand before you invest effort into a quadratic idea that felt natural. This is where the technique earns its keep: not in telling you the answer, but in pruning the search space of approaches down to the one or two families that could possibly fit, which is most of what makes a problem feel hard in the first place.

## Where the Heuristic Breaks

The budget is a first approximation, not a proof, and it fails in specific, recognizable ways. Multiple test cases with a *sum* constraint — "the sum of n over all test cases does not exceed 2×10⁵" — changes the effective per-case budget dramatically and is easy to misread as a per-case bound if you skim. Values bounded separately from array length matter too: n ≤ 10⁵ with values up to only 100 is a strong hint toward counting sort or bucket-based techniques rather than a comparison sort, because the value range, not the array length, is the real limiting resource. And constant factors still bite at the boundary — an O(n log n) solution with a large hidden constant (nested logs, heavy per-comparison work, non-contiguous memory access) can still fail against a generous-looking n if the judge's time limit was set with a tighter reference solution in mind.

Interview settings are looser still, because interviewers rarely state a tight numeric bound the way a judge does. There the move is to ask directly — "what's the expected range for n" — precisely because you're trying to recover the same signal a competitive-programming constraints line gives for free. An interviewer who says "assume n can be up to a million" has just told you, whether they meant to frame it that way or not, that they want to see you reject the O(n²) idea before you've written a line of code, not after.

## The Constraint Is a Compressed Hint

The deeper point is that a well-set problem's constraints are not incidental to the problem — they are usually the tightest place the setter could encode "this is the algorithm I want" without simply telling you. A story about scheduling meetings or partitioning an array is one of a thousand possible cover stories for "I want you to realize this is a sliding window" or "I want you to realize this needs a heap." The narrative varies; the constraint is the part that can't lie, because it's a hard limit the intended solution actually has to respect. Reading it first, and asking not "will this fit" but "what does needing to fit tell me the answer must look like," turns the constraints section from a formality you check last into the first real piece of information you're given.


## Linked from

- [2_Problem Solving](index.md)
