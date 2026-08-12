# Day 45 — Geohash Proximity Search, Implemented (LLD)

## What we're learning today
Closes Block C. Day 44 explained geohashing conceptually. Today traces the actual encode → neighbor-lookup → expanding-search logic, the concrete mechanism behind [[06-design-uber]]'s `GEORADIUS` call.

## Core concept
A geohash is computed by **recursively bisecting** the latitude and longitude ranges based on which half the point falls in, interleaving the resulting bits into one string; proximity search means computing the query point's geohash, looking up its cell **and its 8 neighbors**, and expanding outward if too few results are found.

## Visual diagram
```
Encoding (simplified, a few bits):
  Longitude range [-180, 180], point at -73 -> falls in [-180, 0] -> bit 0
    range now [-180, 0], point at -73 -> falls in [-90, 0] -> bit 1
    ... continue bisecting, alternating longitude/latitude bits
  Interleave lat bits and long bits -> base32-encode -> "dr5re"

Neighbor lookup for cell "dr5re":
  N  NE  E
  W  dr5re  E
  SW  S  SE
  (8 neighbors computed via known bit-manipulation rules on the geohash, not re-derived from raw coordinates)

Expanding search:
  1. Query cell + 8 neighbors -> found 3 candidates, need top 5
  2. Not enough -> step out one more ring (16 more neighbor cells) OR reduce precision (shorter/coarser hash)
  3. Repeat until enough candidates found or max radius reached
```

## Explanation
- **Encoding is just repeated binary search on a range, alternating dimensions.** Each bit answers "is the point in the upper or lower half of the current range" for either longitude or latitude, alternating; more bits (a longer geohash string) means finer precision. This is why longer shared prefixes mean closer proximity (Day 44's core claim) — every additional shared character means the two points agreed on one more halving decision, narrowing down to a smaller and smaller shared region.
- **Neighbor cells are computed algorithmically from the geohash string itself**, not by re-encoding from scratch — standard geohash libraries implement this via bit manipulation on the encoded value (flipping specific interleaved bits corresponds to moving to a neighboring cell in a specific direction). You don't need to derive this bit manipulation from first principles for an interview — you need to know *that* it's a cheap, direct operation on the hash, which is part of why geohash-based proximity search is fast.
- **Expanding search has two levers, and knowing both is the actual signal:** (1) search more neighbor rings outward at the same precision, or (2) drop to a coarser (shorter) geohash precision, which covers more area per cell at the cost of proximity accuracy. Real systems (including Redis's `GEORADIUS`) typically pick a starting precision based on the requested search radius, then expand rings as needed — matching the precision to the query up front avoids either "too many tiny cells to check" or "too few, too coarse cells" as a fixed default.
- **This is where Day 44's abstract search loop becomes concrete**: "found 3 candidates, need top 5, not enough" is exactly the loop condition [[06-design-uber]]'s matching flow (`GEORADIUS around rider, expanding radius until N candidates found`) runs on every ride request — this LLD note is that HLD step, opened up.
- **Precision-vs-candidate-count is a tunable, request-time decision, not a fixed system parameter** — a dense urban query might find enough drivers within a tight, high-precision cell; a sparse rural query needs to expand much further (coarser precision or more rings) before finding any candidates at all — the search has to adapt per-query, not assume one fixed radius works everywhere.

```
pseudocode:
function findNearby(queryPoint, k):
    precision = precisionForRadius(initialGuessRadius)
    hash = encodeGeohash(queryPoint, precision)
    cells = [hash] + neighborCells(hash)   # 9 cells total
    candidates = geoStore.lookup(cells)

    while len(candidates) < k and precision > MIN_PRECISION:
        precision -= 1              # coarser cells, wider coverage
        hash = encodeGeohash(queryPoint, precision)
        cells = [hash] + neighborCells(hash)
        candidates = geoStore.lookup(cells)

    return sortByActualDistance(candidates, queryPoint)[:k]
```
Note the final step: geohash cell membership gets you a fast **candidate set**, but the final ranking still needs true distance (e.g. haversine formula) computed on that small candidate set only — the same "cheap broad filter, then precise scoring on a bounded set" two-stage pattern as [[09-design-news-feed]]'s candidate-generation-then-ranking split, reused here for geometry instead of relevance.

## Real-world examples
- **Redis's actual `GEORADIUS` implementation:** computes the minimum geohash precision that covers the requested radius, queries that cell and its neighbors from an internal sorted set, then filters candidates by true haversine distance — precisely the pseudocode above, in production code.
- **Elasticsearch's geo-queries:** support geohash-based bucketing/aggregation for map-clustering use cases (grouping nearby points on a map at a given zoom level), reusing the same prefix-proximity property for a visualization use case rather than a matching one.
- **[[06-design-uber]]'s matching flow:** this note's pseudocode is the literal implementation of that design's "Stage 1: retrieve candidates" step — worth re-reading that note's Section 7 side-by-side with this one now that the mechanism is concrete.

## Interview perspective
Being able to say "the geohash gives you a fast candidate set, but final ranking still needs a real distance calculation on that smaller set" is the signal that separates "I know Redis has GEORADIUS" from understanding *why* it's structured as two steps internally — a two-stage filter-then-score pattern that keeps showing up (Day 45, Day 44's boundary handling, [[09-design-news-feed]]'s ranking) precisely because it's how you make an expensive precise operation affordable at scale.

## Trade-offs
| | Fixed high precision always | Adaptive precision (expand as needed) |
|---|---|---|
| Dense area query cost | Cheap — few cells, plenty of candidates | Same — starts precise, no unnecessary widening |
| Sparse area query cost | Can return zero results even when candidates exist further out | Correctly widens until candidates are found |
| Implementation complexity | Simpler (one fixed precision) | Slightly more (a loop with a termination condition) |

## Interview question
"Your geohash-based nearby-candidates lookup returns 9 candidates, but 2 of them are actually farther away (by true distance) than several points that were excluded because they fell in a non-adjacent cell. Is this a bug?"

> [!question]- Think it through, then expand
> Reconsider what the geohash cell lookup is actually promising you.

> [!success]- Answer
> Not necessarily a bug — geohash proximity is approximate by construction (Day 44's boundary problem), and a fixed 9-cell neighbor lookup is a heuristic, not an exact "everything within radius R" guarantee. This is exactly why the algorithm always includes a final true-distance sort/filter step on the candidate set (this note's pseudocode's last line) — the geohash lookup's job is only to cheaply produce a *reasonable* candidate set, not a perfectly correct one, and the precision correction happens in the ranking step afterward. If the search radius genuinely needs to be wider, that's the expanding-search loop's job (widen precision/rings), not a sign the geohash approach itself is broken.

## Key design principle
**Geohash cell lookup is a cheap, approximate candidate filter — correctness for the final result comes from a true-distance calculation on the resulting small candidate set, not from the cell lookup being exact.**

## Next
Block C closes here — [[06-design-uber]] and [[08-design-youtube]]'s prerequisites (geospatial indexing, object storage) are now fully derived, not just referenced. Block D starts next: WebSockets & connection scaling (Day 46), the prerequisite [[07-design-chat-system]] leaned on ahead of time.
