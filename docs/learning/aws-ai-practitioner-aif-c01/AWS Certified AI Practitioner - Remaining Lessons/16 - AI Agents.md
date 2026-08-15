---
tags: [aws, certification, ai-practitioner, genai, agents]
lesson: 16
exam: AIF-C01
---

# AI Agents

<small>2 min read</small>

> **Core idea:** An agent uses a foundation model to reason about a goal, choose actions or tools, and complete a multi-step task.

## Key concepts

An LLM answers a prompt. An **agent** can also decide what information it needs, invoke an approved tool or API, use the result, and continue toward the objective.

| Component | Purpose |
|---|---|
| Foundation model | Understands the request and decides the next step |
| Instructions | Define the agent’s role and boundaries |
| Action groups/tools | Allow approved API or function calls |
| Knowledge base | Supplies grounded company information when needed |
| Orchestration | Plans and sequences actions |

## AWS example

**Amazon Bedrock Agents** can coordinate an FM with knowledge bases and action groups. A travel-support agent could retrieve a policy, check a booking by calling an API, then propose permitted options.

## Exam tips

- Choose an agent when the task requires **multi-step reasoning and tool use**, not merely text generation.
- Agents must have scoped permissions for the actions they can perform.
- A knowledge base answers from documents; an agent can use a knowledge base **and** take actions.
- Human approval is appropriate before sensitive or irreversible actions.

## Memory table

| Requirement | Best fit |
|---|---|
| Answer questions from company PDFs | RAG / Knowledge Base |
| Generate a single summary | LLM prompt |
| Retrieve policy, check order status, then create a return | Agent |

## Practice questions

1. A support assistant must look up an order and create a return request through an API. Which approach fits best?  
   A. Vector database only  B. Agent with approved action groups  C. Image model  D. Tokenizer

2. What distinguishes an AI agent from a basic text-generation use case?  
   A. It cannot use an LLM  B. It only stores embeddings  C. It can plan and use tools to complete multi-step tasks  D. It must be fine-tuned

**Answers:** 1-B, 2-C.

## Next

[17 - Amazon Bedrock](17 - Amazon Bedrock.md)


## Linked from

- [15-Day Exam Countdown](15-Day%20Exam%20Countdown.md)
- [Agentic AI, MCP, Memory, and Orchestration](35%20-%20Agentic%20AI%2C%20MCP%2C%20Memory%2C%20and%20Orchestration.md)
- [AI Security, Privacy, and Governance in Practice](31%20-%20AI%20Security%2C%20Privacy%2C%20and%20Governance%20in%20Practice.md)
- [AWS Certified AI Practitioner — Remaining Lessons](index.md)
- [Bedrock Prompt Management, Evaluation, and Flows](24%20-%20Bedrock%20Prompt%20Management%2C%20Evaluation%2C%20and%20Flows.md)
- [Fine-Tuning](15%20-%20Fine-Tuning.md)
