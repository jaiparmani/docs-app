---
tags: [aws, certification, ai-practitioner, revision]
lesson: 32
exam: AIF-C01
---

# Service Selection Drill

<small>2 min read</small>

> **Core idea:** Start with the business outcome. On the exam, the most direct managed AWS service is usually the right answer.

## Learning objectives

- Recall high-yield service-to-use-case mappings.
- Separate FM applications from prebuilt AI services and custom ML.

## Quick selection table

| Requirement | Best answer |
|---|---|
| GenAI app using foundation models | Amazon Bedrock |
| Custom ML training/deployment | Amazon SageMaker AI |
| Images/video: labels, faces, moderation | Amazon Rekognition |
| Documents: OCR, forms, tables | Amazon Textract |
| Sentiment, entities, key phrases | Amazon Comprehend |
| Translation | Amazon Translate |
| Text → speech | Amazon Polly |
| Speech → text | Amazon Transcribe |
| Intent/slot chatbot | Amazon Lex |
| Personalized recommendations | Amazon Personalize |
| Business/developer GenAI assistant | Amazon Q |

## AWS examples

- A scanned invoice’s line items: **Textract**.
- A customer-review sentiment dashboard: **Comprehend**.
- An internal policy chat application with changing manuals: **Bedrock Knowledge Bases**.

## Exam tips

- Do not choose a general GenAI service when a named prebuilt service exactly solves the use case.
- Do not choose custom training when a managed prebuilt AI service meets the requirement.

## Common traps

| Similar-looking choices | Difference |
|---|---|
| Rekognition vs Textract | Visual content vs document text/structure |
| Polly vs Transcribe | Text → speech vs speech → text |
| Bedrock vs SageMaker AI | Managed FMs vs broader custom ML lifecycle |
| Knowledge Base vs agent | Grounded document Q&A vs multi-step tool actions |

## Interview insight

Managed services accelerate delivery, but selection should still account for data quality, permissions, cost, latency, and the user’s expected experience.

## Quick revision

**Outcome first; direct managed service second; custom build only when necessary.**

## Practice questions

1. Which service extracts tables from scanned invoices?  
   A. Amazon Rekognition  B. Amazon Textract  C. Amazon Comprehend  D. Amazon Lex

2. Which service converts a recorded meeting into text?  
   A. Amazon Polly  B. Amazon Translate  C. Amazon Transcribe  D. Amazon Personalize

3. Which service best fits a foundation-model-powered image-generation application?  
   A. Amazon Bedrock  B. AWS Config  C. Amazon Kendra  D. Amazon CloudTrail

4. Which service is best for a custom trained fraud-prediction model?  
   A. Amazon Q  B. Amazon SageMaker AI  C. Amazon Textract  D. Amazon Polly

## Answers

1. **B**. 2. **C**. 3. **A**. 4. **B**.

## Related notes

[19 - AWS AI Services](19 - AWS AI Services.md) · [25 - Amazon SageMaker AI](25 - Amazon SageMaker AI.md) · [22 - Final Revision Checklist](22 - Final Revision Checklist.md)


## Linked from

- [15-Day Exam Countdown](15-Day%20Exam%20Countdown.md)
- [AWS Certified AI Practitioner — Remaining Lessons](index.md)
- [ML Lifecycle, Inference, and Metrics](33%20-%20ML%20Lifecycle%2C%20Inference%2C%20and%20Metrics.md)
