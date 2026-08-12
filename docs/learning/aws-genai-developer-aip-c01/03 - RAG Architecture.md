---
tags: [aws, certification, genai-developer-professional, rag]
exam: AIP-C01
domain: "1 — Foundation Model Integration, Data Management, and Compliance"
tasks: [1.5]
---

# RAG Architecture: Chunking, Retrieval, and Query Handling

## Core concept
[02 - Vector Stores and Embeddings](02 - Vector Stores and Embeddings.md) covered *where* vectors live. This note covers what happens *around* the vector store: how documents get chunked before embedding, how a raw user query gets transformed before it hits the index, how results get reranked after retrieval, and how all of that gets exposed to the FM in a consistent way. RAG quality is decided far more by these surrounding decisions than by the vector store's raw search speed — a poorly-chunked corpus or an unprocessed query will produce bad retrieval regardless of how good the underlying index is.

The production framing: naive RAG (chunk fixed-size, embed, retrieve top-K, stuff into prompt) is the baseline every real system has to improve on. The exam's Task 1.5 skills are essentially "here's what improving it actually looks like" — chunking strategy, embedding selection, hybrid search, reranking, query transformation, and standardized retrieval interfaces.

## Service comparison
| Need | Choice | Why |
|---|---|---|
| Standard document chunking without custom logic | **Bedrock Knowledge Bases built-in chunking** | Handles fixed-size and some structural chunking out of the box, lowest effort |
| Custom fixed-size or overlap-aware chunking | **Lambda functions** implementing the chunking logic | Needed when default chunking splits mid-sentence/mid-table in ways that hurt retrieval |
| Chunking that respects document structure (headers, sections) | **Custom processing for hierarchical chunking** | Preserves semantic boundaries (a section stays together) rather than blind fixed-size splitting — meaningfully improves retrieval for structured documents (contracts, technical docs) |
| Pure semantic similarity search | **OpenSearch vector search, Aurora pgvector** | Fine when queries and documents share vocabulary/phrasing |
| Combining keyword precision with semantic recall | **Hybrid search** (OpenSearch keyword + vector combined) | Catches exact-term matches (product codes, names) that pure semantic search can miss, while retaining semantic matching for paraphrased queries |
| Improving relevance ordering after initial retrieval | **Bedrock reranker models** | A second-pass, more expensive but more accurate relevance scoring over a small candidate set — the same two-stage "cheap broad retrieval, then precise reranking" pattern you'd recognize from any large-scale search system |
| Vague, underspecified, or multi-part user queries | **Query expansion / decomposition / transformation** (Bedrock for expansion, Lambda for decomposition, Step Functions for transformation pipelines) | A raw user query is often a poor direct search query — rewriting it improves what actually gets retrieved |
| Standardized way for an FM/agent to issue retrieval queries | **Function calling interfaces, MCP clients for vector queries** | Gives the model a consistent, structured way to request retrieval rather than ad hoc prompt-embedded instructions |

## Trade-offs & failure modes
- **Chunk size is a precision-vs-context trade.** Small chunks retrieve precisely but may lack surrounding context the FM needs to answer correctly; large chunks preserve context but dilute the embedding's specificity and waste context-window tokens on irrelevant surrounding text. Hierarchical chunking (respecting document structure) is often the better answer than tuning a single fixed chunk size, because it lets chunk boundaries follow the content's actual logical divisions.
- **Hybrid search exists because pure semantic search has a specific, predictable failure mode**: exact-match terms (SKUs, error codes, proper nouns) can be semantically "close" to many things and get lost among more common phrasing. A scenario describing search failures specifically on codes/IDs/exact terminology is pointing at hybrid search, not a bigger embedding model.
- **Reranking is a two-stage retrieval pattern, not a replacement for good initial retrieval.** Retrieve a broader candidate set cheaply (vector similarity), then rerank a small candidate set with a more expensive, more accurate model — this bounds the expensive step's cost while improving final relevance, the same shape as retrieval-then-ranking patterns elsewhere in this exam (agent tool selection, model routing).
- **Query transformation matters because user queries and document phrasing diverge.** A user asking "why did my order not arrive" and a knowledge base document titled "Shipping Delay Troubleshooting Guide" may not be close enough in raw embedding space — query expansion/rewriting closes that gap before retrieval runs, not after.
- **Standardized retrieval interfaces (function calling, MCP) matter for agentic RAG specifically** — when an agent decides *whether and how* to retrieve rather than retrieval being a fixed pipeline step, the model needs a consistent, structured way to issue that request. This is the RAG-to-agent bridge, directly connecting to [05 - Agentic AI and Tool Use](05 - Agentic AI and Tool Use.md).

## Security & cost considerations
- Reranking adds a real per-query cost (a second model invocation over the candidate set) — justified when relevance quality is a stated priority, wasteful for low-stakes/high-volume queries where the initial retrieval is already good enough.
- Query decomposition/expansion via an FM call adds latency and cost to every query *before* the actual retrieval happens — worth naming as a trade-off when a scenario emphasizes low-latency requirements alongside a need for better query understanding.
- Chunking strategy affects index size and therefore storage/query cost, not just retrieval quality — very small chunks multiply the number of vectors stored and searched.

