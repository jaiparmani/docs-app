---
tags: [aws, certification, ai-practitioner, rekognition, textract]
lesson: 27
exam: AIF-C01
---

# Computer Vision and Document Extraction

> **Core idea:** Rekognition analyzes image and video content; Textract extracts text and structured data from documents.

## Learning objectives

- Choose Rekognition versus Textract.
- Recognize image labels, face analysis, moderation, OCR, forms, and tables.

## Concise explanation

| Service | Best-fit task |
|---|---|
| Amazon Rekognition | Labels, objects, faces, image/video moderation and analysis |
| Amazon Textract | Extract printed/handwritten text, forms, fields, and tables from scanned documents |

## AWS example

An insurer uses Textract to pull policy number, customer name, and line items from claim forms. A media platform uses Rekognition to identify unsafe image content for moderation.

## Exam tips

- A receipt, invoice, form, or table is a **Textract** clue.
- Object, face, label, celebrity, or image-moderation clues point to **Rekognition**.

## Common traps

| Trap | Correct answer |
|---|---|
| “Use Rekognition to extract invoice tables.” | Textract is designed for document structure. |
| “Use Textract to detect a weapon in a photo.” | Rekognition analyzes image content. |
| “OCR means image classification.” | OCR extracts text; classification identifies content. |

## Interview insight

The input can be an image in both cases. The deciding factor is the outcome: **document data** (Textract) versus **visual content** (Rekognition).

## Quick revision

**Textract reads documents. Rekognition sees images and video.**

## Practice questions

1. A company needs to extract key-value pairs and tables from loan applications.  
   A. Amazon Textract  B. Amazon Rekognition  C. Amazon Lex  D. Amazon Translate

2. A marketplace needs to detect labels and inappropriate content in uploaded product photos.  
   A. Amazon Comprehend  B. Amazon Rekognition  C. Amazon Polly  D. Amazon KMS

3. Which service is most appropriate for OCR plus form extraction?  
   A. Textract  B. Personalize  C. Bedrock Agents  D. CloudTrail

## Answers

1. **A**. 2. **B**. 3. **A**.

## Related notes

[19 - AWS AI Services](19 - AWS AI Services.md) · [28 - Language, Speech, and Conversational AI Services](28 - Language, Speech, and Conversational AI Services.md)
