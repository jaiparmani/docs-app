---
tags: [aws, certification, ai-practitioner, services]
lesson: 19
exam: AIF-C01
---

# AWS AI Services: Use-Case Matching

<small>2 min read</small>

> On the exam, choose the managed service that directly solves the stated business problem.

| Service | Best-fit use case | Key clue |
|---|---|---|
| Amazon Rekognition | Image/video labels, faces, moderation | “What is in this image?” |
| Amazon Textract | Extract text, forms, tables from scanned documents | OCR plus document structure |
| Amazon Comprehend | NLP: sentiment, entities, key phrases, language | Analyze text rather than generate it |
| Amazon Translate | Machine translation | Translate between languages |
| Amazon Polly | Text-to-speech | Turn written text into speech |
| Amazon Transcribe | Speech-to-text | Convert audio to written text |
| Amazon Lex | Conversational bots with intents | Traditional conversational interface |
| Amazon Personalize | Personalized recommendations | Recommend products/content |
| Amazon Q | Generative AI assistance for business or developers | Workplace knowledge/productivity or coding assistance |
| Amazon SageMaker AI | Build, train, customize, and deploy ML models | More ML lifecycle control |

## High-yield distinctions

| Requirement | Choose |
|---|---|
| Create text or images with FMs | Amazon Bedrock |
| Extract a receipt’s fields/table | Amazon Textract |
| Detect a person or unsafe image content | Amazon Rekognition |
| Determine review sentiment | Amazon Comprehend |
| Build a custom model/training workflow | Amazon SageMaker AI |
| Recommendations personalized to behavior | Amazon Personalize |

## Exam traps

- Textract extracts documents; Rekognition analyzes image/video content.
- Polly is **text → speech**; Transcribe is **speech → text**.
- Comprehend analyzes language; Translate converts languages.
- Bedrock uses FMs for GenAI; SageMaker AI is broader ML tooling and lifecycle support.

## Practice questions

1. A company needs to extract line items and tables from invoices.  
   A. Rekognition  B. Textract  C. Polly  D. Personalize

2. A call-center application must transcribe recordings.  
   A. Transcribe  B. Translate  C. Comprehend  D. Lex

3. An e-commerce site needs individualized product suggestions.  
   A. Amazon Q  B. Bedrock Guardrails  C. Personalize  D. KMS

4. A team needs a managed service for building and training its own ML models.  
   A. SageMaker AI  B. Polly  C. Textract  D. CloudTrail

**Answers:** 1-B, 2-A, 3-C, 4-A.

## Next

[20 - Responsible AI](20 - Responsible AI.md)
