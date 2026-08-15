---
tags: [aws, certification, genai-developer-professional, roadmap]
exam: AIP-C01
---

# AWS Certified Generative AI Developer – Professional (AIP-C01) — Syllabus

<small>6 min read</small>

> AIF-C01 (AI Practitioner) is done. This is a different, harder exam: 2+ years of production AWS experience and ~1 year of hands-on GenAI experience are the assumed baseline, and the questions are scenario/architecture-driven, not recall-driven. 65 scored questions (+10 unscored), 750/1000 to pass, compensatory scoring across domains (no per-domain minimum).

Source: [official AWS exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01.html) and its five domain pages.

## What the exam actually validates
- Design and implement solutions using vector stores, RAG, Knowledge Bases, and other GenAI architectures.
- Integrate FMs into applications and business workflows.
- Apply prompt engineering and management techniques.
- Implement agentic AI solutions.
- Optimize GenAI applications for cost, performance, and business value.
- Implement security, governance, and Responsible AI practices.
- Troubleshoot, monitor, and optimize GenAI applications in production.
- Evaluate FMs for quality and responsibility.

**Explicitly out of scope** (per AWS): model development and training, advanced ML techniques, data engineering/feature engineering. This is a *developer/integrator* exam, not an ML scientist exam — assume you're consuming and orchestrating FMs, not training them.

## Domain weights and note mapping

| Domain | Weight | Tasks | Notes covering it |
|---|---:|---|---|
| 1 — Foundation Model Integration, Data Management, and Compliance | 31% | 1.1 Solution design · 1.2 Select/configure FMs · 1.3 Data validation/processing · 1.4 Vector stores · 1.5 Retrieval mechanisms · 1.6 Prompt engineering & governance | [01 - Bedrock Model Catalog and Integration Patterns](01 - Bedrock Model Catalog and Integration Patterns.md), [02 - Vector Stores and Embeddings](02 - Vector Stores and Embeddings.md), [03 - RAG Architecture](03 - RAG Architecture.md), [04 - Prompt Engineering and Governance](04 - Prompt Engineering and Governance.md) |
| 2 — Implementation and Integration | 26% | 2.1 Agentic AI & tools · 2.2 Deployment strategies · 2.3 Enterprise integration · 2.4 FM API integration · 2.5 App integration & dev tools | [05 - Agentic AI and Tool Use](05 - Agentic AI and Tool Use.md), [06 - FM Deployment and API Integration](06 - FM Deployment and API Integration.md) — **2.3 and 2.5 not yet covered by a dedicated note, see below** |
| 3 — AI Safety, Security, and Governance | 20% | 3.1 Input/output safety · 3.2 Data security/privacy · 3.3 Governance/compliance · 3.4 Responsible AI | [07 - AI Safety and Guardrails](07 - AI Safety and Guardrails.md), [08 - Data Security and Privacy](08 - Data Security and Privacy.md), [09 - Governance and Responsible AI](09 - Governance and Responsible AI.md) |
| 4 — Operational Efficiency and Optimization | 12% | 4.1 Cost optimization · 4.2 Performance optimization · 4.3 Monitoring | [10 - Cost Optimization](10 - Cost Optimization.md), [11 - Performance and Latency Optimization](11 - Performance and Latency Optimization.md), [12 - Observability and Monitoring](12 - Observability and Monitoring.md) |
| 5 — Testing, Validation, and Troubleshooting | 11% | 5.1 Evaluation systems · 5.2 Troubleshooting | [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md), [14 - Troubleshooting GenAI Applications](14 - Troubleshooting GenAI Applications.md) |

**Not yet built** (lower priority, added after the core 14): Task 2.3 (enterprise integration architectures — Outposts/Wavelength hybrid patterns, identity federation) and Task 2.5 (app integration patterns, Amplify, CI/CD-adjacent dev tooling). These are real exam content but were deprioritized against your explicit priority list — flag if you want them built before the exam.

## In-scope service surface (condensed — full list in the note that needs it)
Bedrock (+ AgentCore, Knowledge Bases, Prompt Management, Prompt Flows), SageMaker AI (+ Clarify, Ground Truth, JumpStart, Model Monitor, Model Registry, Neo, Processing), Comprehend, Rekognition, Textract, Transcribe, Kendra, Lex, Titan · OpenSearch Service, Aurora (pgvector), DynamoDB, RDS, ElastiCache, Neptune, DocumentDB · Lambda, ECS, EKS, Fargate, App Runner, EC2 · API Gateway, AppSync, EventBridge, SQS, SNS, Step Functions · IAM (+ Identity Center, Access Analyzer), KMS, Macie, Secrets Manager, Cognito, WAF, VPC/PrivateLink · CloudWatch (+ Logs, Synthetics), CloudTrail, X-Ray, Cost Explorer, Cost Anomaly Detection · CodePipeline, CodeBuild, CodeDeploy, CDK, CloudFormation, Amplify, Kiro · Glue (+ Data Quality, Data Catalog), Athena, Kinesis, MSK.

