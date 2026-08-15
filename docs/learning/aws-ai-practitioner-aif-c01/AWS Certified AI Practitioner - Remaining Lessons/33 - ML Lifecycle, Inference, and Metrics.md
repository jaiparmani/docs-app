---
tags: [aws, certification, ai-practitioner, ml, metrics]
lesson: 33
exam: AIF-C01
---

# ML Lifecycle, Inference, and Metrics

> **Core idea:** A useful AI solution moves through data, experimentation, training, evaluation, deployment, monitoring, and improvement. Model metrics and business metrics answer different questions.

## Learning objectives

- Distinguish batch, real-time, asynchronous, and serverless inference.
- Describe the high-level AI/ML lifecycle and MLOps.
- Interpret accuracy, precision, recall, F1, and business metrics.

## The lifecycle

1. Define the business problem and success metric.
2. Gather, prepare, label, and govern data.
3. Train or select a model.
4. Evaluate technical quality and business value.
5. Deploy for inference.
6. Monitor quality, drift, cost, latency, and feedback.
7. Improve or retrain when justified.

**MLOps** means making this lifecycle repeatable, scalable, observable, and safe to operate.

## Inference types

| Type | Best use case |
|---|---|
| Real-time | Immediate response: fraud check or interactive prediction |
| Batch | Large scheduled workload: score all customers overnight |
| Asynchronous | Long-running request where the caller need not wait |
| Serverless | Variable/low operational-overhead inference workloads |

## Metrics

| Metric | Meaning | Useful when |
|---|---|---|
| Accuracy | Overall proportion correct | Classes are reasonably balanced |
| Precision | Of predicted positives, how many were truly positive? | False positives are costly |
| Recall | Of actual positives, how many were found? | Missing a positive is costly |
| F1 | Balance of precision and recall | Both error types matter |

Business metrics include task-completion rate, customer satisfaction, conversion, ROI, cost per interaction, and latency.

## AWS example

A bank uses a real-time prediction for a card transaction. It measures recall because missing fraud is expensive, while also monitoring precision so legitimate transactions are not blocked unnecessarily.

## Exam tips

- A model can have high accuracy but be poor for a rare-event problem such as fraud; examine precision and recall.
- Batch is not “slower real-time”; it is a different delivery pattern for large, scheduled work.
- A technically accurate model can still fail if its cost, latency, or user outcomes do not meet business needs.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Precision measures all real fraud found.” | That is recall. |
| “Recall measures whether predicted positives are correct.” | That is precision. |
| “Deployment completes ML work.” | Monitoring and improvement are part of the lifecycle. |

## Interview insight

Start with the cost of errors. It tells you whether false positives, false negatives, or both matter most.

## Quick revision

**Precision: predicted positive correctness. Recall: actual positives found. F1: balance.**

## Practice questions

1. A model should identify as many fraudulent transactions as possible. Which metric is especially important?  
   A. Recall  B. Context window  C. Top-K  D. Throughput

2. A company scores millions of records every night. Which inference type fits best?  
   A. Batch inference  B. Real-time inference  C. Prompt engineering  D. Fine-tuning

3. Which activity is an MLOps concern after deployment?  
   A. Monitoring model quality and retraining when needed  B. Removing all logs  C. Increasing token count automatically  D. Replacing IAM with Guardrails

## Answers

1. **A**. 2. **A**. 3. **A**.

## Related notes

[25 - Amazon SageMaker AI](25 - Amazon SageMaker AI.md) · [32 - Service Selection Drill](32 - Service Selection Drill.md) · [22 - Final Revision Checklist](22 - Final Revision Checklist.md)
