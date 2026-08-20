---
tags: [reads, algorithms, debugging, testing, problem-solving]
---

# Finding Your Own Failing Test

<small>4 min read</small>

A wrong-answer verdict on a hidden test case is one of the least informative signals in software. You know something is broken, you don't know what, and the input that broke it is being withheld. The skill that closes that gap is generating the failing case yourself — and it is a systematic activity, not a matter of thinking harder about your code.

## The Cases That Break Things

Most failures cluster in a small number of categories, and running the list explicitly is faster than re-reading your solution.

**Empty and singleton input.** An empty array, an empty string, a single element, a tree with only a root. Loops that assume at least one iteration and `arr[0]` accesses that assume non-emptiness both die here, and problem statements frequently permit these without drawing attention to it.

**All identical elements.** `[5, 5, 5, 5]` breaks strict-inequality comparisons and duplicate-handling logic. Anything involving "distinct" or "unique" deserves this test specifically.

**Already sorted, and reverse sorted.** These are the extremes for many algorithms and the worst case for naive quicksort pivoting. They also catch off-by-one errors in loops that never trigger on shuffled data.

**Negative numbers and zero.** The single most common unstated assumption is that values are positive. Sliding window techniques that rely on sums increasing monotonically break the instant a negative appears. Zero breaks division and multiplication-based tricks, and it is a fine value for a "product of array except self" to contain.

**Values at the constraint boundary.** If the constraints permit values up to 10⁹ and n up to 10⁵, the sum can reach 10¹⁴, which overflows a 32-bit integer. This is the classic silent failure: correct algorithm, correct implementation, wrong integer type. Whenever the constraints tell you a bound, multiply it by n and check the result still fits.

**Ties.** Two elements with equal priority, two intervals ending at the same time, two paths of equal length. Tie-breaking is where "any valid answer" problems and comparator-based sorts go wrong.

## Stress Testing Beats Staring

The systematic version, when the checklist doesn't find it, is to test against a reference. Write the brute force, generate small random inputs, run both, compare, stop at the first disagreement.

The essential detail is keeping the inputs *small* — arrays of length three to eight, values in a range of maybe negative five to five. There is a strong temptation to generate large random inputs on the theory that they are more likely to expose bugs, and it is a mistake: a hundred-element failing case tells you almost nothing, while a four-element one can be traced by hand in under a minute. Bugs that only manifest at large sizes are rare and are usually overflow or timeout rather than logic. Small inputs also let you use a narrow value range, which makes duplicates and ties frequent instead of vanishingly unlikely — and those are where the bugs are.

A few dozen lines of harness — random generator, both solutions, a comparison loop that prints the input on mismatch — will find in seconds what an hour of re-reading will not. The asymmetry is large enough that it is worth having a template ready rather than writing it fresh each time.

## Check the Invariant at the Boundary

When the failing case is in hand and the bug still isn't obvious, the productive question is not "where is the error" but "where does my invariant stop holding." If your sliding window is supposed to maintain "no duplicates inside `[left, right]`," add an assertion that verifies exactly that at the top of each iteration and run the failing input. The first iteration where it trips localises the bug to one line.

This is the practical dividend of stating invariants deliberately rather than writing loops from memory. A loop with a named property has a testable property; a loop assembled from a remembered template has nothing to check against, which is why debugging it degrades into permuting `left++` and `right--` until the samples pass. That process sometimes terminates in a correct solution and sometimes terminates in a solution that passes the samples, and you cannot tell which from the inside.

## Do This Before Submitting

The habit that matters most is running the checklist *before* the first submission rather than after the first rejection. It costs perhaps two minutes: empty, single, duplicates, negatives, maximum values, ties. Most of those you can evaluate mentally against your code without running anything.

Two minutes spent there routinely saves the ten-to-thirty-minute cycle of submit, fail, guess, resubmit — and in an interview it is the difference between the candidate who says "let me check the empty case and whether this overflows" and the candidate whose interviewer has to point it out. The first reads as rigor. The second reads as luck, whether or not the code was ever wrong.


## Linked from

- [2_Problem Solving](index.md)
