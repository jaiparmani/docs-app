---
tags: [reads, algorithms, greedy, proofs, problem-solving]
---

# When Greedy Is Actually Correct

<small>4 min read</small>

Greedy is the most dangerous technique in the standard toolkit, and the danger is specific: a wrong greedy algorithm looks right. It is short, it is fast, it handles every example you construct by hand, and it fails on an input you would not have thought to try. Compare that to a wrong dynamic program, which typically produces obvious nonsense immediately. Greedy fails quietly, which is why it deserves a higher standard of proof than the confidence it inspires.

## The Failure Nobody Sees Coming

Making change is the canonical demonstration. Given coins of denominations 1, 3, and 4, make 6 using as few coins as possible. Greedy takes the largest coin that fits: 4, leaving 2, then 1 and 1 — three coins. The optimum is 3 + 3, two coins.

Nothing about that input is adversarial or large. Greedy fails on a six-unit target with three denominations, and it fails because the greedy choice was locally best and globally wrong. On US or Indian coin systems greedy happens to be optimal, which is a property of those specific denomination sets and not a property of the algorithm — an accident of design that has taught a great many people the wrong lesson, since the everyday case works and reinforces the instinct.

The general moral: greedy correctness depends on the structure of the problem, never on the greedy rule feeling sensible.

## The Exchange Argument

The standard tool for establishing that a greedy choice is safe is the exchange argument, and it is more approachable than its name suggests. Assume some optimal solution exists. Show that you can modify it to include your greedy choice without making it worse. If that always holds, then there is an optimal solution containing your greedy choice, so taking it costs nothing; recurse on the remainder.

Interval scheduling makes this concrete. Given intervals, select the maximum number that don't overlap. The greedy rule is: repeatedly take the interval that finishes earliest among those still compatible. Why is that safe? Take any optimal solution and look at its first interval. If it isn't the earliest-finishing one, swap it for the earliest-finishing interval. That swap is legal — the replacement ends no later, so it cannot conflict with anything the original didn't conflict with — and the solution size is unchanged. So an optimal solution containing the greedy choice exists. Induct.

Notice what that argument gives you that testing cannot: certainty across all inputs, from three sentences of reasoning. And notice that the *reason* it works is specific — "ends no later, so conflicts no more" is a property of intervals, not a general truth. Try the same argument with the greedy rule "take the shortest interval" and it collapses, which is the correct outcome, because that rule is wrong.

## Sorting Is Usually Where the Greedy Lives

Most correct greedy algorithms have the same shape: sort by the right key, then sweep taking whatever is locally available. The entire difficulty is which key.

Interval scheduling sorts by end time; sorting by start time or by duration both give wrong answers. Merging overlapping intervals sorts by start time. Huffman coding repeatedly merges the two lowest-frequency nodes. The activity-selection family, the fractional knapsack (sort by value-to-weight ratio), the minimum-spanning-tree constructions — same skeleton, different key, and the choice of key is precisely the thing the exchange argument justifies.

This gives a practical hint: when you suspect greedy, the real question is usually not "is greedy right" but "sorted by what?" Enumerating two or three candidate keys and trying to break each with a small counterexample is a fast, productive way to find the right one — and failing to break a key is weak evidence, while succeeding is proof it's wrong.

## The Standard You Should Hold

Before submitting a greedy solution, state in one sentence why the greedy choice is safe. Not "it seems right," not "it passes the samples" — an actual reason, in the shape of *taking this choice never makes the remaining problem worse, because ___*.

If you can fill that blank, you probably have a correct algorithm and you certainly have something to say when an interviewer asks why it works. If you cannot, treat the greedy solution as unverified. That does not mean discarding it — under time pressure, an unproven greedy that passes the samples may be the right gamble. But it should be a known gamble rather than misplaced confidence, and the tell that you are gambling is precisely the inability to fill in the blank.

The complementary habit is spending sixty seconds actively trying to break your own rule with a small case: three or four elements, a tie, a value that is unusually large or small relative to the rest. The coin example above is six units and three denominations. Counterexamples to wrong greedy algorithms are almost always tiny, because if a rule survives all small cases it is usually genuinely correct. Which means the search is cheap — and it is the difference between finding the flaw yourself and having a hidden test find it for you.


## Linked from

- [2_Problem Solving](index.md)
