---
tags: [aws, certification, genai-developer-professional, vector-stores]
exam: AIP-C01
domain: "1 — Foundation Model Integration, Data Management, and Compliance"
tasks: [1.4]
---

# Vector Stores and Embeddings for FM Augmentation

<small>8 min read</small>

## Core concept
A vector store is only as good as two decisions made upstream of it: **which embedding model** produced the vectors, and **how the data is organized/indexed** for the queries you'll actually run. This exam doesn't test "what is an embedding" — it tests whether you can pick the right storage architecture for a given scale, query pattern, and existing-infrastructure constraint, and whether you understand that a vector store is a **living system requiring maintenance** (stale embeddings are a correctness bug, not a cosmetic issue), not a one-time load-and-forget index.

The production framing: embeddings and vector storage are infrastructure decisions with real operational cost — reindexing at scale is expensive, embedding model changes require full reindexing (old and new embeddings aren't comparable), and "which vector store" is often dictated more by what data platform you already operate than by raw vector-search benchmarks.

## Service comparison
| Situation | Choice | Why |
|---|---|---|
| Want a fully managed RAG pipeline with minimal infrastructure ownership | **Bedrock Knowledge Bases** | Manages chunking, embedding generation, and vector storage/retrieval end-to-end — the default unless a specific requirement pushes you elsewhere |
| Need fine-grained control over indexing strategy (sharding, multi-index, custom scoring) at large scale | **OpenSearch Service** with the vector/Neural plugin | Purpose-built search engine with mature sharding and hybrid (keyword + vector) search support |
| Already running Postgres/Aurora and want to avoid a new data store | **Amazon Aurora with pgvector** | Keeps vectors alongside relational data in infrastructure you already operate and secure — the right call when "minimize new moving parts" is a stated constraint |
| Need to associate rich, queryable metadata with each vector at scale, with a simple key-based access pattern | **DynamoDB paired with a vector database** for metadata + embeddings | Fits when metadata filtering (author, timestamp, domain tags) is as important as the vector similarity itself |
| Documents already live in S3 and need a lightweight retrieval layer without standing up dedicated infrastructure | **Amazon RDS with S3 document repositories**, or Knowledge Bases pointed directly at S3 | Minimizes duplication — S3 stays the document source of truth |
| Enterprise search across existing document repositories (wikis, file shares) rather than a pure RAG vector store | **Amazon Kendra** | ML-powered enterprise search, can itself serve as a retriever behind an FM, distinct from standing up your own vector index |

## Trade-offs & failure modes
- **Embedding model choice locks in a dimensionality and domain fit you can't casually change.** Swapping embedding models later means fully regenerating every vector — old and new embeddings are not comparable in the same index. Evaluate embedding model choice (e.g. Titan embeddings' dimensionality options vs. domain fit) upfront, not as an afterthought.
- **Metadata design is a retrieval-quality lever, not a bookkeeping detail.** Timestamps, authorship, domain tags attached as S3 object metadata or custom attributes let retrieval filter *before* similarity search runs — skipping this means every query does a full semantic search over irrelevant content, hurting both relevance and cost.
- **Hierarchical/multi-index strategies exist because one flat index doesn't scale cleanly.** OpenSearch sharding strategies and multi-index approaches (e.g. one index per domain/content-type) are the answer when a single large flat index degrades search performance or mixes unrelated content types in ways that hurt relevance.
- **Staleness is a correctness failure, not just a freshness nuisance.** A vector store answering questions from a document that was deleted or updated three weeks ago is actively wrong, not just outdated. This is why Skill 1.4.5 explicitly calls out incremental update mechanisms, real-time change detection, and scheduled refresh pipelines as first-class design requirements, not optional polish.
- **Integration components for external knowledge sources** (document management systems, internal wikis) need an explicit sync mechanism — a one-time bulk load with no ongoing pipeline is a design that's correct on day one and wrong by day thirty.

## Security & cost considerations
- Vector stores holding embedded proprietary/sensitive content need the same access-control rigor as the source documents — an embedding is a lossy but real representation of the underlying content, and unrestricted read access to the vector index can leak information the source document access controls were meant to protect.
- **OpenSearch sharding and multi-index choices directly affect cost**, not just performance — over-provisioned shard counts for a dataset that doesn't need them is wasted spend; under-provisioned sharding degrades query latency at scale.
- Reindexing after an embedding model change is a real, sometimes-large one-time cost (re-embedding every document plus re-writing the index) — worth surfacing explicitly when a scenario proposes "just switch to a better embedding model" as if it were free.

## Troubleshooting signals
| Symptom | Likely cause | Fix direction |
|---|---|---|
| Retrieved results are semantically plausible but reference outdated/deleted content | No incremental sync/refresh pipeline, or a stale scheduled-refresh interval | Implement change-detection-triggered updates or tighten the refresh schedule (Skill 1.4.5) |
| Search quality degrades as the corpus grows | Flat single index at a scale that needs sharding or domain-based multi-index segmentation | Introduce OpenSearch sharding strategy or multi-index architecture by domain/content-type |
| Retrieval returns technically-similar but contextually-irrelevant results across unrelated document types | No metadata filtering ahead of similarity search | Add metadata-based pre-filtering (domain tags, content type) before/alongside vector similarity |
| A migration to a "better" embedding model produces worse retrieval quality immediately after cutover | Full reindex wasn't completed — old and new embeddings mixed in the same index | Full reindex is mandatory on embedding model change; never mix embedding-model vintages in one index |

