---
tags: [reads, algorithms, dynamic-programming, recursion, problem-solving]
---

# Dynamic Programming Is One Idea Wearing Many Costumes

<small>6 min read</small>

Dynamic programming has a reputation problem. It arrives in most curricula as a catalogue: knapsack, longest common subsequence, edit distance, coin change, matrix chain multiplication, each with its own table layout and recurrence to be memorised. Presented that way it looks like a family of unrelated tricks, and the natural conclusion is that competence means having seen enough of them. That conclusion is wrong, and it is why so many otherwise strong engineers describe DP as the thing they never quite got.

There is only one idea. **If a problem's solution can be assembled from solutions to subproblems, and those subproblems recur, compute each one once and reuse the answer.** Everything else — tables, loops, iteration order, dimension counts, space optimisation — is bookkeeping around that single observation.

## The Whole Technique, Discovered in Four Lines

The cleanest way to see it is to watch it appear by accident. Naive recursive Fibonacci:

```python
def fib(n):
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)
```

This is exponential, and it is worth being precise about why. The call tree for `fib(50)` contains `fib(48)` twice, `fib(47)` three times, `fib(46)` five times — the multiplicities are themselves Fibonacci numbers — and the total number of calls grows like φⁿ. The algorithm is not slow because recursion is slow. It is slow because it solves the same fifty-odd distinct subproblems on the order of a billion times.

Now add a cache:

```python
from functools import cache

@cache
def fib(n):
    if n < 2: return n
    return fib(n - 1) + fib(n - 2)
```

Linear. Fifty distinct subproblems, each computed once, each reused as many times as needed. The decorator changed the asymptotics from exponential to linear without touching the logic, and — this is the part worth internalising — **that is already dynamic programming**. Top-down, memoised, complete. There is no further technique waiting behind it. If you have ever cached a recursive function, you have written DP and possibly did not notice.

The bottom-up version is the same computation with the recursion turned inside out. Instead of asking for `fib(n)` and letting the call stack discover which smaller values it needs, you observe that the dependencies always point downward and simply fill in ascending order:

```python
def fib(n):
    prev, cur = 0, 1
    for _ in range(n - 1):
        prev, cur = cur, prev + cur
    return cur
```

Identical arithmetic, identical number of additions, different control flow. The reasons to prefer bottom-up are practical rather than conceptual. There is no call stack, so no stack-overflow ceiling on large inputs and no per-call overhead. The table is traversed in a predictable order, which is friendlier to the cache. And because the dependency pattern is explicit, it becomes obvious when you only need the last row or the last two values, which is how a two-dimensional table collapses into a one-dimensional array or, as above, into two scalars. Top-down keeps its own advantages: it computes only the subproblems actually reachable from the goal, which matters when the state space is large but sparsely used, and it reads closer to the way you reasoned about the problem.

## The Two Conditions, and What Happens When One Fails

DP applies when a problem has optimal substructure and overlapping subproblems. Optimal substructure means an optimal solution to the whole is composed of optimal solutions to its parts — if the shortest path from A to C runs through B, the A-to-B portion must itself be a shortest path, or you could swap in a better one and improve the whole. Overlapping subproblems means the recursion revisits the same subproblem many times.

The second condition is the one that gets glossed over, and understanding its failure mode clarifies what DP actually buys you. Merge sort has beautiful optimal substructure: sort each half, merge. But sorting the left half and sorting the right half share no subproblems at all — every recursive call operates on a disjoint slice. Memoising merge sort accomplishes nothing except wasting memory. That is divide-and-conquer, not DP, and the distinction is precisely the overlap. **DP is not a way to decompose problems; it is a way to avoid paying for a decomposition more than once.** Where nothing repeats, there is nothing to save, and you are simply doing recursion.

This also explains where the leverage lives. The runtime of a DP is, to a first approximation, the number of distinct states multiplied by the cost of computing one state from its dependencies. Edit distance on strings of length m and n has m·n states and O(1) transition cost, hence O(mn). Knapsack with n items and capacity W has n·W states, which is why it is called pseudo-polynomial: polynomial in W, but W is written in binary in the input, so it is exponential in the input's length. Once you can count states, you can predict the complexity before writing a line.

## The Part That Is Actually Hard

Which brings us to the thing that problem-grinding tends to skip. Given the recurrence, writing a DP is mechanical: allocate a table, pick an iteration order consistent with the dependencies, handle base cases, fill. That part is typing. The genuine difficulty in a hard DP problem, almost without exception, is **deciding what a subproblem is** — which parameters fully identify a state.

A state must be a sufficient summary: everything about the past that affects the future must be captured in it, and nothing else should be. Too little and the recurrence is simply wrong, because two situations needing different answers collapse into the same cell. Too much and the state space explodes into intractability. The craft is finding the minimal sufficient description. In edit distance, "how many operations to convert the first i characters of A into the first j characters of B" is a good state because the prefixes are all that matter — how you got there is irrelevant. In the stock-trading family of problems, position (holding versus not holding) and transactions-used-so-far must join the day index, because the best answer on day i genuinely depends on them. In problems over subsets, the state is a bitmask because no smaller summary preserves the needed information.

Notice the pattern: in each case, once the state is stated correctly in a single English sentence, the recurrence is nearly forced. You ask "what is the last decision that produced this state, and what states could have preceded it?" and the transitions fall out. This is why experienced solvers spend most of their time before writing any code, articulating what the table means, and why writing that sentence down explicitly — as a comment, in plain language, including exactly what the value at a cell represents — catches most DP bugs before they exist.

So when someone says they find DP hard, they are almost never describing difficulty with caching, or tables, or iteration order. They are describing difficulty modelling a problem: looking at a tangle of choices and seeing which handful of numbers separates one situation from another. That skill is not specific to dynamic programming at all — it is the same act of abstraction that produces good schemas, good APIs, and good type definitions. DP just happens to be the place where getting it wrong fails loudly and immediately, which makes it an unusually honest place to practise.
