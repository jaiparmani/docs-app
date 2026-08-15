---
tags: [aws, certification, ai-practitioner, security, governance]
lesson: 31
exam: AIF-C01
---

# AI Security, Privacy, and Governance in Practice

<small>2 min read</small>

> **Core idea:** Secure AI applications with least privilege, encryption, auditability, data governance, and monitoring—while retaining customer responsibility for configuration and use.

## Learning objectives

- Match IAM, KMS, CloudTrail, CloudWatch, and AWS Config to their roles.
- Apply the shared responsibility model to AI solutions.

## Concise explanation

| Control | Purpose |
|---|---|
| IAM | Authenticate identities and authorize only needed actions |
| AWS KMS | Create and manage encryption keys |
| Encryption at rest/in transit | Protect stored and moving data |
| CloudTrail | Record API activity for audit |
| CloudWatch | Observe metrics, logs, alarms, and operational behavior |
| AWS Config | Record and assess resource configuration |

## AWS example

An internal Bedrock application lets its runtime role read only one approved document source, encrypts stored data with KMS-managed keys, logs relevant API actions with CloudTrail, and monitors failures with CloudWatch.

## Exam tips

- Least privilege means exactly the permissions needed—no broader.
- **CloudTrail = audit/API history; CloudWatch = monitoring/operations.**
- Guardrails control model content policies; IAM controls access. They solve different risks.

## Common traps

| Trap | Correct understanding |
|---|---|
| “AWS handles all security for a managed AI service.” | AWS secures infrastructure; customers secure their data, identities, configuration, and application use. |
| “KMS grants users access.” | IAM grants access; KMS manages encryption keys. |
| “CloudWatch replaces audit logs.” | Use CloudTrail for API audit history. |

## Interview insight

Agent actions deserve the same least-privilege design and approval boundaries as any other production integration—often more, because an agent can act across systems.

## Quick revision

**IAM authorizes. KMS manages keys. CloudTrail audits. CloudWatch monitors. Config checks configuration.**

## Practice questions

1. Which service records API activity to support auditing?  
   A. AWS CloudTrail  B. Amazon CloudWatch  C. Amazon Bedrock  D. Amazon Lex

2. A role should access only the specific documents used by a chatbot. Which principle applies?  
   A. Least privilege  B. Maximum availability  C. High temperature  D. Fine-tuning

3. Which service manages encryption keys?  
   A. AWS IAM  B. AWS KMS  C. AWS Config  D. Amazon Rekognition

4. Which statement reflects shared responsibility?  
   A. Customers have no security role for managed services.  
   B. AWS secures cloud infrastructure while customers manage their data and access configuration.  
   C. Guardrails replace IAM.  
   D. CloudTrail encrypts data.

## Answers

1. **A**. 2. **A**. 3. **B**. 4. **B**.

## Related notes

[21 - Security Compliance and Governance](21 - Security Compliance and Governance.md) · [16 - AI Agents](16 - AI Agents.md) · [30 - Responsible AI in Practice](30 - Responsible AI in Practice.md)
