---
tags: [aws, certification, genai-developer-professional, exam-prep, cram-sheet]
exam: AIP-C01
---

# Rapid Recall Cram Sheet

One page. Read this the morning of the exam and nothing else new. Pulled from every deep note's "Rapid recall" section.

## Domain 1 — FM Integration, Data, Compliance (31%)
- On-Demand = variable/bursty, can throttle. Provisioned Throughput = sustained/predictable, fixed cost, guaranteed capacity.
- Cross-Region Inference = resilience + availability fix, but crosses data-residency boundaries — flag the conflict if residency matters.
- Custom Model Import = serve your own fine-tuned weights through Bedrock's managed API.
- Model selection should be config-driven (AppConfig/Lambda/API Gateway), never hardcoded.
- Cost-capability trade-off: smallest model that clears the bar, not the biggest.
- Bedrock Knowledge Bases = managed end-to-end RAG. OpenSearch = fine control + hybrid search + sharding. Aurora/pgvector = reuse existing infra. DynamoDB+vector = metadata-heavy access. Kendra = enterprise search, not a bespoke vector index.
- Embedding model choice is a one-way door per index — changing it means full reindex.
- Metadata = retrieval-quality + cost lever via pre-filtering, not bookkeeping.
- Staleness in a vector store = correctness bug, not a nuisance — every design needs an explicit refresh/sync mechanism.
- Hybrid search fixes exact-term misses pure semantic search causes. Reranking = second-pass precision over a cheap first-pass candidate set. Query transformation runs *before* retrieval to close the user-phrasing-vs-document-phrasing gap.
- Function calling / MCP = the standardized interface an agent uses to issue retrieval requests.
- Prompt Management = versioned, parameterized templates. Prompt Flows = multi-step orchestration with branching, reviewable by non-engineers. Guardrails = enforcement layer, not a prompt substitute.
- Approval workflows + regression testing = prompts are governed like code.

## Domain 2 — Implementation and Integration (26%)
- Strands Agents / Agent Squad = AWS-native agent frameworks with memory/state, multi-agent coordination.
- Step Functions = backbone for ReAct loops, stopping conditions, human-review orchestration, circuit breakers.
- Lambda = tool-call validation AND lightweight stateless MCP servers; ECS = complex/stateful MCP servers.
- IAM policies = the real enforcement boundary on agent tool actions, not prompt instructions.
- Every agent design answer should pair capability with a boundary (stopping condition, IAM scope, human review gate).
- LLM containers size around token processing capacity and GPU utilization, not raw request count.
- Model cascading = cheap model first, escalate on need — highest-leverage cost lever in this domain.
- Streaming = perceived-latency fix and a real resilience-design consideration.
- Resilience toolkit: SDK exponential backoff + API Gateway rate limiting + fallback mechanisms + X-Ray tracing.
- Sync (Bedrock APIs) = interactive; Async (SQS) = batch/offline, no immediate response needed.
- Static routing = simple/predictable; dynamic (Step Functions) routing = adaptive but more complex.
- Outposts/Wavelength = hybrid/on-premises data-processing needs. CodePipeline/CodeBuild = CI/CD with security scans for GenAI components.

## Domain 3 — AI Safety, Security, Governance (20%)
- Defense in depth = input filtering + generation-time guardrails + output validation, layered — no single control trusted alone.
- Hallucination mitigation ≠ content moderation: grounding (RAG/KB) + confidence scoring + structured output (JSON Schema).
- Prompt injection/jailbreak = a distinct adversarial threat class, needs its own detection layer.
- Text-to-SQL / system-integrated output needs deterministic transformation and validation — structural guarantees, not just prompt caution.
- Network/access security (VPC endpoints, IAM, Lake Formation) ≠ content-aware PII protection (Comprehend, Macie, Guardrails PII redaction) — both required.
- Comprehend = real-time PII detection in text streams. Macie = at-rest PII/sensitive-data discovery in S3.
- Lake Formation = fine-grained (row/column) access control when IAM's resource-level granularity isn't enough.
- S3 Lifecycle policies = automated retention, applies to prompt/output logs too, not just source documents.
- Model cards (SageMaker) = standardized documentation of intended use/limitations — not a wiki page.
- Data lineage (Glue) + metadata tagging = traceability from source data to generated output.
- CloudTrail (API-level audit) + CloudWatch Logs (decision/output logs) = the audit-trail backbone.
- Governance is continuous: bias-drift monitoring, misuse detection, automated alerting — not a one-time launch gate.
- Governance ≠ safety guardrails: governance proves/explains what happened, guardrails prevent bad outputs.

## Domain 4 — Operational Efficiency and Optimization (12%)
- Four cost levers: token efficiency (compression/pruning), model selection (tiering), throughput/utilization (batching, capacity planning, auto-scaling), caching (semantic vs. exact-match).
- Semantic caching = higher hit rate, real correctness risk — needs threshold tuning and per-user/tenant scoping.
- Batching = throughput win, latency cost — fits async/offline, not interactive.
- Provisioned Throughput cost optimization = a utilization problem, not a "get more capacity" problem.
- Pre-computation = for predictable queries only. Parallel requests = for independent sub-tasks only. Streaming = perceived latency, not total time.
- Auto-scaling for GenAI needs token-volume-aware triggers, not just request-count triggers.
- Generation parameters (temperature/top-p) = quality lever, not primarily latency; output-length constraints ARE latency-relevant.
- Cost Anomaly Detection = safety net for token-driven cost spikes that fixed budgets don't catch well.

## Domain 5 — Testing, Validation, Troubleshooting (11%)
- Bedrock Model Evaluations = automatic + human evaluation jobs comparing FM outputs.
- LLM-as-a-Judge = fast/scalable but biased; pair with human feedback for high-stakes decisions.
- RAG evaluation must separate retrieval quality from generation quality.
- Agent evaluation needs task-completion-rate and tool-usage metrics, not just output-quality scoring.
- Continuous evaluation + regression testing + automated quality gates = evaluation as an ongoing process.
- Five troubleshooting categories: content handling (silent context overflow/truncation), FM integration (request vs. response side), prompt engineering (never-quite-right), retrieval (widest surface: embeddings/chunking/indexing/drift), prompt maintenance (used-to-work, now drifting).
- "Never worked well" = prompt engineering. "Used to work, now doesn't" = prompt maintenance/drift.
- X-Ray tracing = root-causing which layer (retrieval, prompt construction, FM call) introduced a failure.

## Cross-cutting exam instincts (apply everywhere)
- Every "give it autonomy/capability" scenario should pair with "and how do you bound it" — this pairing is the most repeated pattern across the whole exam.
- Cost-capability trade-off (smallest thing that clears the bar) beats "biggest/best/most capable" in nearly every model-selection question.
- Single-control answers are usually wrong for high-stakes/regulated scenarios — layered/defense-in-depth answers are usually right.
- "It never worked" vs. "it used to work and now doesn't" are different diagnostic categories with different fixes — read scenario wording carefully for this distinction.
- Sync = interactive, immediate response needed. Async = batch/offline, no immediate response needed. Don't cross them.

## Related
README · [Mock Exam 1](Mock Exam 1.md) · [Service Selection Drill](Service Selection Drill.md)
