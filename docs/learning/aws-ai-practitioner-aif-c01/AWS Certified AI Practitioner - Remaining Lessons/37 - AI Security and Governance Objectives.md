---
tags: [aws, certification, ai-practitioner, security, governance]
lesson: 37
exam: AIF-C01
---

# AI Security and Governance Objectives

<small>3 min read</small>

> **Core idea:** Secure AI by controlling access and data, validating inputs and outputs, documenting data origins, monitoring activity, and following governance rules over the full data lifecycle.

## Learning objectives

- Recognize current AWS security/governance services and concepts in scope.
- Explain data lineage, source citations, prompt-injection defenses, and data-governance practices.

## Security controls and services

| Control/service | Primary purpose |
|---|---|
| IAM roles, policies, permissions | Least-privilege authorization |
| Encryption / AWS KMS | Protect data at rest and in transit; manage keys |
| Amazon Macie | Discover and help protect sensitive data in Amazon S3 |
| AWS PrivateLink | Private connectivity to supported AWS services |
| Amazon Bedrock Guardrails | Apply content/policy controls to model interactions |
| CloudTrail | Audit API activity |
| CloudWatch | Operational monitoring, logs, alarms |
| AWS Config | Track/evaluate resource configuration |
| Amazon Inspector | Vulnerability management assistance |
| AWS Audit Manager / AWS Artifact | Evidence and compliance documentation support |

## Data and AI governance

- Maintain **data lineage**: record where data came from and how it was used.
- Use source citations/attribution where appropriate, especially for grounded enterprise answers.
- Define retention, residency, access, logging, monitoring, and review policies.
- Validate model outputs and use confidence scoring or escalation for uncertain/high-risk outputs.
- Defend against prompt injection, data leakage, toxicity, and unsafe tool use through input/output controls, least privilege, and approvals.

## AWS example

An internal agent receives untrusted user input. The application filters and validates input, limits its role to read-only access, retrieves sources with citations, applies Guardrails, logs important activity, and requires a human approval before any external update.

## Exam tips

- Guardrails, IAM, encryption, and output validation are complementary layers.
- Data lineage and citations improve traceability; they are not replacements for access control.
- Private connectivity and least privilege reduce exposure but do not make prompts automatically safe.

## Common traps

| Trap | Correct understanding |
|---|---|
| “Guardrails replace IAM.” | Guardrails shape content; IAM controls permissions. |
| “CloudTrail protects data.” | It records activity for audit; encryption/access controls protect data. |
| “A cited answer is necessarily correct.” | Citations help traceability; validate sources and output. |

## Interview insight

Treat any retrieved document, tool result, or user prompt as potentially untrusted input. Do not allow it to override application policy or broaden permissions.

## Quick revision

**Layer controls: IAM + encryption + private access + input/output validation + Guardrails + logging + governance.**

## Practice questions

1. Which service helps identify sensitive data in Amazon S3?  
   A. Amazon Macie  B. Amazon Lex  C. Amazon Polly  D. Amazon Rekognition

2. Which practice best supports traceability of a RAG answer?  
   A. Record data origins and show appropriate source citations  B. Raise temperature  C. Remove logs  D. Fine-tune after every answer

3. What is an appropriate defense against prompt injection in an AI application?  
   A. Validate input, constrain tools with least privilege, and enforce output controls  B. Grant broad administrator permissions  C. Disable monitoring  D. Always use the largest model

## Answers

1. **A**. 2. **A**. 3. **A**.

## Related notes

[31 - AI Security, Privacy, and Governance in Practice](31 - AI Security, Privacy, and Governance in Practice.md) · [18 - Bedrock Building Blocks](18 - Bedrock Building Blocks.md) · [35 - Agentic AI, MCP, Memory, and Orchestration](35 - Agentic AI, MCP, Memory, and Orchestration.md)


## Linked from

- [15-Day Exam Countdown](15-Day%20Exam%20Countdown.md)
- [AWS Certified AI Practitioner — Remaining Lessons](index.md)
