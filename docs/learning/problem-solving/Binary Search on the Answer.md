---
tags: [reads, algorithms, binary-search, optimization, problem-solving]
---

# Binary Search on the Answer

<small>5 min read</small>

Binary search gets taught as an operation you perform on a sorted array, and that framing quietly caps how far the technique travels. The array is incidental. What binary search actually requires is a monotonic predicate — some yes/no question whose answer flips exactly once as you sweep a parameter — and a sorted array is merely the most familiar place such a predicate shows up. Once you stop needing an array, an entire class of optimisation problems becomes tractable in a way that looks like sleight of hand until you have seen it three times.

## The Shape of the Trick

Consider the standard framing: a shipping company must deliver a list of packages within D days, in order, and you need the minimum ship capacity that makes this possible. Directly computing that minimum is not obvious — there is no formula, and the packages interact through the day boundaries in a way that resists a greedy sweep.

But invert the question. Given a *specific* capacity C, can you check whether D days suffice? That is easy: walk the packages, greedily fill each day until adding the next would exceed C, start a new day, count the days, compare to D. Linear time, no cleverness required.

And that feasibility function is monotonic. If capacity 15 works, capacity 16 certainly works — extra room never forces you to use more days. If capacity 10 fails, capacity 9 certainly fails. So as C increases, `feasible(C)` looks like `false, false, false, ..., false, true, true, true, ...` with exactly one transition, and the answer you want is precisely that transition point. Which is a binary search — over the range of possible capacities, not over any array in the input.

That is the whole technique. The question you binary search is not "where is my target" but "is this candidate answer achievable," and the payoff is that checking a candidate is routinely far easier than constructing the optimum directly.

## Recognising It

The phrasing is unusually reliable here. **"Minimize the maximum"**, **"maximize the minimum"**, **"smallest X such that"**, **"minimum number of days/speed/capacity to"** — these are near-tells. The structural signature underneath them is a question that asks for an extremal value subject to a feasibility condition, where the condition gets monotonically easier as the value moves in one direction.

The diagnostic question, when the phrasing is less obvious, is: *is verifying a candidate answer easier than computing the answer?* If yes, and if verification is monotonic in the candidate, binary search applies. This is worth asking explicitly on any optimisation problem where the direct approach isn't materialising, because the mental gear-change from "compute it" to "guess and verify" is exactly the thing that doesn't happen on its own.

Koko eating bananas, split array largest sum, minimum days to make m bouquets, the smallest divisor given a threshold — these are the same problem with different set dressing, and recognising that is worth more than solving any one of them.

## The Parts That Go Wrong

Three failure modes account for most of the pain.

**Bounds.** `lo` and `hi` must bracket the answer, and getting them wrong is the usual bug. Set `lo` to the smallest conceivably valid answer and `hi` to the smallest obviously-sufficient one. In the shipping problem, `lo` is the largest single package — anything smaller can never ship it — and `hi` is the sum of all packages, which trivially works in one day. Both bounds should come from an argument, not from a guess; a too-small `hi` silently returns a wrong answer rather than crashing, which makes it nasty to spot.

**The update rule and termination.** With an inclusive `[lo, hi]` search for the leftmost true, the loop is: `mid = lo + (hi - lo) / 2`; if `feasible(mid)`, the answer is `mid` or smaller so `hi = mid`; else `lo = mid + 1`; continue while `lo < hi`; return `lo`. Change the invariant and every line changes with it. The classic infinite loop comes from writing `hi = mid` alongside a `mid` computation that rounds toward `lo` in a way that lets the range stop shrinking — which is why the invariant deserves to be stated rather than recalled. The `lo + (hi - lo) / 2` form rather than `(lo + hi) / 2` is the standard overflow guard, and matters in languages where the sum can exceed the integer range.

**Monotonicity that isn't.** The technique is only valid if the predicate genuinely flips once. If `feasible` can go true, then false, then true again as the parameter grows, binary search will land somewhere arbitrary and confidently return nonsense. Before committing, confirm the monotonicity in one sentence — usually a variant of "more resource never hurts."

## Why It Feels Like a Different Skill

The reason this pattern gets missed so consistently is that it inverts the usual direction of work. Most algorithm design builds the answer up from the input. This one starts by *assuming* an answer and asking whether the input can accommodate it, which is closer to how you'd verify a proof than how you'd construct one.

That inversion is also why it generalises past the specific problem list. Binary search on the answer is a member of a broader family — techniques that trade a hard construction problem for an easy decision problem — which includes parametric search and shows up in optimisation well outside interview contexts. The complexity is typically O(n log(range)), and the `log(range)` term is small enough to be nearly free: searching a billion possible answers costs about thirty feasibility checks. Thirty linear passes to solve a problem with no closed form is an excellent trade, and the fact that it feels like cheating is mostly a sign that the technique was filed under the wrong heading when it was first taught.


## Linked from

- [2_Problem Solving](index.md)
