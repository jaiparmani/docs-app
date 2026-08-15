---
tags: [aws, certification, ai-practitioner, agents, mcp]
lesson: 35
exam: AIF-C01
---

# Agentic AI, MCP, Memory, and Orchestration

<small>2 min read</small>

> **Core idea:** Agentic AI extends a model from answering into planning, using approved tools, retaining relevant state, and completing multi-step goals.

## Learning objectives

- Explain tools, memory, workflows, multi-agent patterns, and MCP at a high level.
- Select an agent versus a fixed workflow or basic RAG assistant.

## Core concepts

| Concept | Meaning |
|---|---|
| Agent | FM-powered system that chooses actions toward a goal |
| Tool use | Calling an approved API, database, or function |
| Memory | Retaining relevant state or prior context |
| Workflow orchestration | Coordinating ordered steps and conditions |
| Multi-agent pattern | Several specialized agents collaborating on complex work |
| MCP | A standard protocol for connecting AI applications/agents to external tools and context providers |

## Choosing the approach

| Requirement | Best fit |
|---|---|
| Answer questions from documents | RAG / Knowledge Base |
| Run a fixed retrieve → generate → format path | Workflow / Flow |
| Decide which approved tools to call to resolve a request | Agent |
| Divide a complex task among specialist roles | Multi-agent pattern |

## AWS example

A travel agent retrieves the corporate policy, checks a booking through an approved API, proposes an allowed change, and asks a human for approval before purchase. Amazon Bedrock Agents is an exam-relevant example of an agent-oriented service.

## Exam tips

- An agent is useful when the system must choose tools or take multiple dependent actions.
- Agent permissions must be scoped; agentic does not mean unrestricted autonomy.
- MCP is about connecting agents/applications with external systems in a standard way—not a model-training technique.

## Common traps

| Trap | Correct understanding |
|---|---|
| “An agent is only a chatbot.” | It can plan and act through approved tools. |
| “A Knowledge Base takes actions.” | It retrieves information; an agent can use it plus tools. |
| “Memory means model weights permanently change.” | Memory is supplied state/context, not necessarily training. |

## Interview insight

Use the least autonomous design that meets the outcome. Sensitive and irreversible actions need explicit approval boundaries.

## Quick revision

**RAG retrieves. Workflow follows defined steps. Agent chooses tools/actions. MCP connects to external context and tools.**

## Practice questions

1. A system must decide whether to check an order API, retrieve a policy, or create a return based on a request. What fits best?  
   A. Agent with approved tools  B. Vector database only  C. Tokenizer  D. OCR

2. What is the high-level purpose of MCP?  
   A. Standardize connections between AI applications/agents and external tools/context  B. Replace IAM policies  C. Train an FM  D. Encrypt a vector database

3. Which control is appropriate before an agent initiates a payment?  
   A. Human approval  B. Higher temperature  C. Larger context window  D. Fewer audit logs

## Answers

1. **A**. 2. **A**. 3. **A**.

## Related notes

[16 - AI Agents](16 - AI Agents.md) · [24 - Bedrock Prompt Management, Evaluation, and Flows](24 - Bedrock Prompt Management, Evaluation, and Flows.md) · [31 - AI Security, Privacy, and Governance in Practice](31 - AI Security, Privacy, and Governance in Practice.md)
