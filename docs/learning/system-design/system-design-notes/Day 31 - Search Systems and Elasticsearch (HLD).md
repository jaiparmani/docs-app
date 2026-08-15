# Day 31 — Search Systems & Elasticsearch (HLD)

<small>4 min read</small>

## What we're learning today
Closing this arc by tying B+Tree indexing (Day 18), sharding (Day 21), and consistent hashing (Day 15) together into how full-text search actually works at scale.

## Core concept
A B+Tree index (Day 18) answers "find rows where `column = X`" efficiently. It cannot efficiently answer "find documents containing the word 'system'" across millions of documents with relevance ranking. That needs an **inverted index**.

## Visual diagram
```
Inverted Index:
  "system"  -> [doc1, doc5, doc9, doc23, ...]
  "design"  -> [doc1, doc3, doc9, ...]
  "cache"   -> [doc5, doc9, doc40, ...]

Query "system design":
  intersect posting lists for "system" AND "design" -> [doc1, doc9]
  then RANK by relevance score (TF-IDF / BM25)
```

## Explanation
- **Inverted index:** instead of row → columns (a normal DB table), map term → list of documents containing it (a "posting list"). A search query becomes a **set intersection** across posting lists — fast, and naturally supports ranking by term frequency.
- **Relevance scoring (BM25, successor to TF-IDF):** ranks by how often a term appears in a document (term frequency) weighted against how rare that term is across all documents (inverse document frequency) — a document mentioning "system design" 5 times ranks higher than one mentioning it once, and rare terms carry more weight than common ones like "the."
- **Elasticsearch's sharding:** built on Lucene under the hood, and shards its index across nodes — conceptually identical to Day 21's database sharding, but the "rows" are documents and the partition key is often just a round-robin/hash of document ID, since search queries need to fan out across *all* shards anyway (you can't know in advance which shard has documents matching "system design").
- **Why not just use your primary DB for search:** B+Tree indexes are ordered — great for exact match and range queries, terrible for "contains this word anywhere in this text field" or fuzzy/typo-tolerant matching. This is a fundamentally different access pattern requiring a fundamentally different data structure.

## Real-world examples
- **Amazon product search:** Elasticsearch (or OpenSearch) indexes product titles/descriptions, ranks by relevance + business signals (in-stock, ratings) layered on top of BM25.
- **GitHub code search:** an inverted-index-style system built for token/symbol search across billions of lines of code — same core idea, specialized tokenization for code.
- **Your Feed Ranking Engine (Day 9-10):** if you added a "search my past posts" feature, you would NOT extend your primary Postgres/MySQL store — you'd stand up a separate Elasticsearch index, synced via CDC (Change Data Capture) or dual-writes, because search is a fundamentally different query shape than your feed's read path.

## Interview perspective
This tests whether you recognize search as a **separate system with separate infrastructure**, not a feature you bolt onto your primary DB with a `LIKE '%term%'` query (which, recall from Day 18, can't use a B+Tree index effectively). Interviewers want to see you propose a secondary search index with a sync mechanism, and name the resulting consistency trade-off — search results may lag the primary DB by seconds (an AP-leaning choice, echoing Day 23).

## Trade-offs
| | Primary DB `LIKE` query | Dedicated search index (Elasticsearch) |
|---|---|---|
| Full-text relevance ranking | None | Yes (BM25) |
| Query speed at scale | Poor (full/partial scan) | Fast (inverted index) |
| Consistency with primary data | Always fresh | Eventually consistent (sync lag) |
| Operational cost | None extra | Separate cluster to run/scale |

## Interview question
"How do you keep Elasticsearch in sync with your primary Postgres database when a product's price or description updates? What's your consistency guarantee, and what breaks if the sync pipeline lags by 10 minutes?"

> [!question]- Think it through, then expand
> Where would you tap into Postgres to capture every change, without adding load to every write's hot path?

> [!success]- Answer
> A CDC (Change Data Capture) pipeline — e.g. Debezium reading Postgres's own WAL (a direct callback to Day 20) — streams every row change into Elasticsearch asynchronously, without the primary write path ever needing to know Elasticsearch exists. The alternative, dual writes (writing to both Postgres and Elasticsearch in the request path), couples their availability and adds latency to every write for no real benefit. The consistency guarantee is eventual: a 10-minute sync lag means search results could show a stale price or description for that window — usually acceptable for search/discovery (a shopper browsing isn't harmed by a slightly stale price shown in results), but unacceptable if search results feed directly into checkout without a fresh read from the primary DB immediately before charging.

## Key design principle
**Search is a different query shape than your primary data access pattern — don't force a B+Tree-indexed relational DB to do a specialized data structure's job.**

## 30-second challenge
Why does searching for "system design" needing to intersect *two* posting lists (Day 31's diagram) get significantly slower as more search terms are added — and how does that connect to why search engines often limit or optimize multi-term queries?

## Tomorrow
This closes the Caching → Sharding → Resilience → Messaging → Search arc. Next block moves into applied system design: full architectures for Chat (WhatsApp), Ride-hailing (Uber), and Video (YouTube) — pulling together everything from Days 1–31 into complete designs.
