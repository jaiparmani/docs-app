# Day 44 — Geospatial Indexing (HLD)

## What we're learning today
[06-design-uber](../Claude Notes/06-design-uber.md) leaned on geohash and quadtrees without deriving them. Today builds that prerequisite properly — a genuinely new access pattern ("find things near this point") that none of Days 11–31's indexing structures (B-Tree, inverted index) are shaped for.

## Core concept
**Geospatial indexing** structures 2D location data so "find everything within radius R of point P" is fast, by encoding proximity into a form a normal 1D index (a sorted string, a tree) can search — the two dominant approaches are **geohashing** (encode lat/long into a sortable string where shared prefixes mean nearby) and **quadtrees** (recursively subdivide space based on point density).

## Visual diagram
```
Geohash: recursively bisect lat/long ranges, interleave bits into a base32 string
  "9q8yy" and "9q8yz" share a 4-character prefix -> physically close
  Longer shared prefix = closer proximity (roughly)

Quadtree: subdivide a region into 4 quadrants; keep subdividing dense quadrants further
       [NW][NE]
       [SW][SE]     <- SE has many points, gets subdivided again:
                        [SE-NW][SE-NE]
                        [SE-SW][SE-SE]
  Sparse regions stay coarse; dense regions (e.g. a city center) get fine-grained
```

## Explanation
- **Why a B-Tree (Day 18) doesn't work here:** a B-Tree gives you fast range queries on a single ordered dimension (`WHERE price BETWEEN x AND y`). Location is two-dimensional — there's no single natural ordering of (lat, long) pairs where "nearby in the ordering" reliably means "nearby in physical space." A B-Tree sorted by latitude alone would put two points at the same latitude but opposite sides of the planet right next to each other in the index.
- **Geohash's trick: interleave the bits of latitude and longitude** into one string, so that increasingly long shared prefixes correspond (approximately) to increasingly close physical proximity. This turns a 2D proximity problem into something a normal sorted index (or hash-by-prefix) can answer — which is exactly why it composes so cleanly with tools you already know (Redis sorted structures, prefix-based sharding from [10-design-search-autocomplete](../Claude Notes/10-design-search-autocomplete.md)).
- **The boundary problem, precisely (this is what [06-design-uber](../Claude Notes/06-design-uber.md)'s quiz already tested):** two points can be physically adjacent but fall into different geohash cells if they're on opposite sides of a cell boundary, because the grid is fixed and arbitrary relative to any specific query point. The fix is always searching the query cell **plus its neighboring cells**, not just an exact-prefix match.
- **Quadtrees solve a different problem: uneven density.** A fixed-precision geohash grid wastes resolution on sparse areas (rural regions get needlessly fine cells) and can be too coarse for dense areas (a cell in Manhattan might contain thousands of points). A quadtree adapts: it only subdivides further where points are actually dense, giving roughly even numbers of points per leaf node regardless of geographic area — the direct trade-off is a more complex, less naturally-shardable structure than a flat geohash string.
- **Both structures answer "find nearby" the same general way**: locate the query point's cell/node, then expand outward (neighboring cells, or up/down the quadtree) until enough candidates are found or the search radius is satisfied — "expanding ring search," the same shape regardless of which underlying structure you pick.

## Real-world examples
- **Redis `GEOADD`/`GEORADIUS`:** implemented as a geohash-encoded sorted set under the hood — a real, production system directly using the structure described above, and exactly what [06-design-uber](../Claude Notes/06-design-uber.md)'s deep dive named as "the practical answer for what you'd actually run."
- **Uber's H3 (their own open-sourced hexagonal grid system):** a more sophisticated evolution of the same core idea — hexagonal cells instead of square geohash cells, specifically because hexagons have uniform neighbor distance in every direction (a square cell's diagonal neighbor is farther away than its edge neighbor, a subtle geohash imprecision H3 was built to fix).
- **PostGIS (PostgreSQL's geospatial extension):** implements R-trees (a relative of quadtrees, bounding-box based) as the indexing structure behind `ST_DWithin` and similar proximity queries — the same "specialized structure for 2D range/proximity queries" idea, in relational-database form.

## Interview perspective
Naming "geohash" or "quadtree" alone is table stakes. The signal is explaining *why neither a B-Tree nor a plain lat/long range scan works for 2D proximity* (the dimensionality argument above), and — if pushed — explaining the boundary problem and its fix, which is the specific detail that separates "I've heard of geohashing" from understanding how it's actually queried correctly.

## Trade-offs
| | Geohash | Quadtree |
|---|---|---|
| Handles uneven density | Poorly at fixed precision — same cell size everywhere | Well — adapts subdivision to density |
| Sharding | Natural (prefix-based, same idea as Day 21/Day 10's trie sharding) | Requires custom partitioning of the tree structure |
| Implementation | Simple, widely supported natively (Redis, etc.) | More custom, less off-the-shelf support |
| Boundary/edge-case handling | Needs explicit neighbor-cell search | Needs explicit neighbor-node search, structurally similar issue |

## Interview question
"A user is searching for restaurants near a point exactly on a geohash cell boundary. A great restaurant is 20 meters away, just across that boundary. Why might a naive query miss it, and how do you fix it?"

> [!question]- Think it through, then expand
> This is the same boundary problem from [06-design-uber](../Claude Notes/06-design-uber.md)'s quiz — restate it in your own words before expanding.

> [!success]- Answer
> A geohash query that only looks up the exact cell containing the search point will miss anything in an adjacent cell, even if that point is physically closer than something correctly found in the same cell — the grid boundary is arbitrary relative to the query point, not aligned with actual proximity. The fix is to always query the search point's cell **and its neighboring cells** (the 8 surrounding cells, typically), and expand the search radius further (coarser precision, or more neighbor rings) if too few results are found — never trust a single-cell lookup as complete for a proximity query.

## Key design principle
**Proximity search needs a structure that encodes 2D nearness into something a normal index can query — neither a B-Tree's single-dimension ordering nor a naive coordinate range scan captures that, which is why geospatial data structures exist as their own category.**

## 30-second challenge
Why would Uber (real-world H3 users) prefer hexagonal cells over square geohash cells specifically for a driver-matching use case — what does uniform neighbor distance actually buy you at query time?

## Tomorrow
Day 45 (LLD) — implement geohash proximity search concretely: encoding, neighbor-cell lookup, and the expanding-radius search loop, as actual logic instead of a diagram.
