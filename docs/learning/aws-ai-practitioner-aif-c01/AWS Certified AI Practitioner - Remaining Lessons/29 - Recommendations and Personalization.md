---
tags: [aws, certification, ai-practitioner, personalize]
lesson: 29
exam: AIF-C01
---

# Recommendations and Personalization

> **Core idea:** Amazon Personalize provides personalized recommendations using behavior and interaction data.

## Learning objectives

- Recognize recommendation scenarios.
- Distinguish personalization from text generation, search, and classification.

## Concise explanation

Amazon Personalize is appropriate when an application should recommend products, content, or actions tailored to individual users based on interaction history and other supplied data.

Examples include “customers who viewed this also viewed,” personalized home-page products, and content recommendations.

## AWS example

An online store supplies purchase and click history. Amazon Personalize recommends products each shopper is likely to be interested in.

## Exam tips

- “Recommend,” “personalized,” “user behavior,” and “next best item” are strong Personalize clues.
- Generating a product description is a Bedrock/LLM task, not a recommendation task.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Personalize writes marketing copy.” | It recommends items; an LLM generates copy. |
| “Personalize performs OCR.” | Use Textract for document extraction. |
| “Recommendations always require GenAI.” | Recommendation systems are a separate ML use case. |

## Interview insight

A personalized recommendation needs meaningful interaction data and a clear outcome metric such as clicks, conversion, or retention.

## Quick revision

**Personalize = individualized recommendations from behavior data.**

## Practice questions

1. An e-commerce company wants each visitor to see products based on prior clicks and purchases. Which service fits?  
   A. Amazon Personalize  B. Amazon Polly  C. Amazon Textract  D. AWS KMS

2. Which task is least suited to Amazon Personalize?  
   A. Recommending videos  B. Suggesting products  C. Generating a legal summary  D. Personalizing a home page

## Answers

1. **A**. 2. **C**.

## Related notes

[19 - AWS AI Services](19 - AWS AI Services.md) · [25 - Amazon SageMaker AI](25 - Amazon SageMaker AI.md)
