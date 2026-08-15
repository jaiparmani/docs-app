---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "1.4"
---

# Vector Stores and Embeddings

<small>10 min read</small>

> **Core idea:** Vector store choice depends more on your existing infrastructure and your metadata/filtering needs than on raw search-speed benchmarks — and a stale vector store isn't a minor inconvenience, it's a correctness bug.

## The concept, explained

A vector store's whole job is to let you find "things similar to this" quickly. But the exam isn't testing whether you know that — it's testing whether you can pick the *right* vector store for a given situation, and whether you understand what actually goes wrong with vector stores in production. Two ideas carry almost all of the weight here.

**First: the right vector store is usually decided by context, not by which one is theoretically fastest.** AWS gives you several real options, and each one is the right answer under a specific condition:

- **Bedrock Knowledge Bases** manages the entire RAG pipeline for you — chunking, embedding generation, storage, and retrieval — with minimal infrastructure to own. This is your default answer whenever a scenario emphasizes "minimize operational overhead."
- **OpenSearch Service** (with its Neural plugin) gives you fine-grained control: custom sharding strategies, hybrid search, multi-index architectures. Reach for this when a scenario needs that level of control at real scale.
- **Aurora with pgvector** lets you add vector search to a database you're already running. If a scenario says "we already operate Aurora and want to minimize new infrastructure," this is the answer — not because it's the fastest vector store, but because it doesn't require the team to learn and secure a whole new system.
- **DynamoDB paired with a vector database** fits when metadata filtering (author, timestamp, domain) matters as much as the similarity search itself.
- **Amazon Kendra** is a different tool entirely — enterprise search across existing document repositories, not a vector index you build and manage yourself.

Notice the pattern: none of these questions get answered by "which one has the best raw search performance." They get answered by "what does this team already operate, and what does this specific query pattern actually need."

**Second: two specific failure modes get tested over and over, and they're both about things that *look* fine but quietly aren't.**

The first is **embedding model lock-in**. Once you've embedded your corpus with a particular model, you can't casually switch to a "better" embedding model later — vectors from two different models don't live in a comparable space. Mixing old and new embeddings in the same index doesn't throw an error; it just quietly produces worse, inconsistent similarity results. The only safe way to change embedding models is a full reindex of everything, not a gradual migration where new documents get the new embeddings and old ones stay as-is.

The second is **staleness**. A vector store built from a wiki, a document repository, or any other *changing* source needs an ongoing sync mechanism — incremental updates, change detection, or at minimum a scheduled refresh. Without one, the vector store slowly drifts out of sync with reality: it keeps confidently answering questions using content that's since been edited or deleted. This isn't a performance problem you'd notice in a dashboard — it's a correctness problem that shows up as the system being *wrong*, which is much worse.

One more thing worth understanding deeply, because it comes up constantly: **metadata isn't bookkeeping, it's a retrieval-quality lever.** Attaching timestamps, authorship, or domain tags to your documents lets you filter *before* or *alongside* the similarity search — which is what prevents, say, a multi-tenant application from returning one customer's data in another customer's search results, even when the content happens to be semantically similar.

## Quick check

> [!question]- A team wants to "upgrade" their embedding model for better retrieval quality by only re-embedding new documents going forward, leaving old embeddings untouched, specifically to avoid downtime. Is this safe?
> Think about what it actually means for two embeddings to be "comparable."

> [!success]- Answer
> No, this is not safe. Embeddings from two different models don't live in the same similarity space — a vector from the old model and a vector from the new model can't be meaningfully compared, even though they're both just numbers that look similar in form. Mixing them in one index produces inconsistent, unreliable similarity scores. There's no safe partial migration here: a full reindex of the existing corpus is required.

## How this plays out in practice

Picture a company that's run Aurora Postgres for years and now wants to add RAG capability. The "obviously best" vector store on paper might be OpenSearch — but the actual right answer here is pgvector on the Aurora instance they already run, because it avoids introducing an entirely new system the team has to learn, monitor, and secure.

Or picture a multi-tenant SaaS product where search results start leaking one customer's data into another customer's results, even though the vector similarity scores look completely reasonable. That's not a vector-quality bug — it's a missing metadata filter. The fix is a tenant-ID field checked before or alongside the similarity search, not a "better" embedding model.

Or picture an internal wiki-backed assistant that confidently answers questions using content from pages that were deleted three weeks ago. That's the staleness problem in its purest form — the fix isn't a smarter model or a better index, it's an actual sync pipeline keeping the vector store current with the source.

## What the exam is actually testing

- **"Which vector store" questions almost always hinge on a detail buried in the scenario** — existing infrastructure, a metadata-filtering need, an operational-overhead constraint. Don't default to "OpenSearch is the most powerful, so it's correct" without checking what the scenario is actually constrained by.
- **Any scenario describing a knowledge base tied to a changing source, with no mention of a sync mechanism, is describing an incomplete (and therefore wrong) design.** Flag the missing piece.
- **An answer choice that says "switch to a better embedding model" without mentioning reindexing is incomplete.** The exam wants you to know that embedding model changes aren't free or instant.

## Practice questions
Write your own answer first — then expand.

