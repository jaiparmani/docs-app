---
tags: [aws, certification, ai-practitioner, bedrock]
lesson: 17
exam: AIF-C01
---

# Amazon Bedrock

> **Core idea:** Amazon Bedrock is a fully managed service for building generative-AI applications with foundation models, without managing the underlying model infrastructure.

## What to know

- Access supported FMs from Amazon and other providers through APIs.
- Use models for inference: text, code, image, and multimodal work, depending on the model.
- Build with prompts, customization options, Knowledge Bases, Agents, Guardrails, and evaluation capabilities.
- Select a model based on capability, quality, latency, context window, cost, and modality.

## Model-selection guide

| Requirement | Consider |
|---|---|
| Creative images | Image-generation FM |
| Chat, summarization, code | Text or multimodal LLM |
| Image understanding plus text answer | Multimodal FM |
| Lowest latency/cost for simple task | Smaller suitable model |
| Long documents | Sufficient context window or RAG |

## AWS examples

- Draft marketing copy with an LLM.
- Generate product images with an image FM.
- Build an internal policy assistant with Knowledge Bases and Guardrails.

## Exam tips

- Bedrock is the default answer for managed access to **foundation models**.
- Calling a model to answer a prompt is **inference**, not pre-training.
- Bedrock reduces operational overhead; it does not remove the need for responsible AI, IAM, and data controls.
- Do not choose SageMaker AI merely to consume a managed FM through an API when Bedrock directly meets the requirement.

## Practice questions

1. Which AWS service provides managed access to multiple foundation models for GenAI applications?  
   A. Amazon Bedrock  B. Amazon EC2  C. AWS Config  D. Amazon Route 53

2. A team needs to choose an FM for image creation. Which selection factor is essential?  
   A. The number of IAM users  B. Whether the model supports image generation  C. S3 storage class  D. VPC CIDR range

**Answers:** 1-A, 2-B.

## Next

[18 - Bedrock Building Blocks](18 - Bedrock Building Blocks.md)
