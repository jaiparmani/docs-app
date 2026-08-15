---
tags: [aws, certification, ai-practitioner, bedrock]
lesson: 24
exam: AIF-C01
---

# Bedrock Prompt Management, Evaluation, and Flows

> **Core idea:** Production GenAI needs reusable, tested prompts; task-specific model evaluation; and clear orchestration of multi-step workflows.

## Learning objectives

- Explain why prompts should be versioned and tested.
- Identify what model evaluation measures.
- Recognize when a flow or agent is useful.

## Concise explanation

**Prompt management** helps teams create, version, reuse, and test prompt templates. **Model evaluation** compares candidate models or configurations using representative tasks and criteria such as correctness, relevance, safety, latency, and cost. **Bedrock Flows** provide a visual/managed way to connect steps in an AI workflow.

| Need | Best fit |
|---|---|
| Reuse a tested instruction in several apps | Prompt management |
| Compare summary quality across candidate models | Model evaluation |
| Connect a defined sequence of steps | Flow |
| Let the model choose tools and actions dynamically | [16 - AI Agents](16 - AI Agents.md) |

## AWS example

A support team versions one prompt template for its chat application, evaluates two models against approved answers, then uses a flow to retrieve data, invoke the model, and format the response.

## Exam tips

- Evaluation is not only “which model is smartest”; cost, latency, safety, and task quality matter.
- A deterministic workflow is a good fit for a flow; tool-choosing, goal-driven work is an agent use case.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Prompt management fine-tunes a model.” | It manages instructions, not model weights. |
| “One benchmark score selects a model for every task.” | Evaluate using the actual workload and success criteria. |
| “A flow and an agent are identical.” | Flows orchestrate defined paths; agents can reason and select actions. |

## Interview insight

Treat prompts as application assets: test them with representative inputs and maintain versions so changes are reviewable and reversible.

## Quick revision

**Prompt management = reuse/version prompts. Evaluation = compare fit. Flow = orchestrated steps. Agent = dynamic tool use.**

## Practice questions

1. A team wants to compare two FMs for factual answer quality, latency, and cost. What should it use?  
   A. Model evaluation  B. Tokenization  C. KMS  D. Clustering

2. Which capability best supports consistent reuse of a reviewed prompt template?  
   A. Fine-tuning  B. Prompt management  C. Rekognition  D. Amazon S3 lifecycle rules

3. A workflow has a fixed retrieve → generate → format sequence. What is the best high-level fit?  
   A. A flow  B. A vector only  C. Pre-training  D. A larger context window

## Answers

1. **A**. 2. **B**. 3. **A**.

## Related notes

[17 - Amazon Bedrock](17 - Amazon Bedrock.md) · [16 - AI Agents](16 - AI Agents.md) · [23 - Bedrock Inference and Model Selection](23 - Bedrock Inference and Model Selection.md)
