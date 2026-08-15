---
tags: [aws, certification, ai-practitioner, fine-tuning, evaluation]
lesson: 36
exam: AIF-C01
---

# FM Customization and Evaluation

<small>2 min read</small>

> **Core idea:** Choose the least costly technique that satisfies the need, then evaluate it against both task quality and business outcomes.

## Learning objectives

- Differentiate in-context learning, RAG, fine-tuning, continued pre-training, and distillation.
- Recognize high-level fine-tuning data requirements.
- Match evaluation approaches and metrics to a task.

## Customization choices

| Technique | Changes weights? | Best use |
|---|---:|---|
| In-context learning / few-shot prompting | No | Teach a pattern in one request |
| RAG | No | Supply current, grounded knowledge |
| Fine-tuning / instruction tuning | Yes | Stable style, task, or behavior |
| Continued pre-training | Yes | Adapt broad knowledge to a domain corpus |
| Distillation | Yes | Transfer capability into a smaller, more efficient model |

Fine-tuning data should be curated, governed, representative, appropriately sized, and labeled when required. **RLHF** uses human feedback to help align model behavior with preferences.

## Evaluation

| Evaluation approach | Use |
|---|---|
| Human review | Nuance, safety, usefulness, and high-stakes decisions |
| Benchmark/test set | Repeatable comparison against known examples |
| Bedrock Model Evaluation | Managed support for model comparison/evaluation |
| LLM-as-a-judge | Scalable comparative assessment with careful validation |

For generated text, examples of task metrics include **ROUGE**, **BLEU**, and **BERTScore**. Also measure task completion, user satisfaction, latency, and cost per interaction.

## AWS example

A company compares candidate Bedrock models using a held-out set of support requests, human reviewers, task-completion rate, latency, and cost. It uses RAG for current policies and fine-tuning only if a stable response format remains unreliable.

## Exam tips

- Use RAG for changing facts; use fine-tuning for stable behavior/patterns.
- Human evaluation remains valuable where automated metrics miss safety or practical usefulness.
- A better technical score is not enough if it harms latency, cost, or user experience.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Fine-tuning is always best for domain knowledge.” | RAG is typically best for current, changing facts. |
| “An automated score proves production quality.” | Combine metrics with human and business evaluation. |
| “Distillation retrieves documents.” | It is a model-compression/knowledge-transfer approach. |

## Interview insight

Keep a held-out evaluation set. Do not judge an application only on the same examples used to develop prompts or train a model.

## Quick revision

**RAG = current knowledge. Fine-tuning = stable behavior. Evaluation = quality + safety + latency + cost + business value.**

## Practice questions

1. A team wants a smaller model that retains much of a larger model’s capability for lower-cost inference. Which technique fits?  
   A. Distillation  B. RAG  C. Chunking  D. CloudTrail

2. Which approach is strongest for assessing whether an FM support assistant meets business needs?  
   A. Task quality, human feedback, task completion, latency, and cost  B. Parameter count only  C. Temperature only  D. Number of PDFs only

3. What is a key preparation step for fine-tuning data?  
   A. Curate representative, governed training examples  B. Store all data in the model context window  C. Disable labels permanently  D. Increase top-P

## Answers

1. **A**. 2. **A**. 3. **A**.

## Related notes

[15 - Fine-Tuning](15 - Fine-Tuning.md) · [24 - Bedrock Prompt Management, Evaluation, and Flows](24 - Bedrock Prompt Management, Evaluation, and Flows.md) · [34 - GenAI Lifecycle, Context Engineering, and Multimodal Models](34 - GenAI Lifecycle, Context Engineering, and Multimodal Models.md)
