---
tags: [aws, certification, ai-practitioner, sagemaker]
lesson: 25
exam: AIF-C01
---

# Amazon SageMaker AI

<small>2 min read</small>

> **Core idea:** Amazon SageMaker AI supports the broader machine-learning lifecycle: prepare data, build/train/customize models, deploy them, and operate them.

## Learning objectives

- Describe SageMaker AI at a high level.
- Distinguish SageMaker AI from Amazon Bedrock.
- Select the managed service that best fits a scenario.

## Concise explanation

Use **Amazon Bedrock** when you want managed access to foundation models for GenAI applications. Use **Amazon SageMaker AI** when you need more control over the ML lifecycle or need to build, train, tune, deploy, and monitor custom ML models.

| Requirement | Better fit |
|---|---|
| Invoke a managed FM for a chatbot | Amazon Bedrock |
| Train and deploy a custom churn model | SageMaker AI |
| End-to-end ML data/training/deployment workflow | SageMaker AI |
| RAG application over company documents | Bedrock Knowledge Bases |

## AWS example

A bank trains a supervised model to predict loan default from its historical labeled data. It uses SageMaker AI for data preparation, training, model tuning, deployment, and monitoring.

## Exam tips

- Bedrock is not the answer when the requirement is to train a custom traditional ML model.
- SageMaker AI is broader ML tooling; Bedrock is specialized managed FM access and GenAI building blocks.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Bedrock is the best service to train any custom model.” | Use SageMaker AI for custom ML training/lifecycle needs. |
| “SageMaker AI is only for notebooks.” | It supports a full ML lifecycle. |
| “Managed services remove data and governance responsibility.” | Customers retain responsibility for data, access, and configuration. |

## Interview insight

The right question is not “which is more powerful?” It is “do we need managed FM inference, or custom-model lifecycle control?”

## Quick revision

**Bedrock: use foundation models. SageMaker AI: build, train, deploy, and operate ML.**

## Practice questions

1. A company must build and train a custom model to predict equipment failures. Which service fits?  
   A. Amazon Polly  B. Amazon SageMaker AI  C. Amazon Bedrock Guardrails  D. Amazon Translate

2. A team wants managed API access to an LLM without managing model infrastructure. Which service fits?  
   A. Amazon Bedrock  B. AWS Config  C. Amazon Textract  D. Amazon EC2 Auto Scaling

3. What is a central SageMaker AI use case?  
   A. Speech synthesis only  B. Custom ML lifecycle work  C. Image moderation only  D. Key management

## Answers

1. **B**. 2. **A**. 3. **B**.

## Related notes

[17 - Amazon Bedrock](17 - Amazon Bedrock.md) · [19 - AWS AI Services](19 - AWS AI Services.md) · [21 - Security Compliance and Governance](21 - Security Compliance and Governance.md)
