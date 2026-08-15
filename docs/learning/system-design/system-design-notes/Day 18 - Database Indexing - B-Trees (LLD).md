# Day 18 — Database Indexing: B-Trees & B+Trees (LLD)

<small>3 min read</small>

## What we're learning today
Every `WHERE` clause you've ever written that returned fast relied on this structure. Today we look inside the index.

## Core concept
A naive table scan is O(n). An index turns lookups into O(log n) using a **B-Tree** — a balanced, disk-optimized tree where each node holds many keys (not just 2 like a binary tree), minimizing disk reads.

## Visual diagram
```
B+Tree (used by MySQL InnoDB, Postgres):

              [50 | 100]
             /     |      \
      [10|30]   [60|80]   [120|150]
       /  |  \    /  |  \    /  |  \
   ...   ...  ... leaf nodes contain actual row data,
                   AND are linked to each other -->
   leaf1 -> leaf2 -> leaf3 -> leaf4  (fast range scans)
```

## Explanation
- **Why not binary search tree?** A BST's height grows with n, and each node = one disk read. Disk I/O is ~100,000x slower than memory access — minimizing *height* (not just comparisons) is the real optimization target.
- **B-Tree:** each node holds multiple keys (branching factor often 100-500), keeping tree height very small (a B-Tree of height 3 can index billions of rows). Data can live in internal nodes too.
- **B+Tree (what databases actually use):** all actual data lives only in **leaf nodes**; internal nodes hold only keys for navigation. Leaves are linked in a list — this makes **range queries** (`WHERE age BETWEEN 20 AND 30`) fast: find the start leaf, then walk the linked list, no re-traversal from root.
- **Why indexes slow down writes:** every `INSERT`/`UPDATE` must maintain tree balance (splits/merges) — this is why you don't index every column blindly.

**Common misconception:** "More indexes = faster queries, always." Wrong — each index is a separate B+Tree that must be updated on every write. Over-indexing trades write throughput for read speed you may not need.

## Real-world examples
- **MySQL InnoDB:** primary key is a **clustered index** — the B+Tree leaf *is* the row data. Secondary indexes store the primary key as a pointer, requiring an extra lookup (why composite/covering indexes matter for performance).
- **Postgres:** uses B-Tree by default but supports GIN/GiST indexes for full-text search and geospatial data — different access pattern, different structure.

## Interview perspective
This tests whether you understand *why* a query is slow beyond "add an index." Interviewers probe: "why does `LIKE '%term%'` not use a B+Tree index effectively?" (Answer: B+Trees are ordered by prefix — a leading wildcard can't binary-search into the middle of the tree, forcing a scan.)

## Trade-offs
| | No Index | B+Tree Index |
|---|---|---|
| Read (point lookup) | O(n) | O(log n) |
| Read (range scan) | O(n) | O(log n + k) via leaf links |
| Write cost | O(1) append | O(log n), plus tree rebalancing |
| Storage | None extra | Extra space per index |

## Interview question
"You have a `users` table with 500M rows and a query filtering on `(country, signup_date)`. Single-column indexes on each exist separately but the query is still slow. Why, and what's the fix?"

> [!question]- Think it through, then expand
> The DB has two separate B+Trees to work with here — what does it actually have to do to use both?

> [!success]- Answer
> With two separate single-column indexes, the database typically picks the more selective one (say, `country`), scans its B+Tree for matching rows, and then filters those results by `signup_date` without an index — an intersection of two separate B+Trees isn't something the engine can do efficiently, so one of the two conditions ends up unindexed in practice. The fix is a single composite index on `(country, signup_date)` — the DB can narrow by both conditions in one tree traversal, since the tree is now ordered by country first, then signup_date within each country, matching the query's actual filter shape.

## Key design principle
**An index trades write cost and storage for read speed — index the query patterns you actually have, not every column defensively.**

## 30-second challenge
Why does adding an index on a low-cardinality column (e.g., `boolean is_active`) often provide little to no benefit, even though it's technically indexed?

## Tomorrow
Day 19 (HLD) — Database replication: leader-follower architecture, sync vs async, and replication lag.
