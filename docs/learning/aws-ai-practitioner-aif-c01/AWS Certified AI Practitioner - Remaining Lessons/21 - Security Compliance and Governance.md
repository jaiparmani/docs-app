---
tags: [aws, certification, ai-practitioner, security, governance]
lesson: 21
exam: AIF-C01
---

# Security, Compliance, and Governance for AI Solutions

## Security fundamentals

| Control | Purpose |
|---|---|
| IAM | Authentication and least-privilege authorization |
| AWS KMS | Manage encryption keys for protected data |
| Encryption in transit / at rest | Protect data while moving and stored |
| CloudTrail | Audit API activity and account actions |
| CloudWatch | Monitor metrics, logs, and alarms |
| AWS Config | Track and assess resource configuration |

## Shared responsibility model

AWS secures the underlying cloud infrastructure. Customers remain responsible for their data, IAM permissions, configurations, application logic, and how they use AI outputs.

## AI-specific governance

- Classify data; minimize sensitive data sent to models.
- Define approved use cases, owners, review processes, and retention rules.
- Log and monitor relevant interactions in line with privacy obligations.
- Use least privilege for users, applications, agent tools, and data sources.
- Consider regional/data-residency, contractual, and regulatory requirements.

## Exam tips

- IAM least privilege means granting only the permissions necessary for the role.
- KMS manages encryption keys; it is not an identity service.
- CloudTrail is for audit records of API activity; CloudWatch is for operational monitoring.
- Compliance is shared: managed AWS services do not remove customer governance obligations.
- Guardrails manage model behavior; IAM manages access. Use both for different risks.

## Practice questions

1. Which service records API activity for auditing?  
   A. CloudTrail  B. CloudWatch  C. Bedrock  D. Rekognition

2. A chatbot application should only read the documents required for its job. Which principle applies?  
   A. Maximum privilege  B. Least privilege  C. High temperature  D. Fine-tuning

3. Which service is used to manage encryption keys?  
   A. IAM  B. KMS  C. Lex  D. Config

**Answers:** 1-A, 2-B, 3-B.

## Next

[22 - Final Revision Checklist](22 - Final Revision Checklist.md)