**1.** A company already runs Aurora PostgreSQL and wants RAG capability with minimal new infrastructure. What's the best vector store choice, and why?
> [!success]- Answer
> Aurora with the pgvector extension — it reuses infrastructure the team already operates and secures, rather than introducing a new data store to learn and manage, directly satisfying the "minimal new infrastructure" constraint.

**2.** A RAG-powered wiki assistant answers using content from pages deleted two weeks ago. What's the root cause, and the fix?
> [!success]- Answer
> The vector index is stale — there's no incremental update or change-detection mechanism syncing edits and deletions from the source wiki. The fix is an ongoing sync pipeline (real-time change detection, or at least a frequent scheduled refresh), not a one-time load.

**3.** A vector store serving a multi-tenant application returns results mixing content across unrelated tenants, even though the similarity scores look high. What's missing?
> [!success]- Answer
> Metadata-based pre-filtering — a tenant or domain ID attached to each vector, filtered before or alongside the similarity search. Vector similarity alone has no concept of tenant boundaries.

**4.** As a corpus grows to tens of millions of vectors spanning several distinct content domains, both query latency and relevance start degrading in a single flat OpenSearch index. What's the architectural fix?
> [!success]- Answer
> Introduce sharding and/or a multi-index architecture segmented by content domain. This bounds query cost and prevents irrelevant-domain content from diluting relevance, rather than searching one enormous mixed index every time.

**5.** A team upgrades to a better embedding model but only applies it to new documents going forward, to avoid downtime. Is this the right approach?
> [!success]- Answer
> No — this mixes incompatible embedding vintages in the same index, producing unreliable similarity results. A full reindex of the entire existing corpus with the new model is required; there is no safe way to do this partially.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A B2B software company already runs its core product catalog and customer data on Amazon Aurora PostgreSQL. They want to add a RAG-powered documentation assistant, and the engineering lead is worried about introducing too many new systems for a small team to operate. A colleague suggests OpenSearch Service "because it's the most powerful vector search option." What should the team actually do?
A. Use OpenSearch Service regardless of operational cost, since raw search power should always win B. Use Aurora with the pgvector extension, since it reuses infrastructure the team already operates and secures, and the documentation corpus is not large or complex enough to need OpenSearch's advanced sharding/hybrid-search capabilities C. Use Amazon Kendra, since it's designed for internal document search D. Build a custom vector index from scratch on EC2 for full control

> [!success]- Answer
> **B.** With a small team and existing Aurora infrastructure, pgvector directly satisfies "minimize new operational surface" without sacrificing functionality the use case actually needs. OpenSearch's advantages (fine-grained sharding, hybrid search at scale) matter more once you're at a scale or complexity this scenario doesn't describe. (A ignores the stated operational constraint. C is a plausible-sounding distractor — Kendra is enterprise search, a different tool with a different purpose than a RAG vector store. D is unnecessary and high-effort for no described benefit.)

**Scenario 2.** A legal-tech company's contract-review assistant is grounded in a knowledge base of contract templates and precedent documents. Six months after launch, users start noticing the assistant occasionally cites clauses from contract templates that were revised or retired months ago. No one has touched the chunking configuration or the vector store settings since launch. What's actually wrong, and what's the fix?
A. The embedding model has degraded over time and needs retraining B. The knowledge base has no ongoing sync mechanism, so it's serving stale content from its original load — the fix is an incremental update or change-detection pipeline keeping the index current with the actual document repository C. The chunk size was set too large from the start D. The vector store needs to be sharded

> [!success]- Answer
> **B.** This is the staleness failure mode described precisely: content that's since changed at the source is still being served with full confidence, because nothing is keeping the index in sync with reality. Embedding models don't "degrade over time" on their own (A is not a real phenomenon), and neither chunk size (C) nor sharding (D) explains why *specifically outdated* content is being returned — the symptom points directly at a missing sync mechanism.

**Scenario 3.** A multi-tenant HR software platform lets each customer company upload its own internal policy documents into a shared RAG-powered assistant. During testing, Customer A occasionally receives answers referencing Customer B's confidential HR policies, even though the retrieved content is semantically on-topic. The vector index itself appears to be working correctly — similarity scores for the returned results are high. What's the root cause?
A. The embedding model is not good enough at distinguishing between companies B. Missing metadata-based pre-filtering — a tenant/customer ID needs to be attached to every embedded document and used to filter results before or alongside the similarity search, since vector similarity alone has no concept of tenant boundaries C. The chunks are too large and need to be split further D. The system needs a bigger vector store instance

> [!success]- Answer
> **B.** High similarity scores mean the vector search is doing exactly what it's designed to do — find semantically similar content — but it has no inherent concept of "belongs to Customer A only." That has to be enforced explicitly via metadata filtering scoped to the tenant, checked before or alongside the similarity search. (A, C, and D all describe problems that wouldn't produce this specific symptom — high-relevance cross-tenant leakage is a filtering gap, not a model, chunking, or capacity issue.)

## Go deeper
[02 - Vector Stores and Embeddings](../../aws-genai-developer-aip-c01/02 - Vector Stores and Embeddings.md) — the full architecture-reasoning version, with more depth on trade-offs and cost.

## Next
[04 - RAG Retrieval Mechanisms](04 - RAG Retrieval Mechanisms.md)