## Troubleshooting signals
| Symptom | Likely cause | Fix direction |
|---|---|---|
| Retrieval misses documents containing exact product codes/error IDs the user typed verbatim | Pure semantic search, no keyword component | Add hybrid search (keyword + vector) |
| Retrieved chunks are relevant but the FM's answer lacks needed context | Chunks too small / boundaries don't align with document structure | Move to hierarchical/structure-aware chunking, or increase chunk size with overlap |
| Retrieval quality is inconsistent for vague or multi-intent user queries | No query transformation step | Add query expansion/decomposition before retrieval |
| Top-K retrieved results are topically related but not the *most* relevant among them | No reranking step | Add a reranker over the initial candidate set |
| An agent's retrieval calls are ad hoc and inconsistent across different tools/skills | No standardized retrieval interface | Introduce function calling / MCP client pattern for retrieval requests |

## Exam traps & decision rules
- **Trap: "the fix for bad retrieval is always a bigger/better embedding model."** Decision rule: diagnose first — exact-term misses point to hybrid search, missing context points to chunking strategy, relevance-ordering issues point to reranking, vague-query issues point to query transformation. Embedding model quality is one lever among several, not the default fix.
- **Trap: treating chunking as a fixed, one-time configuration.** Decision rule: chunking strategy should match document structure and be revisited when retrieval quality issues correlate with document type (long structured docs vs. short unstructured notes behave differently under the same fixed-size chunking).
- **Trap: reranking as a universal "just add it" improvement.** Decision rule: reranking adds latency and cost per query — recommend it when the scenario explicitly prioritizes relevance/accuracy over latency/cost, not as a blanket best practice.
- **Trap: assuming a single retrieval pipeline serves both a simple chatbot and an autonomous agent equally well.** Decision rule: agent-driven RAG (where the model decides when/how to retrieve) needs a structured tool-calling interface into retrieval, not the same fixed "always retrieve top-K then generate" pipeline a simple RAG chatbot uses.

## Rapid recall
- Chunking: fixed-size (simple) vs. hierarchical/structure-aware (better context preservation) — Lambda for custom logic, Bedrock KB for built-in.
- Hybrid search fixes exact-term misses that pure semantic search causes.
- Reranking = second-pass precision over a cheap first-pass candidate set; costs more per query.
- Query transformation (expansion/decomposition) closes the gap between raw user phrasing and document phrasing, run *before* retrieval.
- Function calling / MCP = the standardized interface an agent uses to issue retrieval requests, not just an implementation detail.
- Diagnose retrieval failures by *symptom type* before reaching for a fix — different symptoms point to different levers.

## Practice questions
Write your own answer first — then expand.

**1.** Users searching a support knowledge base for a specific error code (e.g. "ERR-4471") consistently get irrelevant results, even though semantically related support articles clearly exist in the index. What's the fix?

> [!success]- Answer
> Add hybrid search — combine keyword matching with vector similarity. Exact identifiers like error codes are a known weak point for pure semantic search, since the embedding space may place the code "close" to many unrelated but topically similar terms rather than prioritizing the literal exact match a keyword search would catch immediately.

**2.** A legal-document RAG system retrieves technically relevant chunks, but the FM's answers frequently misinterpret clauses because retrieved chunks cut off mid-section, losing surrounding context. What chunking change addresses this?

> [!success]- Answer
> Move from fixed-size chunking to hierarchical, structure-aware chunking that respects the document's actual sections/headers — so a clause and its surrounding context stay together as one chunk rather than being split at an arbitrary character count, preserving the context the FM needs to interpret it correctly.

**3.** A retrieval pipeline returns 20 topically-relevant candidate chunks for a query, but the single most relevant chunk often isn't ranked first, hurting the FM's final answer quality. The team wants better ordering without re-architecting retrieval entirely. What's the targeted fix?

> [!success]- Answer
> Add a reranking step: run a more accurate (but more expensive) reranker model over the already-retrieved candidate set to reorder by true relevance, rather than trusting the initial vector similarity ranking alone. This is a second-pass precision fix layered on top of existing retrieval, not a replacement for it.

**4.** A user query like "it's broken again, same as last time" retrieves poor results because it lacks the specific terminology present in the knowledge base. What retrieval-pipeline addition helps here, and where in the pipeline does it run?

> [!success]- Answer
> Query expansion/transformation, run *before* the retrieval step — rewriting or expanding the vague query into a more search-friendly form (potentially using conversation history for context) so it better matches the vocabulary and phrasing of the underlying documents, rather than searching with the raw ambiguous phrase directly.

**5.** An autonomous agent needs to decide, mid-conversation, whether to retrieve additional context from a knowledge base before answering. What kind of interface should expose retrieval to the agent, and why isn't a fixed "always retrieve top-K first" pipeline sufficient here?

> [!success]- Answer
> A standardized function-calling / MCP client interface for retrieval, so the agent can issue a structured retrieval request only when it determines it's needed, with control over the query itself. A fixed always-retrieve pipeline assumes retrieval is unconditionally useful on every turn, which wastes latency/cost on turns where the agent already has enough context, and doesn't give the agent the ability to reformulate its own retrieval query based on its reasoning so far.

## Related
[README - Syllabus](README - Syllabus.md) · [02 - Vector Stores and Embeddings](02 - Vector Stores and Embeddings.md) · [04 - Prompt Engineering and Governance](04 - Prompt Engineering and Governance.md) · [05 - Agentic AI and Tool Use](05 - Agentic AI and Tool Use.md) · [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md)
