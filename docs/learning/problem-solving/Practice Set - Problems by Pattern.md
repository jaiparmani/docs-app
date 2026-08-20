---
tags: [algorithms, practice, leetcode, interview-prep, problem-solving]
---

# Practice Set — Problems by Pattern

<small>7 min read</small>

A working set of problems grouped by technique rather than by difficulty, so that each block drills one recognition skill at a time. Every section names the phrasing signal that identifies the pattern and the invariant the loop maintains — the two things that turn "I've seen this before" into "I can derive this."

Work a section top to bottom; the ordering within each is deliberate, easiest first, with the last one or two being the version that breaks a naive understanding of the pattern. If a problem takes more than about forty minutes, read the editorial — grinding past that point mostly teaches frustration, not technique.

## Sliding Window

**Signal:** "contiguous subarray", "substring", "longest/shortest ... such that"
**Invariant:** the window `[left, right]` always satisfies the constraint

| # | Problem | Difficulty |
|---|---|---|
| 643 | Maximum Average Subarray I | Easy |
| 3 | Longest Substring Without Repeating Characters | Medium |
| 209 | Minimum Size Subarray Sum | Medium |
| 424 | Longest Repeating Character Replacement | Medium |
| 438 | Find All Anagrams in a String | Medium |
| 76 | Minimum Window Substring | Hard |

Do 76 last and expect it to hurt. It is the problem that forces you to state the invariant precisely, because "valid window" now means a multiset condition rather than a simple one.

## Two Pointers

**Signal:** sorted input, "pair", "triplet", "in-place"
**Invariant:** the answer, if it exists, lies within `[left, right]`

| # | Problem | Difficulty |
|---|---|---|
| 125 | Valid Palindrome | Easy |
| 167 | Two Sum II — Input Array Is Sorted | Medium |
| 11 | Container With Most Water | Medium |
| 15 | 3Sum | Medium |
| 42 | Trapping Rain Water | Hard |

11 is the one worth sitting with: the correctness argument for moving the shorter side is a genuine proof, not a heuristic, and being able to state it is the point of the exercise.

## Binary Search (and Binary Search on the Answer)

**Signal:** sorted array — or, far more importantly, "minimize the maximum", "maximum of minimum", "smallest X such that"
**Invariant:** the target, if present, lies in `[lo, hi]`

| # | Problem | Difficulty |
|---|---|---|
| 704 | Binary Search | Easy |
| 153 | Find Minimum in Rotated Sorted Array | Medium |
| 33 | Search in Rotated Sorted Array | Medium |
| 875 | Koko Eating Bananas | Medium |
| 1011 | Capacity To Ship Packages Within D Days | Medium |
| 410 | Split Array Largest Sum | Hard |

The bottom three are the ones that matter most. There is no sorted array to search in any of them — you are searching the space of possible answers and asking a yes/no feasibility question at each step. Recognising that is the single highest-value pattern unlock on this page.

## Monotonic Stack

**Signal:** "next greater", "previous smaller", "nearest element that is"
**Invariant:** the stack is always increasing (or decreasing) bottom to top

| # | Problem | Difficulty |
|---|---|---|
| 496 | Next Greater Element I | Easy |
| 739 | Daily Temperatures | Medium |
| 907 | Sum of Subarray Minimums | Medium |
| 84 | Largest Rectangle in Histogram | Hard |
| 85 | Maximal Rectangle | Hard |

85 is 84 wearing a costume — once you see that each row reduces to a histogram, the hard problem becomes the medium one you already solved.

## Heap / Top-K

**Signal:** "kth largest", "top K", "k most frequent", "median from a stream"
**Invariant:** the heap holds exactly the k best elements seen so far

| # | Problem | Difficulty |
|---|---|---|
| 1046 | Last Stone Weight | Easy |
| 215 | Kth Largest Element in an Array | Medium |
| 347 | Top K Frequent Elements | Medium |
| 23 | Merge k Sorted Lists | Hard |
| 295 | Find Median from Data Stream | Hard |

295 is the two-heap technique and is worth knowing cold — it comes up in system-design-flavoured rounds as much as algorithm rounds.

## Prefix Sums / Hash Map

**Signal:** "subarray sum equals", "range query", "count of pairs that"
**Invariant:** the map holds every prefix state seen so far, so any suffix can be resolved in O(1)

| # | Problem | Difficulty |
|---|---|---|
| 1 | Two Sum | Easy |
| 242 | Valid Anagram | Easy |
| 238 | Product of Array Except Self | Medium |
| 560 | Subarray Sum Equals K | Medium |
| 128 | Longest Consecutive Sequence | Medium |
| 49 | Group Anagrams | Medium |

560 is the answer to "why isn't this a sliding window" — negative numbers break the window invariant, so prefix sums plus a hash map take over.

## Trees

**Signal:** anything with a root; "level order" means BFS, everything else usually means DFS
**Invariant:** the recursion returns a fully-solved answer for the subtree it was given