Explicitly **out of scope**: model training/dev-focused services (SageMaker training internals beyond deployment, DeepRacer/DeepComposer), most media services (Elemental*, Transcoder — note: your existing system-design video-streaming notes used these conceptually, but they're not testable here), Forecast, Fraud Detector, Lookout family, Redshift, and general infra services unrelated to GenAI (Direct Connect, Transit Gateway, IoT family, Batch, etc.). Full list: [out-of-scope services](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-out-of-scope-services.html).

## 5-week plan

| Week | Focus | What to do |
|---|---|---|
| 1 | Domain 1 core | Work through [01 - Bedrock Model Catalog and Integration Patterns](01 - Bedrock Model Catalog and Integration Patterns.md) → [02 - Vector Stores and Embeddings](02 - Vector Stores and Embeddings.md) → [03 - RAG Architecture](03 - RAG Architecture.md) → [04 - Prompt Engineering and Governance](04 - Prompt Engineering and Governance.md). If you can, stand up a minimal Bedrock + Knowledge Base RAG app this week — this exam rewards having actually touched the API surface, not just read about it. |
| 2 | Domain 2 | [05 - Agentic AI and Tool Use](05 - Agentic AI and Tool Use.md) → [06 - FM Deployment and API Integration](06 - FM Deployment and API Integration.md). Read the official Task 2.3/2.5 skill bullets directly from the [Domain 2 exam guide](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/ai-professional-01-domain2.html) since dedicated notes for those don't exist yet. |
| 3 | Domain 3 | [07 - AI Safety and Guardrails](07 - AI Safety and Guardrails.md) → [08 - Data Security and Privacy](08 - Data Security and Privacy.md) → [09 - Governance and Responsible AI](09 - Governance and Responsible AI.md). This domain is where "name the specific AWS control, not just the principle" separates a pass from a strong pass — drill the decision rules in each note. |
| 4 | Domains 4 + 5 | [10 - Cost Optimization](10 - Cost Optimization.md) → [11 - Performance and Latency Optimization](11 - Performance and Latency Optimization.md) → [12 - Observability and Monitoring](12 - Observability and Monitoring.md) → [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md) → [14 - Troubleshooting GenAI Applications](14 - Troubleshooting GenAI Applications.md). These five notes are individually smaller-weight domains but conceptually the most "production judgment"-heavy — this is where ambiguous scenario questions concentrate. |
| 5 | Practice & closing gaps | Full-length timed mock(s) once built (flag if you want one written — same 65-question, domain-weighted, collapsible-answer format as the AIF-C01 mocks). Missed Questions Log. Re-drill whichever domain your misses cluster in. Final pass: reread every note's "Rapid recall" section only. |

## Note format (applies to every note in this folder)
Each note follows: **Core concept + why it matters in production** → **Service comparison** (which AWS service/config, when) → **Architecture trade-offs, failure modes, security concerns, cost considerations** → **Troubleshooting signals** → **Scenario-based exam traps & decision rules** → **Rapid recall** → **5 practice questions** (collapsible answers, click to reveal). This is deliberately closer to the system-design notes' reasoning depth than AIF-C01's cram style — the exam tests judgment under ambiguous production scenarios, not recall.

## Related
[01 - Bedrock Model Catalog and Integration Patterns](01 - Bedrock Model Catalog and Integration Patterns.md) · [02 - Vector Stores and Embeddings](02 - Vector Stores and Embeddings.md) · [03 - RAG Architecture](03 - RAG Architecture.md) · [04 - Prompt Engineering and Governance](04 - Prompt Engineering and Governance.md) · [05 - Agentic AI and Tool Use](05 - Agentic AI and Tool Use.md) · [06 - FM Deployment and API Integration](06 - FM Deployment and API Integration.md) · [07 - AI Safety and Guardrails](07 - AI Safety and Guardrails.md) · [08 - Data Security and Privacy](08 - Data Security and Privacy.md) · [09 - Governance and Responsible AI](09 - Governance and Responsible AI.md) · [10 - Cost Optimization](10 - Cost Optimization.md) · [11 - Performance and Latency Optimization](11 - Performance and Latency Optimization.md) · [12 - Observability and Monitoring](12 - Observability and Monitoring.md) · [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md) · [14 - Troubleshooting GenAI Applications](14 - Troubleshooting GenAI Applications.md)
