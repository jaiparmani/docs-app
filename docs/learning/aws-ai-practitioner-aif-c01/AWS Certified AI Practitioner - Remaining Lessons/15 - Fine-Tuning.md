---
tags:
  - aws
  - certification
  - ai-practitioner
  - genai
lesson: 15
exam: AIF-C01
status: pending-review
---

# Fine-Tuning

<small>4 min read</small>

> **Exam importance:** High  
> **Core idea:** Fine-tuning adapts an existing foundation model to a specific task, domain, tone, or output pattern by training it further on curated examples.

## Key concepts

### What fine-tuning does

Fine-tuning starts with a pretrained foundation model (FM) and performs additional training using task- or domain-specific data. The process adjusts the model's learned parameters so its default behavior better fits the desired use case.

It is **not** training a model from scratch.

### When fine-tuning is useful

- The application needs a consistent tone, style, or output format.
- A model must learn specialized patterns from a stable domain dataset.
- Good prompt engineering alone does not produce reliable, repeatable results.
- The organization has many high-quality input/output examples.

Examples:

- Generate support replies in the company's approved voice.
- Convert clinical notes into a fixed, domain-specific format.
- Classify documents using organization-specific categories.

### What fine-tuning is not best for

Fine-tuning is usually not the first choice for frequently changing facts, policies, manuals, or product data. For current external knowledge, use RAG so the application can retrieve the latest documents at runtime.

## Fine-tuning vs RAG

| Need                                           | Best choice        | Why                                                  |
| ---------------------------------------------- | ------------------ | ---------------------------------------------------- |
| Current HR policy or product information       | RAG                | Update the documents; no model retraining is needed. |
| A consistent brand voice                       | Fine-tuning        | It changes the model's learned response behavior.    |
| Answers grounded in company documents          | RAG                | Retrieved context supports the answer.               |
| Specialized output format across many requests | Fine-tuning        | Examples teach a stable pattern.                     |
| Improve one prompt for a simple task           | Prompt engineering | Fastest and lowest-effort first step.                |

### Decision rule

> **Changing knowledge → RAG. Stable behavior, style, or task pattern → fine-tuning.**

## AWS example

A company uses Amazon Bedrock to produce insurance-claim summaries. It has thousands of approved examples written in a required internal format.

1. Curate representative input/output training examples.
2. Customize a supported Bedrock foundation model using those examples.
3. Invoke the customized model for new claim summaries.

If policy details change weekly, pair the solution with RAG rather than repeatedly fine-tuning solely to refresh facts.

## Exam tips

- Fine-tuning **adapts** an existing pretrained FM; it does not create a new FM from scratch.
- It changes model behavior through additional training; prompting does not permanently change model parameters.
- It can improve domain-specific consistency, but it does **not** guarantee factual accuracy or eliminate hallucinations.
- RAG supplies fresh information at inference time; fine-tuning changes the model using training data.
- Start with prompt engineering, then consider RAG or fine-tuning based on the actual gap.

## Common traps

| Misconception | Correct understanding |
|---|---|
| "Fine-tune every time a policy changes." | Use RAG for changing knowledge. |
| "Fine-tuning eliminates hallucinations." | It may improve behavior, but hallucinations can still occur. |
| "Few-shot prompting fine-tunes the model." | Examples in a prompt affect only that request's context. |
| "Fine-tuning is the same as pre-training." | Fine-tuning is additional, targeted training of a pretrained model. |

## Memory table

| Technique          |     Changes model weights? | Uses current external documents? | Best for                                         |
| ------------------ | -------------------------: | -------------------------------: | ------------------------------------------------ |
| Prompt engineering |                         No |                         Optional | Clear instructions and immediate improvements    |
| RAG                |                         No |                              Yes | Current, grounded knowledge                      |
| Fine-tuning        |                        Yes |                    Not by itself | Stable behavior, style, and specialized patterns |
| Pre-training       | Yes, from scratch at scale |                  Training corpus | Building a foundation model                      |

## Practice questions

### Q1

A company needs its chatbot to answer using the latest employee-benefits policy, which changes monthly. What is the best approach?

A. Fine-tune the model after every policy update  
B. Increase temperature  
C. Use RAG with the policy documents  
D. Train a foundation model from scratch

### Q2

What is the main purpose of fine-tuning a foundation model?

A. To adapt it to a particular domain, task, style, or behavior  
B. To store PDFs for semantic search  
C. To increase its context window  
D. To prevent all hallucinations

### Q3

Which statement correctly compares few-shot prompting and fine-tuning?

A. Both permanently update model parameters.  
B. Few-shot prompting supplies examples in the request; fine-tuning trains the model further.  
C. Fine-tuning is used only to retrieve documents.  
D. Few-shot prompting requires a vector database.

### Q4 — Revision: Hallucinations

For a high-stakes assistant that answers from internal documentation, which combination is strongest?

A. High temperature and no human review  
B. Fine-tuning only  
C. RAG, a grounded prompt, appropriate guardrails, and human review when needed  
D. A longer response limit

## Answers

1. **C** — RAG retrieves the latest policy without retraining.  
2. **A** — Fine-tuning adapts an existing model for a focused purpose.  
3. **B** — Prompt examples are temporary; fine-tuning alters behavior through training.  
4. **C** — These measures reduce risk; none alone guarantees perfect accuracy.

## Next lesson

[AI Agents](16 - AI Agents.md) — how models reason through a task, select tools, and take multi-step actions.
