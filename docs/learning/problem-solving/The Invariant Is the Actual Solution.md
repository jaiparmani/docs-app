---
tags: [reads, algorithms, invariants, two-pointers, sliding-window, problem-solving]
---

# The Invariant Is the Actual Solution

<small>5 min read</small>

Two pointers, sliding window, and monotonic stack are taught as three separate techniques, each with its own template to memorise. They are not three techniques. Each one is a single loop that maintains exactly one property, and every line of the code exists to preserve that property. Once you can state the property, the code writes itself — and more usefully, when the code is wrong you know precisely where to look, because there is only one thing that can be broken.

An invariant is a statement that is true before the loop starts, true after every iteration, and therefore true when the loop ends. That last part is the whole point. You design the invariant so that its truth *at termination* is the answer you wanted. The loop body is then not creative work; it is whatever mechanical adjustment keeps the statement true when the input changes underneath it.

## Three Techniques, Three Sentences

**Sliding window.** The invariant is: *the window `[left, right]` always satisfies the constraint.* For "longest substring without repeating characters," the constraint is that the window contains no duplicates. Now the code is forced. Extend `right` by one. If that broke the property — the new character was already inside — advance `left` until it holds again. Record the size. There is no decision left to make. The reason `left` never moves backwards, which is what buys you O(n) rather than O(n²), is not a clever optimisation someone thought of; it follows from the invariant, because a window that was already too small to violate the constraint cannot start violating it by shrinking further.

This also tells you immediately when sliding window does *not* apply. The technique needs the constraint to be monotonic in the window: if a window is valid, every sub-window must also be valid. All-positive subarray sums satisfy this. Introduce negative numbers and they don't, which is exactly why "maximum subarray sum" is not a sliding window problem despite looking like one. You don't have to discover that by failing on test case 34 — it falls out of checking whether the invariant is even maintainable.

**Two pointers on a sorted array.** The invariant is: *the answer, if it exists, lies within `[left, right]`.* For two-sum on sorted input, if `arr[left] + arr[right]` is too small, then `arr[left]` paired with anything in range is too small — it is the smallest available value and even the largest partner failed. So `left` can be discarded with certainty, not with hope. Each move eliminates an entire row or column of the implicit pair matrix, which is why O(n) suffices where the naive scan needs O(n²). The correctness argument is one sentence, and the sentence *is* the invariant.

**Monotonic stack.** The invariant is: *the stack is always increasing (or decreasing) from bottom to top.* For "next greater element," you push indices and pop whenever the incoming value would violate the ordering. The insight nobody states plainly: the element that forces a pop **is** the answer for the element being popped. That is not an extra step bolted on, it is a direct consequence of maintaining the order — you are popping precisely because the new element is greater, which is precisely what you were looking for. Each element is pushed once and popped once, so the whole thing is O(n) despite the nested-looking loop.

## Why This Is Worth the Reframe

The practical payoff is debugging. When a memorised template produces a wrong answer, you are reduced to tracing execution and adjusting `left++` versus `right--` until the tests pass, which is guessing with extra steps. When you have a stated invariant, there is a single diagnostic question: at which line does the property stop holding? Off-by-one errors stop being mysterious, because an off-by-one error is definitionally a boundary where the invariant is violated by one position, and you can check the boundary directly instead of running the loop in your head.

The second payoff is transfer. Binary search is an invariant technique too — *the target, if present, is in `[lo, hi]`* — and the endless confusion about whether to write `hi = mid` or `hi = mid - 1` dissolves once you commit to whether your range is inclusive or half-open, because the invariant then dictates the update. Same for the partition step in quicksort (*everything left of `i` is less than the pivot*), for Dijkstra (*every node in the visited set has its final shortest distance*), and for the loop in Kadane's algorithm (*`best_ending_here` is the maximum sum of any subarray ending at the current index*). These are not analogies. They are the same idea applied at different scales, which is why fluency with invariants generalises in a way that fluency with templates does not.

## Deriving Instead of Recalling

The workflow this suggests is deliberate and slightly slower at first. Before writing a loop, write the invariant as an English sentence — in a comment, on paper, wherever. Then ask three questions: is it true before the loop starts, does the body restore it after the input changes, and does its truth at termination give me the answer? If all three hold, the implementation is transcription. If the third fails, you have designed the wrong invariant, and you have discovered that before writing a hundred lines rather than after.

This is why the "I've seen this pattern before" feeling is a weaker skill than it looks. Pattern recall gets you to the right template on problems that resemble ones you've done, and abandons you on the ones that don't. Invariant reasoning constructs the solution from the requirement itself, which means it works on problems you have never seen — including the one where the interviewer changes the constraints halfway through specifically to find out which of the two you were doing.


## Linked from

- [2_Problem Solving](index.md)