| # | Problem | Difficulty |
|---|---|---|
| 104 | Maximum Depth of Binary Tree | Easy |
| 226 | Invert Binary Tree | Easy |
| 102 | Binary Tree Level Order Traversal | Medium |
| 98 | Validate Binary Search Tree | Medium |
| 236 | Lowest Common Ancestor of a Binary Tree | Medium |
| 124 | Binary Tree Maximum Path Sum | Hard |

98 is the classic trap: checking `left < node < right` locally is wrong, and the fix — passing down a valid range — is itself an invariant argument.

## Graphs (BFS, DFS, Topological Sort)

**Signal:** "shortest path" in unweighted graph → BFS; "prerequisites", "ordering", "dependencies" → topological sort; "islands", "regions", "connected" → flood fill
**Invariant:** for BFS, every node in the queue is at the current distance or one more

| # | Problem | Difficulty |
|---|---|---|
| 200 | Number of Islands | Medium |
| 994 | Rotting Oranges | Medium |
| 133 | Clone Graph | Medium |
| 207 | Course Schedule | Medium |
| 210 | Course Schedule II | Medium |
| 417 | Pacific Atlantic Water Flow | Medium |

994 is multi-source BFS — starting the queue with every rotten orange at once, rather than looping — and that trick recurs constantly.

## Backtracking

**Signal:** "all possible", "generate every", "return all combinations" — always paired with a tiny n in the constraints
**Invariant:** the partial candidate is always valid; recursion extends it, the undo step restores it

| # | Problem | Difficulty |
|---|---|---|
| 78 | Subsets | Medium |
| 46 | Permutations | Medium |
| 39 | Combination Sum | Medium |
| 79 | Word Search | Medium |
| 51 | N-Queens | Hard |

All five are one template with a different validity check. Writing them as five separate solutions is the mistake; writing the template once and swapping the predicate is the lesson.

## Dynamic Programming

**Signal:** "number of ways", "minimum cost to", "longest subsequence" (note: *subsequence*, not subarray)
**Invariant:** `dp[i]` is the fully-solved answer for the subproblem ending at `i`

| # | Problem | Difficulty |
|---|---|---|
| 70 | Climbing Stairs | Easy |
| 198 | House Robber | Medium |
| 322 | Coin Change | Medium |
| 300 | Longest Increasing Subsequence | Medium |
| 139 | Word Break | Medium |
| 1143 | Longest Common Subsequence | Medium |
| 416 | Partition Equal Subset Sum | Medium |
| 72 | Edit Distance | Hard |

Write each one as brute-force recursion first, then memoise, then convert to a table. Doing it in that order is what makes the recurrence obvious instead of magic.

## Greedy and Intervals

**Signal:** "minimum number of", "maximum you can attend", overlapping ranges
**Invariant:** the locally optimal choice is never worse than any alternative — and this needs an argument, not a feeling

| # | Problem | Difficulty |
|---|---|---|
| 55 | Jump Game | Medium |
| 45 | Jump Game II | Medium |
| 134 | Gas Station | Medium |
| 56 | Merge Intervals | Medium |
| 57 | Insert Interval | Medium |
| 435 | Non-overlapping Intervals | Medium |

For every one of these, try to state why the greedy choice is safe. If you cannot, you have memorised a solution rather than learned one — and greedy is the pattern where that gap costs you the most, because a wrong greedy looks right on every small test case.

## Linked Lists

**Signal:** the input is a list node; "in-place", "O(1) space", "cycle"
**Invariant:** pointer relationships hold at every step (the reason to draw it before coding it)

| # | Problem | Difficulty |
|---|---|---|
| 206 | Reverse Linked List | Easy |
| 21 | Merge Two Sorted Lists | Easy |
| 141 | Linked List Cycle | Easy |
| 19 | Remove Nth Node From End of List | Medium |
| 143 | Reorder List | Medium |

Fast/slow pointers solve 141, 19, and half of 143. It is one idea, not three.

## Union-Find and Tries

Two structures worth a short block each, mostly because they are instantly recognisable once known and nearly impossible to invent under time pressure.

| # | Problem | Difficulty | Structure |
|---|---|---|---|
| 547 | Number of Provinces | Medium | Union-Find |
| 684 | Redundant Connection | Medium | Union-Find |
| 208 | Implement Trie (Prefix Tree) | Medium | Trie |
| 211 | Design Add and Search Words Data Structure | Medium | Trie |
| 212 | Word Search II | Hard | Trie + backtracking |

## Bit Manipulation

**Signal:** "without using arithmetic operators", "single number", "count bits", constraints hinting at XOR properties

| # | Problem | Difficulty |
|---|---|---|
| 191 | Number of 1 Bits | Easy |
| 136 | Single Number | Easy |
| 268 | Missing Number | Easy |
| 338 | Counting Bits | Easy |
| 371 | Sum of Two Integers | Medium |

## How to Use This

Pick one pattern per session rather than working across sections. The point of grouping by technique is that consecutive problems reinforce the same recognition, and interleaving destroys that — at least until the pattern is solid, at which point mixing becomes the better practice precisely because it forces you to identify the pattern rather than being told it.

Track the ones you needed the editorial for and return to them a week later without looking. Re-solving a problem you previously failed is worth more than a new problem of equivalent difficulty, since the failure marks the actual gap.


## Linked from

- [2_Problem Solving](index.md)
