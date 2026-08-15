---
tags: [aws, certification, ai-practitioner, amazon-q]
lesson: 26
exam: AIF-C01
---

# Amazon Q

> **Core idea:** Amazon Q provides generative-AI assistance for business productivity and software development.

## Learning objectives

- Recognize Amazon Q business and developer assistance scenarios.
- Distinguish Amazon Q from building a custom Bedrock application.

## Concise explanation

Amazon Q is a managed generative-AI assistant family. In exam scenarios, look for employee knowledge/productivity support or developer assistance such as help understanding code, generating code, and accelerating software work.

## AWS example

A developer asks an assistant to explain an unfamiliar codebase and suggest a code change. Amazon Q Developer is a strong service match.

## Exam tips

- Choose Amazon Q when the scenario explicitly emphasizes a managed business or developer assistant.
- Choose Bedrock when the company is building its own custom GenAI application and needs direct FM access or Bedrock building blocks.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Amazon Q is a general vector database.” | It is a GenAI assistant offering. |
| “Amazon Q replaces every custom Bedrock application.” | Bedrock offers lower-level building blocks for custom solutions. |
| “Amazon Q is for OCR.” | Use Textract for structured document extraction. |

## Interview insight

Prefer a managed assistant when the business need matches it; build custom only when unique workflow, integration, or control needs justify it.

## Quick revision

**Amazon Q = managed GenAI assistance for business users and developers.**

## Practice questions

1. A company wants a managed assistant to help engineers understand, generate, and improve code. Which service is best?  
   A. Amazon Q Developer  B. Amazon Textract  C. Amazon Polly  D. Amazon Rekognition

2. Which requirement points most directly to Amazon Bedrock rather than Amazon Q?  
   A. A custom GenAI application using a chosen FM and tailored RAG pipeline  B. Developer coding assistance  C. Business productivity assistant  D. Code explanation in an IDE

## Answers

1. **A**. 2. **A**.

## Related notes

[17 - Amazon Bedrock](17 - Amazon Bedrock.md) · [19 - AWS AI Services](19 - AWS AI Services.md)
