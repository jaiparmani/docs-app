---
tags: [aws, certification, genai-developer-professional, exam-prep, service-drill]
exam: AIP-C01
---

# Service Selection Drill

<small>3 min read</small>

Quick requirement → service lookup. AIP-C01's in-scope surface (~90 services across 13 categories) is far bigger than AIF-C01's — this drill exists because you can't hold it all in working memory without repetition. Cover the right column and test yourself.

## Model access, customization, deployment
| Requirement | Service/feature |
|---|---|
| Managed API access to foundation models | Amazon Bedrock |
| Guaranteed throughput for sustained load | Bedrock Provisioned Throughput |
| Variable/bursty FM traffic | Bedrock On-Demand |
| Model unavailable/capacity-constrained in-Region | Bedrock Cross-Region Inference (data-residency caveat!) |
| Serve your own already fine-tuned weights | Bedrock Custom Model Import |
| Full custom training / custom algorithms | Amazon SageMaker AI |
| Pre-trained models + solution templates | SageMaker JumpStart |
| No-code ML model building | SageMaker Canvas |
| Monitor deployed models for drift | SageMaker Model Monitor |
| Model versioning for deployment | SageMaker Model Registry |
| Data labeling | SageMaker Ground Truth |
| Bias/explainability analysis | SageMaker Clarify |
| Data prep/wrangling | SageMaker Data Wrangler |
| Optimize models for edge/specific hardware | SageMaker Neo |

## RAG, vector stores, retrieval
| Requirement | Service/feature |
|---|---|
| Fully managed RAG pipeline | Bedrock Knowledge Bases |
| Fine-grained vector search control, hybrid search, sharding | Amazon OpenSearch Service (Neural plugin) |
| Vector search reusing existing relational infra | Amazon Aurora + pgvector |
| Metadata-heavy vector access pattern | Amazon DynamoDB + vector database |
| Enterprise search across existing repos | Amazon Kendra |
| Embeddings | Amazon Titan (embeddings models) |

## Agents and orchestration
| Requirement | Service/feature |
|---|---|
| Agent framework with memory/multi-agent coordination | Strands Agents, AWS Agent Squad |
| ReAct reasoning loop as an observable state machine | AWS Step Functions |
| Agent runtime/execution environment | Amazon Bedrock AgentCore |
| Lightweight stateless tool access | Lambda-based MCP server |
| Complex/stateful tool operations | ECS-based MCP server |
| Human-in-the-loop review step | Step Functions + API Gateway (feedback collection) |
| Human review/augmentation for FM output | Amazon Augmented AI (A2I) |

## Prompt engineering and governance
| Requirement | Service/feature |
|---|---|
| Versioned, parameterized prompt templates | Bedrock Prompt Management |
| Multi-step prompt chains with branching | Bedrock Prompt Flows |
| Safety/behavior enforcement layer | Bedrock Guardrails |
| Intent recognition pre-step | Amazon Comprehend |
| Conversation history storage | Amazon DynamoDB |

## Data processing and integration
| Requirement | Service/feature |
|---|---|
| Data quality validation for FM consumption | AWS Glue Data Quality |
| Data lineage tracking | AWS Glue (+ Data Catalog) |
| Entity extraction / text enhancement | Amazon Comprehend |
| Speech-to-text for multimodal pipelines | Amazon Transcribe |
| Document text/structured extraction | Amazon Textract |
| Image/video analysis | Amazon Rekognition |
| Event-driven integration | Amazon EventBridge |
| Async processing decoupling | Amazon SQS |
| Pub/sub notification | Amazon SNS |
| Custom API surface with validation | Amazon API Gateway |
| Enterprise assistant for business data/tasks | Amazon Q Business |
| Coding assistant / dev productivity | Amazon Q Developer |
| Conversational chatbot/voice UI | Amazon Lex |

## Safety, security, privacy
| Requirement | Service/feature |
|---|---|
| Private connectivity to Bedrock, no public internet | VPC endpoint (PrivateLink) |
| Least-privilege access control | IAM (+ IAM Identity Center, Access Analyzer) |
| Encryption key management | AWS KMS |
| Real-time PII detection in text | Amazon Comprehend |
| At-rest sensitive-data discovery in S3 | Amazon Macie |
| Fine-grained (row/column) data access control | AWS Lake Formation |
| Secrets management | AWS Secrets Manager |
| Federated identity | Amazon Cognito |
| Web application firewall | AWS WAF |

## Governance, audit, compliance
| Requirement | Service/feature |
|---|---|
| API-level audit trail | AWS CloudTrail |
| Decision/output/access logging | Amazon CloudWatch Logs |
| Standardized model documentation | SageMaker programmatic model cards |
| Bedrock request/response forensic detail | Bedrock Model Invocation Logs |

## Cost and performance
| Requirement | Service/feature |
|---|---|
| Cost spend anomaly detection | AWS Cost Anomaly Detection |
| Cost analysis/breakdown | AWS Cost Explorer |
| Cross-service distributed tracing | AWS X-Ray |
| Custom metrics + dashboards | Amazon CloudWatch (+ Synthetics) |
| Managed Grafana dashboards | Amazon Managed Grafana |
| Auto-scaling compute | AWS Auto Scaling |

## Deployment and CI/CD
| Requirement | Service/feature |
|---|---|
| CI/CD pipeline orchestration | AWS CodePipeline |
| Automated build/test/security-scan | AWS CodeBuild |
| Automated deployment | AWS CodeDeploy |
| Infrastructure as code | AWS CDK, AWS CloudFormation |
| Declarative frontend UI for GenAI apps | AWS Amplify |
| Serverless compute for FM invocation | AWS Lambda |
| Container orchestration | Amazon ECS, Amazon EKS, AWS Fargate |
| On-premises/hybrid GenAI processing | AWS Outposts |
| Edge/telecom-adjacent low-latency deployment | AWS Wavelength |

## Common wrong-answer traps (out of scope — never the answer here)
Amazon Forecast, Amazon Fraud Detector, Amazon Lookout family, AWS DeepRacer/DeepComposer, Amazon Redshift, AWS Elemental media services (MediaConvert, MediaLive, etc.), AWS Batch, AWS Direct Connect, AWS Transit Gateway, the entire IoT service family. If one of these appears as an answer choice, it's a distractor — full list: [out-of-scope services](https://docs.aws.amazon.com/aws-certification/latest/ai-professional-01/aip-01-out-of-scope-services.html).

## Related
README · [Mock Exam 1](Mock Exam 1.md) · [Rapid Recall Cram Sheet](Rapid Recall Cram Sheet.md)
