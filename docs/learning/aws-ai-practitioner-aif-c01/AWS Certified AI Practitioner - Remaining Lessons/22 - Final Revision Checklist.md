---
tags: [aws, certification, ai-practitioner, revision]
lesson: 22
exam: AIF-C01
---

# Final Revision Checklist

## Weighted domains

| Domain | Weight | Revision focus |
|---|---:|---|
| AI and ML fundamentals | 20% | Learning types, evaluation, data, neural networks |
| GenAI fundamentals | 24% | FMs, LLMs, tokens, prompting, RAG, tuning |
| Applications of FMs | 28% | Bedrock, service selection, agents, Knowledge Bases, Guardrails |
| Responsible AI | 14% | Bias, safety, transparency, oversight |
| Security, compliance, governance | 14% | IAM, KMS, CloudTrail, shared responsibility |

## Decision shortcuts

| If the question says… | Think… |
|---|---|
| “Create new text, code, or images” | GenAI / Bedrock and a suitable FM |
| “Latest company documents” | RAG / Knowledge Bases |
| “Stable special behavior or style” | Fine-tuning |
| “Multi-step task with APIs” | Bedrock Agents |
| “Unsafe output or sensitive content policy” | Guardrails |
| “Scanned forms/tables” | Textract |
| “Objects/faces/labels in images” | Rekognition |
| “Speech to text” | Transcribe |
| “Text to speech” | Polly |

## Before the exam

- [x] Explain RAG, embeddings, vector stores, and LLM roles.
- [x] Distinguish prompting, RAG, and fine-tuning.
- [x] Match every service in [19 - AWS AI Services](19 - AWS AI Services.md) to its use case.
- [x] Explain Bedrock Knowledge Bases, Agents, and Guardrails.
- [x] Review bias, hallucinations, human oversight, and privacy.
- [x] Review IAM, KMS, CloudTrail, CloudWatch, Config, and shared responsibility.
- [ ] Complete timed practice questions and review every missed distractor.

## Exam approach

1. Identify the business outcome first.
2. Prefer the managed AWS service that directly matches the outcome.
3. Eliminate answers that require unneeded custom model building or retraining.
4. For GenAI, separate **knowledge** (RAG) from **behavior** (fine-tuning) and **safety** (guardrails/oversight).
5. Select all required answers for multiple-response items; there is no penalty for guessing.


## Linked from

- [15-Day Exam Countdown](15-Day%20Exam%20Countdown.md)
- [AWS Certified AI Practitioner — Remaining Lessons](index.md)
- [ML Lifecycle, Inference, and Metrics](33%20-%20ML%20Lifecycle%2C%20Inference%2C%20and%20Metrics.md)
- [Security, Compliance, and Governance for AI Solutions](21%20-%20Security%20Compliance%20and%20Governance.md)
- [Service Selection Drill](32%20-%20Service%20Selection%20Drill.md)
