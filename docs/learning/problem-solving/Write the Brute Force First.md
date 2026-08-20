---
tags: [reads, algorithms, process, dynamic-programming, problem-solving]
---

# Write the Brute Force First

<small>4 min read</small>

The instinct under time pressure is to skip straight to the efficient solution, because the brute force is obviously too slow and writing code you intend to throw away feels like waste. This is close to exactly backwards. The brute force is not a detour on the way to the real solution — it is the artifact the real solution is derived *from*, and skipping it is why the optimised approach so often refuses to arrive.

## The Optimisation Is Hiding in the Redundancy

The reliable path from slow to fast is not inspiration. It is: write the obvious exhaustive solution, look at what it recomputes, and eliminate the recomputation. Almost every standard technique is a specific answer to "what redundancy am I removing?"

Write the naive Fibonacci recursion and you will see `fib(n-2)` computed twice, `fib(n-3)` three times, and the tree exploding. Memoisation is the direct removal of that duplication, and tabulation is memoisation with the recursion unrolled. Nobody needs to invent dynamic programming here; it is the mechanical consequence of noticing repeated subcalls. This generalises: the standard progression of *brute-force recursion → add a memo → convert to a table → shrink the table to a rolling row* is four small, individually obvious steps, and each one is far easier than jumping to the final tabulated form directly. People who write DP fluently are usually running this pipeline quickly, not seeing the recurrence whole.

The same holds elsewhere. Write the O(n²) double loop for two-sum and you will notice the inner loop re-scanning for a value you could have remembered — that observation *is* the hash map. Write the O(n²) subarray-sum loop and you will notice you keep re-adding the same prefix — that is prefix sums. The efficient technique is the shape of the wasted work, turned inside out.

## It Is Also Your Test Oracle

The second use is more concrete and more underrated. Once the optimised solution exists, you have two implementations of the same function, one of which you are confident about. That makes stress testing possible: generate small random inputs, run both, compare. A disagreement hands you a concrete failing case, usually tiny enough to trace by hand.

This is dramatically more effective than staring at a wrong-answer verdict on a hidden test with n = 100,000. It converts "my solution is wrong somewhere" into "on the input `[3, -1, 3]` I return 5 and the correct answer is 6," which is a debuggable statement. Competitive programmers do this routinely and it is the single largest practical reason they debug faster than people who don't. The brute force is slow, but on inputs of size eight nothing is slow.

## Say It Out Loud in Interviews

In an interview the brute force serves a third purpose, which is communicative. Stating "the obvious approach is to check every pair, which is O(n²) — let me see whether I can do better" accomplishes several things at once: it demonstrates you understand the problem, establishes a correctness baseline you can be judged against, and makes your complexity reasoning visible. Silence while you search for the clever solution reads as being stuck, even when it isn't.

It also protects you against the worst outcome, which is running out of time with nothing. A working O(n²) solution with a clear articulation of why it's suboptimal and where the improvement would come from beats a half-finished optimal solution with a bug in it, in nearly every interviewer's assessment. Having the naive version written also gives you something to refactor toward the optimum, which is a much easier motion than composing the optimum from scratch under observation.

## When to Skip It

The advice is not unconditional. If the pattern is immediately obvious — the problem says "next greater element" and you have written monotonic stacks fifty times — writing the quadratic version first is genuine waste, and the recognition has already done the work the brute force would have done.

And occasionally the brute force is itself hard to write. Some graph and geometry problems have exhaustive versions that are fiddly enough to burn real time without teaching you anything, because the difficulty lives in the setup rather than in the search. There, sketching the brute force in words or pseudocode captures most of the benefit at a fraction of the cost.

The honest framing is that the brute force is worth writing whenever you cannot yet see the efficient solution — which is precisely the situation in which the temptation to skip it is strongest. When you are stuck, the exhaustive version is not the thing standing between you and progress. It is the thing that produces progress, because staring at concrete wasted work is a far better prompt than staring at a problem statement.


## Linked from

- [2_Problem Solving](index.md)
