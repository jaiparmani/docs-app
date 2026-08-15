---
tags: [aws, certification, ai-practitioner, comprehend, translate, polly, transcribe, lex]
lesson: 28
exam: AIF-C01
---

# Language, Speech, and Conversational AI Services

<small>2 min read</small>

> **Core idea:** Match the direction and language task precisely: analyze text, translate it, convert text to speech, convert speech to text, or build an intent-based bot.

## Learning objectives

- Match Comprehend, Translate, Polly, Transcribe, and Lex to a use case.
- Avoid the most common direction-based distractors.

## Concise explanation

| Service | What it does | Exam clue |
|---|---|---|
| Amazon Comprehend | NLP analysis: sentiment, entities, key phrases, language | “Analyze reviews” |
| Amazon Translate | Machine translation | “Convert English to Spanish” |
| Amazon Polly | Text to lifelike speech | “Read text aloud” |
| Amazon Transcribe | Speech to text | “Transcribe calls” |
| Amazon Lex | Intent-based conversational bots | “Build a chatbot with intents/slots” |

## AWS example

A contact center transcribes a call using Transcribe, analyzes sentiment using Comprehend, and sends a translated follow-up using Translate.

## Exam tips

- **Polly = text → speech; Transcribe = speech → text.**
- Comprehend analyzes a language artifact; it does not generate a new translation.
- Lex is suited to traditional conversational flows with intents, slots, and fulfillment.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Use Polly to turn audio into text.” | Use Transcribe. |
| “Use Translate for review sentiment.” | Use Comprehend. |
| “Use an LLM whenever an intent bot is needed.” | Lex can directly meet intent/slot bot requirements. |

## Interview insight

Multi-service pipelines are normal. Keep each managed service focused on its strength rather than asking one model to do every job.

## Quick revision

**Comprehend analyzes; Translate translates; Polly speaks; Transcribe listens; Lex chats by intents.**

## Practice questions

1. A company wants to determine whether customer reviews are positive or negative.  
   A. Amazon Comprehend  B. Amazon Translate  C. Amazon Polly  D. Amazon Textract

2. A mobile app must read a written article aloud.  
   A. Amazon Transcribe  B. Amazon Polly  C. Amazon Lex  D. Amazon Personalize

3. A call center must create written transcripts from call recordings.  
   A. Amazon Translate  B. Amazon Comprehend  C. Amazon Transcribe  D. Amazon Rekognition

4. A business needs a bot that gathers a flight number and date as conversational inputs.  
   A. Amazon Lex  B. Amazon KMS  C. Amazon Textract  D. Amazon Personalize

## Answers

1. **A**. 2. **B**. 3. **C**. 4. **A**.

## Related notes

[19 - AWS AI Services](19 - AWS AI Services.md) · [27 - Computer Vision and Document Extraction](27 - Computer Vision and Document Extraction.md)
