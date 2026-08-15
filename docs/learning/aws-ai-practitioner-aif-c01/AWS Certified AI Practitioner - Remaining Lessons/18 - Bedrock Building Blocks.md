---
tags: [aws, certification, ai-practitioner, bedrock, rag, guardrails]
lesson: 18
exam: AIF-C01
---

# Bedrock Building Blocks

<small>2 min read</small>

## Knowledge Bases

**Amazon Bedrock Knowledge Bases** provides managed RAG. It ingests source documents, creates embeddings, stores them in a supported vector store, retrieves relevant chunks, and provides them to an FM.

Use it for changing internal knowledge, grounded answers, and semantic retrieval.

## Guardrails

**Amazon Bedrock Guardrails** helps enforce safety and application policies. It can apply content filters and help protect against undesired topics, harmful content, and exposure of sensitive information according to configured policies.

Guardrails reduce risk; they do **not** guarantee factual correctness or replace authorization controls.

## Prompt management and evaluation

| Capability | Why it matters |
|---|---|
| Prompt management | Version, reuse, and test prompts consistently |
| Model evaluation | Compare model quality for a specific task using appropriate criteria |
| Guardrails | Apply safety controls to inputs and outputs |
| Knowledge Bases | Supply relevant, current context |

## Decision table

| Need                                               | Best capability       |
| -------------------------------------------------- | --------------------- |
| Latest answers from policy documents               | Knowledge Bases / RAG |
| Block unsafe topics or sensitive information       | Guardrails            |
| Reuse a tested instruction across an app           | Prompt management     |
| Compare candidate models for summarization quality | Model evaluation      |

## Exam tips

- Knowledge Bases uses retrieval; it does **not** fine-tune the FM.
- A vector store retrieves relevant vectors; the FM produces the final answer.
- Guardrails complement prompt engineering and human review; they are not a complete security solution.
- Evaluate models against task-relevant criteria such as accuracy, relevance, latency, and cost.

## Practice questions

1. A company needs answers tied to its frequently updated manuals. What should it use?  
   A. Fine-tuning only  B. Bedrock Knowledge Bases  C. Higher temperature  D. Pre-training

2. Which Bedrock capability helps enforce content-safety policies on model interactions?  
   A. Guardrails  B. Tokenization  C. Regression  D. Clustering

3. Which component generates a final natural-language RAG answer?  
   A. Vector store  B. Embedding model  C. Foundation model  D. Document chunker

**Answers:** 1-B, 2-A, 3-C.

## Next

[19 - AWS AI Services](19 - AWS AI Services.md)


## Linked from

- [15-Day Exam Countdown](15-Day%20Exam%20Countdown.md)
- [AI Security and Governance Objectives](37%20-%20AI%20Security%20and%20Governance%20Objectives.md)
- [Amazon Bedrock](17%20-%20Amazon%20Bedrock.md)
- [AWS Certified AI Practitioner — Remaining Lessons](index.md)
- [GenAI Lifecycle, Context Engineering, and Multimodal Models](34%20-%20GenAI%20Lifecycle%2C%20Context%20Engineering%2C%20and%20Multimodal%20Models.md)
- [Responsible AI in Practice](30%20-%20Responsible%20AI%20in%20Practice.md)