## Exam traps & decision rules
- **Trap: treating vector store selection as a pure performance benchmark question.** Decision rule: existing infrastructure investment (already on Aurora? already on DynamoDB?) and metadata/filtering requirements often outweigh raw vector-search speed in the correct answer.
- **Trap: "load once, done."** Decision rule: any scenario describing a knowledge base tied to a *changing* source (a wiki, a document repository that gets edited) requires an explicit sync/refresh mechanism in the answer — a static one-time load is always the wrong choice for living data.
- **Trap: assuming Bedrock Knowledge Bases is always the answer.** Decision rule: it's the default for "minimize infrastructure ownership," but a requirement for custom sharding, hybrid search tuning, or reuse of existing Aurora/DynamoDB infrastructure points to OpenSearch/pgvector/DynamoDB instead.
- **Trap: swapping embedding models without accounting for reindexing.** Decision rule: any answer proposing an embedding model change must also account for a full reindex — an option that implies zero-downtime, zero-reprocessing model swap is wrong.

## Rapid recall
- Bedrock Knowledge Bases = managed end-to-end RAG storage; OpenSearch = fine-grained control + hybrid search + sharding; Aurora/pgvector = reuse existing relational infra; DynamoDB+vector = metadata-heavy access patterns; Kendra = enterprise search, not a bespoke vector index.
- Embedding model choice is a one-way door per index — changing it means full reindex, no partial migration.
- Metadata (timestamps, authorship, domain tags) is a retrieval-quality and cost lever via pre-filtering, not bookkeeping.
- Staleness = correctness bug. Every vector store design needs an explicit refresh/sync mechanism for living data sources.
- Sharding/multi-index exists to prevent one flat index from degrading as the corpus grows or mixes domains.

## Practice questions
Write your own answer first — then expand.

**1.** A company already runs its core application data on Aurora PostgreSQL and wants to add RAG capability with minimal new infrastructure to operate and secure. What's the best-fit vector store choice, and why?

> [!success]- Answer
> Aurora with the pgvector extension. It keeps vector storage inside infrastructure the team already operates, monitors, and secures, avoiding a net-new data store, its own access-control model, and its own operational learning curve — directly satisfying a "minimize new moving parts" constraint.

**2.** A RAG-powered internal wiki assistant returns confident answers referencing pages that were deleted two weeks ago. What's the root cause, and what fixes it?

> [!success]- Answer
> The vector store's index is stale — there's no incremental update or change-detection mechanism syncing deletions/edits from the source wiki into the index. The fix is an ongoing sync pipeline (real-time change detection or a sufficiently frequent scheduled refresh) rather than treating the initial load as a one-time task, per Skill 1.4.5.

**3.** A team wants to upgrade to a newer, higher-quality embedding model for better retrieval accuracy. An engineer proposes updating the embedding call for new documents going forward while leaving existing embeddings untouched, to avoid downtime. Is this safe?

> [!success]- Answer
> No. Embeddings from different models are not comparable within the same similarity space — mixing old and new embeddings in one index produces inconsistent, unreliable similarity scores between old and new content. A full reindex of the existing corpus with the new embedding model is required; there's no safe partial migration.

**4.** A vector store serving a multi-tenant SaaS product returns search results that mix content across unrelated customer domains, hurting relevance even though the vector similarity scores are technically high. What's missing from the retrieval design?

> [!success]- Answer
> Metadata-based pre-filtering. Similarity search alone doesn't respect logical boundaries like tenant/domain — a domain or tenant-ID metadata field, filtered before or alongside the vector search, prevents cross-tenant/cross-domain leakage into results, independent of how semantically similar the raw text happens to be.

**5.** As a document corpus grows into the tens of millions of vectors across several distinct content domains (legal, support, marketing), query latency and relevance both start degrading in a single flat OpenSearch index. What's the architectural fix?

> [!success]- Answer
> Move to a sharding strategy and/or a multi-index architecture — e.g. separate indices per content domain (legal, support, marketing) rather than one large flat index. This bounds query cost to the relevant domain's data and avoids irrelevant-domain content diluting relevance, directly addressing Skill 1.4.3's high-performance vector architecture requirement at scale.

## Related
[README - Syllabus](README - Syllabus.md) · [01 - Bedrock Model Catalog and Integration Patterns](01 - Bedrock Model Catalog and Integration Patterns.md) · [03 - RAG Architecture](03 - RAG Architecture.md) · [11 - Performance and Latency Optimization](11 - Performance and Latency Optimization.md)


## Linked from

- [AWS Certified Generative AI Developer - Professional (AIP-C01)](index.md)
- [AWS Certified Generative AI Developer – Professional (AIP-C01) — Syllabus](README%20-%20Syllabus.md)
- [Bedrock Model Catalog, Selection & Integration Patterns](01%20-%20Bedrock%20Model%20Catalog%20and%20Integration%20Patterns.md)
- [Observability and Monitoring for GenAI Applications](12%20-%20Observability%20and%20Monitoring.md)
- [Performance and Latency Optimization for FM Applications](11%20-%20Performance%20and%20Latency%20Optimization.md)
- [RAG Architecture: Chunking, Retrieval, and Query Handling](03%20-%20RAG%20Architecture.md)
- [Troubleshooting GenAI Applications](14%20-%20Troubleshooting%20GenAI%20Applications.md)
- [Vector Stores and Embeddings](../aip-c01-exam-prep/Lessons/03%20-%20Vector%20Stores%20and%20Embeddings.md)
