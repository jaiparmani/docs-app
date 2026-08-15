---
tags: [aws, certification, ai-practitioner, bedrock]
lesson: 23
exam: AIF-C01
---

# Bedrock Inference and Model Selection

> **Core idea:** Inference is using a pretrained foundation model to produce an output. Choose a model by the business task, modality, quality, latency, context window, and cost.

## Learning objectives

- Distinguish inference from pre-training and fine-tuning.
- Choose an Amazon Bedrock model capability that fits a scenario.
- Recognize the cost/latency/quality trade-off.

## Concise explanation

During **inference**, an application sends a prompt to a model and receives generated output. The model has already been pretrained. This is what most Bedrock applications do.

| Requirement | Select a model with |
|---|---|
| Chat, summaries, code | Text or multimodal language capability |
| Create an image | Image-generation capability |
| Answer questions about an image | Image-input/multimodal capability |
| Long documents | A sufficient context window, or use RAG |
| High-volume simple requests | Suitable lower-cost, lower-latency model |

## AWS example

A retailer uses Bedrock to summarize customer reviews. It evaluates two suitable text models using representative reviews, then chooses the one meeting its required quality and latency at acceptable cost.

## Exam tips

- A Bedrock prompt-and-response request is **inference**.
- Model size alone does not make a model best; select for the stated requirement.
- A large context window can help with long input, but RAG is still preferable for large, changing knowledge collections.

## Common traps

| Trap | Correct answer |
|---|---|
| “Inference trains the model.” | Inference uses an already trained model. |
| “Always choose the largest model.” | Choose the smallest suitable model that meets the requirements. |
| “An LLM is the right tool to generate images.” | Use an image-generation FM. |

## Interview insight

Start model selection with a small, representative evaluation set. It is more useful than selecting solely from a model description or parameter count.

## Quick revision

**Inference = invoke a pretrained model.** Choose by task, modality, quality, latency, context size, and cost.

## Practice questions

1. A company sends prompts to a Bedrock model to generate summaries. What is it doing?  
   A. Pre-training  B. Inference  C. Clustering  D. Feature engineering

2. A team needs to create product images from text descriptions. Which capability matters most?  
   A. Image generation  B. Speech recognition  C. OCR  D. Regression

3. Which is the best first criterion for selecting a Bedrock model?  
   A. Number of AWS Regions  B. Business task and supported modality  C. Number of IAM roles  D. VPC address range

## Answers

1. **B** — the pretrained model is being invoked.  
2. **A** — image generation requires an image FM.  
3. **B** — capability must match the outcome first.

## Related notes

[17 - Amazon Bedrock](17 - Amazon Bedrock.md) · [15 - Fine-Tuning](15 - Fine-Tuning.md) · [24 - Bedrock Prompt Management, Evaluation, and Flows](24 - Bedrock Prompt Management, Evaluation, and Flows.md)
