---
tags: [aws, certification, genai-developer-professional, mock-exam]
exam: AIP-C01
---

# Mock Exam 1 (65 Questions)

<small>24 min read</small>

> Domain weighting mirrors the real blueprint: Domain 1 – FM Integration, Data Management & Compliance (31%, Q1–20), Domain 2 – Implementation and Integration (26%, Q21–37), Domain 3 – AI Safety, Security & Governance (20%, Q38–50), Domain 4 – Operational Efficiency & Optimization (12%, Q51–58), Domain 5 – Testing, Validation & Troubleshooting (11%, Q59–65).
>
> Time yourself: 170 minutes (the real exam's limit). Most questions are single-answer multiple choice; a few marked **(Select TWO)** are multiple-response — you must get all correct selections to earn credit, same as the real exam. Click each answer to reveal it — don't peek before committing.

## Domain 1 – Foundation Model Integration, Data Management, and Compliance (Q1–20)

**1.** A team needs a model for a real-time chat widget where response speed is the top priority and the task (intent classification) is simple. Which model-selection approach fits?
A. Always use the largest, most capable flagship model B. Use a latency-optimized or smaller model that clears the accuracy bar for this simple task C. Use Provisioned Throughput regardless of model size D. Require a custom-trained model via SageMaker

> [!success]- Answer
> **B** — cost-capability trade-off: match model size to task complexity. A simple classification task doesn't need flagship capability, and a smaller/latency-optimized model directly serves the stated priority.

**2.** An application currently hardcodes a Bedrock model ID in its business logic. The team wants to A/B test different models with no code deploys. What should they build?
A. A separate application per model B. A config-driven model-selection layer (e.g. AppConfig behind Lambda/API Gateway) C. A SageMaker training pipeline D. A new IAM role per model

> [!success]- Answer
> **B** — decoupling model choice from application code via configuration is what enables swapping/testing models without redeploying business logic.

**3.** A workload has strict EU-only data residency requirements. The preferred model is unavailable in EU Regions. An engineer proposes Bedrock Cross-Region Inference to solve availability. What's the concern?
A. Cross-Region Inference is more expensive, nothing else B. Cross-Region Inference routes inference payloads outside the Region, conflicting with the residency requirement C. Cross-Region Inference doesn't work with Guardrails D. There is no concern, this is the correct fix

> [!success]- Answer
> **B** — Cross-Region Inference is a resilience/availability feature but moves data across Region boundaries, directly conflicting with a strict data-residency requirement.

**4.** A fine-tuned model deployed via SageMaker regresses in quality after an update, discovered two days later. What two capabilities does this expose as missing? **(Select TWO)**
A. A quality gate/evaluation before promotion B. A larger EC2 instance type C. A rollback path via SageMaker Model Registry versioning D. A different AWS Region E. A longer Bedrock context window

> [!success]- Answer
> **A, C** — the regression should have been caught by an evaluation gate before promotion, and a fast rollback to the prior registered model version should have been available once detected.

**5.** Which AWS service is purpose-built for validating data quality before it's used for FM consumption?
A. AWS Glue Data Quality B. Amazon Polly C. AWS CloudTrail D. Amazon Route 53

> [!success]- Answer
> **A** — Glue Data Quality provides comprehensive data validation workflows for FM-consumption pipelines.

**6.** A pipeline needs to process a mix of text, images, and audio for a multimodal FM. Which combination best fits?
A. Amazon Bedrock multimodal models + SageMaker Processing for pipeline orchestration B. Amazon Route 53 only C. AWS CloudTrail only D. Amazon SNS only

> [!success]- Answer
> **A** — multimodal FM consumption needs models that accept multiple data types plus a processing pipeline to prepare each type appropriately.

**7.** What is the primary purpose of formatting input data according to model-specific requirements (e.g. JSON structure) before invoking Bedrock?
A. To reduce IAM permissions needed B. To satisfy the specific API contract each model expects, avoiding malformed-request failures C. To bypass Guardrails D. To reduce encryption overhead

> [!success]- Answer
> **B** — each model/API has a specific expected input format; correct formatting is a prerequisite for a successful invocation, not an optimization.

**8.** Which service can be used to extract entities from unstructured input text as a data-quality-enhancement step before FM consumption?
A. Amazon Comprehend B. AWS Direct Connect C. Amazon Route 53 D. AWS Snowball

> [!success]- Answer
> **A** — Comprehend's entity extraction is a common pre-processing step to enhance/normalize input data quality for FM consumption.

**9.** A team already operates Aurora PostgreSQL and wants to add vector search with minimal new infrastructure. Best fit?
A. Stand up a new OpenSearch cluster B. Aurora with the pgvector extension C. DynamoDB with a separate vector database D. Amazon Kendra

> [!success]- Answer
> **B** — reuses existing, already-operated infrastructure rather than introducing a new data store to learn and secure.

**10.** Which is the primary purpose of attaching metadata (timestamps, authorship, domain tags) to documents in a vector store?
A. To reduce storage cost B. To enable pre-filtering before/alongside similarity search, improving retrieval precision C. To satisfy IAM requirements D. To increase embedding dimensionality

> [!success]- Answer
> **B** — metadata enables filtering that narrows the search space before or alongside vector similarity, directly improving retrieval relevance.

**11.** A vector index serving tens of millions of vectors across several distinct content domains shows degrading query latency and relevance. What's the architectural fix?
A. Reduce chunk size to zero B. Sharding and/or multi-index architecture segmented by domain C. Switch to a relational database D. Disable metadata filtering

> [!success]- Answer
> **B** — sharding/multi-index approaches bound query cost and prevent unrelated-domain content from diluting relevance at scale.

**12.** A RAG knowledge base answers questions using content from pages deleted weeks ago. What's missing?
A. A larger embedding model B. An incremental update/change-detection sync mechanism for the vector store C. A bigger foundation model D. Guardrails denied-topics configuration

> [!success]- Answer
> **B** — without an ongoing sync/refresh mechanism, the vector index goes stale relative to the source, serving outdated content as if current.

**13.** Users searching for an exact error code (e.g. "ERR-4471") get poor results despite semantically related content existing in the index. What's the fix?
A. Increase the embedding model's dimensionality B. Add hybrid search combining keyword matching with vector similarity C. Increase chunk size D. Add a reranker only

> [!success]- Answer
> **B** — exact identifiers are a known weak point for pure semantic search; hybrid (keyword + vector) search catches literal matches semantic search can miss.

**14.** What's the primary consideration when selecting an embedding model for a domain-specific RAG application?
A. Its release date only B. Dimensionality and domain fit relative to the content being embedded C. Whether it supports image generation D. Its IAM policy compatibility

> [!success]- Answer
> **B** — embedding quality for retrieval depends on how well the model's dimensionality and training domain match the actual content being searched.

**15.** Which AWS option provides a fully managed, end-to-end RAG pipeline (chunking, embedding, storage, retrieval) with minimal infrastructure ownership?
A. Amazon Bedrock Knowledge Bases B. AWS Direct Connect C. Amazon Route 53 D. AWS Snowmobile

> [!success]- Answer
> **A** — Bedrock Knowledge Bases manages the RAG pipeline end-to-end, the default choice when minimizing infrastructure ownership is a priority.

**16.** Retrieved candidates from a vector search are topically relevant but not well-ordered by true relevance. What targeted fix improves ordering without re-architecting retrieval?
A. A reranker model over the retrieved candidate set B. Deleting the vector index C. Reducing the number of retrieved candidates to one D. Disabling metadata

> [!success]- Answer
> **A** — reranking is a second-pass precision step over an already-retrieved candidate set, improving final ordering without changing the underlying retrieval mechanism.

**17.** A vague user query like "it's broken again" retrieves poor results due to lacking specific terminology. What pipeline addition, run before retrieval, helps?
A. Query expansion/decomposition B. A bigger vector store C. Disabling chunking D. Increasing model temperature

> [!success]- Answer
> **A** — rewriting/expanding a vague query into more search-friendly terms, before the retrieval step runs, closes the gap between user phrasing and document phrasing.

**18.** An autonomous agent needs a consistent, structured way to issue retrieval requests as part of its reasoning. What supports this?
A. Embedding raw instructions directly in the system prompt only B. Function calling interfaces / MCP clients for vector queries C. A fixed always-retrieve-top-K pipeline with no agent control D. Disabling retrieval for agents entirely

> [!success]- Answer
> **B** — standardized function-calling/MCP interfaces give an agent a consistent, structured way to request retrieval as part of its own reasoning, rather than a rigid always-retrieve pipeline.

**19.** A regulated use case requires prompt template changes to go through review before reaching production. What AWS capability most directly supports this?
A. Amazon Polly B. Bedrock Prompt Management with parameterized templates and approval workflows C. AWS Snowcone D. Amazon Route 53

> [!success]- Answer
> **B** — Prompt Management supports versioned, parameterized templates plus approval workflows, the governance mechanism this scenario requires.

**20.** A multi-step prompt sequence with conditional branching needs to be reviewable by non-engineer business stakeholders. What fits best?
A. Hardcoded prompt chains in application code B. Bedrock Prompt Flows C. A single giant prompt string D. AWS Snowball

> [!success]- Answer
> **B** — Prompt Flows' visual, low-code orchestration makes multi-step prompt logic reviewable by non-engineers, unlike logic buried in application code.

## Domain 2 – Implementation and Integration (Q21–37)

**21.** Which AWS-native frameworks are purpose-built for building agentic systems with memory and multi-agent coordination? **(Select TWO)**
A. Strands Agents B. AWS Agent Squad C. Amazon Route 53 D. AWS Direct Connect E. Amazon Polly

> [!success]- Answer
> **A, B** — both are AWS-native agent frameworks supporting memory/state management and multi-agent coordination.

**22.** An agent needs to break a complex task into structured reasoning steps (ReAct pattern) in a way that's observable and auditable. What service implements this as a state machine?
A. AWS Step Functions B. Amazon Route 53 C. Amazon SNS D. AWS Direct Connect

> [!success]- Answer
> **A** — Step Functions can implement ReAct-style reasoning loops as an explicit, observable state machine rather than an opaque in-process loop.

**23.** An agent's reasoning loop has no maximum iteration count. What's the primary risk, and what addresses it?
A. No risk — agents self-terminate naturally B. Unbounded cost/runtime risk; add explicit stopping conditions via Step Functions C. The risk is only aesthetic D. Guardrails alone fully solve this

> [!success]- Answer
> **B** — a loop with no bound can, in principle, continue indefinitely, driving unbounded cost and latency; explicit stopping conditions (max iterations/timeout) are required.

**24.** Two specialized agents (pricing and inventory) contribute to one recommendation and occasionally disagree, stalling the workflow. What's missing?
A. A bigger foundation model for both agents B. Explicit aggregation/arbitration logic for resolving disagreement C. More IAM permissions D. A faster network connection

> [!success]- Answer
> **B** — multi-agent coordination requires defined logic (tie-breaking rule, arbitration step, escalation) for combining or resolving conflicting outputs.

**25.** A high-stakes agent action should pause for human approval before proceeding. What AWS pattern supports this?
A. Step Functions orchestrating a review/approval step B. Removing the agent's IAM role entirely C. Disabling the agent D. Amazon Route 53 failover

> [!success]- Answer
> **A** — Step Functions can orchestrate an explicit human-review/approval step as part of the workflow, pausing agent progress until approved.

**26.** An agent occasionally passes malformed parameters to a tool it calls. What structurally prevents this from breaking the tool?
A. A stronger prompt instruction only B. Lambda-based parameter validation/error handling in front of the tool invocation C. Removing the tool entirely D. Increasing the model's context window

> [!success]- Answer
> **B** — a model's output (including tool-call arguments) can never be fully trusted; a validation layer before actual tool execution is the structural fix, not prompt wording alone.

**27.** A tool an agent uses needs to maintain state across multiple invocations over an extended duration. Lambda or ECS-based MCP server?
A. Lambda, always B. ECS, since it supports persistent, longer-running, stateful execution better suited to this requirement C. Neither — use DynamoDB alone D. Amazon Route 53

> [!success]- Answer
> **B** — ECS fits complex, stateful, or long-running tool operations; Lambda fits lightweight, stateless tool access.

**28.** An LLM-serving container is sized based on request-per-second volume like a typical web service, and GPU utilization is inconsistent with token throughput as the actual bottleneck. What's wrong?
A. Nothing, this is correct sizing B. LLM containers should be sized around token processing capacity and GPU utilization, not raw request count C. The container needs more IAM permissions D. The Region is wrong

> [!success]- Answer
> **B** — LLM inference resource needs scale with token volume, not request count; sizing by request count under/over-provisions relative to actual load.

**29.** A support app sends every query (simple and complex alike) to the same flagship model, and cost is high relative to value on simple queries. What deployment pattern addresses this?
A. Provisioned Throughput for everything B. Model cascading — route simple queries to a cheaper/faster model, escalate only when needed C. Disable Guardrails to save cost D. Reduce the context window to zero

> [!success]- Answer
> **B** — tiered model usage matches cost to actual query complexity instead of paying flagship-model cost uniformly.

**30.** Which pattern best supports incorporating FM capabilities into existing enterprise systems without tight coupling?
A. Direct synchronous calls hardcoded into every legacy system B. Event-driven architectures / API-based integrations for loose coupling C. Removing all existing systems and rebuilding D. Disabling IAM

> [!success]- Answer
> **B** — event-driven and API-based integration patterns let FM capabilities be incorporated without tightly coupling to legacy system internals.

**31.** Which two AWS services support routing external triggers into GenAI-enhanced application logic via events? **(Select TWO)**
A. Amazon EventBridge B. AWS Lambda (as a webhook handler) C. Amazon Route 53 D. AWS Direct Connect E. Amazon Polly

> [!success]- Answer
> **A, B** — EventBridge for event-driven integration, Lambda for handling webhooks that trigger GenAI logic.

**32.** A cross-border deployment must keep GenAI processing available on-premises for a facility with strict local data-processing needs, while still integrating with cloud-hosted FMs. Which AWS offering fits this hybrid need?
A. AWS Outposts B. Amazon Polly C. Amazon Route 53 D. AWS Snowmobile

> [!success]- Answer
> **A** — Outposts extends AWS infrastructure on-premises, supporting hybrid cloud/on-premises data integration for cases needing local processing.

**33.** Which AWS services support implementing a secure, automated CI/CD pipeline for GenAI application components, including security scanning? **(Select TWO)**
A. AWS CodePipeline B. AWS CodeBuild C. Amazon Route 53 D. Amazon Polly E. AWS Direct Connect

> [!success]- Answer
> **A, B** — CodePipeline orchestrates the deployment pipeline; CodeBuild runs automated testing/security-scanning steps as part of it.

**34.** A batch job summarizing 10,000 documents overnight is implemented as 10,000 sequential synchronous Bedrock calls from one Lambda function, and frequently times out. What's the better architecture?
A. A bigger Lambda memory allocation only B. Asynchronous processing via Amazon SQS with a worker pool C. Switch to Provisioned Throughput only D. Reduce to 100 documents

> [!success]- Answer
> **B** — this is a batch/offline workload with no need for immediate synchronous responses; SQS-based async processing with parallel workers fits and avoids the single-function timeout/sequential bottleneck.

**35.** Users perceive a chat application as slow despite acceptable total generation time. What fixes perceived (not actual) latency?
A. A smaller model B. Response streaming via Bedrock streaming APIs C. Disabling retrieval D. Reducing IAM permissions

> [!success]- Answer
> **B** — streaming shows tokens as they're generated, directly addressing perceived latency without changing total processing time.

**36.** A team's Bedrock integration retries every failed request immediately in a tight loop, worsening performance during a throttling event. What's missing?
A. A bigger EC2 instance B. Exponential backoff (AWS SDK) plus a circuit breaker/fallback C. More Guardrails policies D. A different embedding model

> [!success]- Answer
> **B** — immediate tight-loop retries amplify load on an already-struggling resource; exponential backoff plus a circuit breaker is the correct resilience pattern.

**37.** Which service provides cross-service distributed tracing to diagnose where latency/failure originates across API Gateway → Lambda → Bedrock call chains?
A. AWS X-Ray B. Amazon Route 53 C. AWS Direct Connect D. Amazon Polly

> [!success]- Answer
> **A** — X-Ray provides the cross-service tracing needed to pinpoint which layer in a multi-service chain is causing latency or failure.

## Domain 3 – AI Safety, Security, and Governance (Q38–50)

**38.** Which Bedrock Guardrails capability specifically prevents sensitive personal information from appearing in generated output?
A. Denied topics B. PII redaction C. Latency optimization D. Model versioning

> [!success]- Answer
> **B** — PII redaction is the Guardrails policy type specifically targeting personal data in generated output.

**39.** A RAG financial assistant is grounded in retrieved documents but occasionally states numeric figures not actually present in the source content, with high confidence. What addresses this specific gap?
A. Increasing temperature B. Confidence scoring and semantic similarity verification against retrieved content C. Removing RAG entirely D. A larger context window

> [!success]- Answer
> **B** — grounding reduces but doesn't eliminate hallucination; verifying specific claims against retrieved content catches details the model fabricated despite grounding.

**40.** Which of the following are part of a defense-in-depth safety architecture for FM applications? **(Select TWO)**
A. Pre-processing input filters (e.g. Comprehend) B. Post-processing output validation (e.g. Lambda) C. Relying on a single Guardrails policy alone D. No monitoring, trusting the model E. Disabling all logging

> [!success]- Answer
> **A, B** — defense-in-depth layers controls at input, generation, and output stages; a single control (or no monitoring) is explicitly insufficient for high-stakes use cases.

**41.** A chatbot is manipulated via a crafted prompt telling it to "ignore all previous instructions." Standard content moderation didn't catch this because the user wasn't requesting harmful content directly. What's the missing control category?
A. Prompt injection / jailbreak detection B. Data residency controls C. Cost anomaly detection D. IAM least privilege

> [!success]- Answer
> **A** — this is an instruction-override attempt, a distinct threat class from generic harmful-content requests, requiring detection mechanisms aimed specifically at manipulation patterns.

**42.** Which AWS networking feature isolates Bedrock API traffic from a VPC without traversing the public internet?
A. VPC endpoint (PrivateLink) B. Amazon Route 53 C. AWS Direct Connect D. Elastic Load Balancing

> [!success]- Answer
> **A** — a VPC endpoint via PrivateLink keeps Bedrock traffic within the AWS network boundary.

**43.** Which service is purpose-built to discover and classify sensitive data already at rest in S3 buckets feeding a GenAI pipeline?
A. Amazon Macie B. Amazon Comprehend C. AWS CloudTrail D. Amazon CloudWatch

> [!success]- Answer
> **A** — Macie performs at-rest discovery/classification of sensitive data in S3; Comprehend is the real-time text-stream PII detector, a distinct but related tool.

**44.** A compliance review finds customer prompt/response logs retained indefinitely in CloudWatch Logs, well past the organization's 90-day retention policy. What was the gap?
A. Retention policy wasn't applied to prompt/response logs, only to source documents B. Nothing is wrong, logs should be retained forever C. Guardrails should have deleted the logs automatically D. This is a Macie configuration issue

> [!success]- Answer
> **A** — prompts and generated outputs are themselves a data-retention surface (often containing customer data) and need the same lifecycle/retention policy as source documents.

**45.** What is a SageMaker programmatic model card used for?
A. Billing configuration B. Standardized documentation of a model's intended use, limitations, and characteristics C. IAM policy definition D. Network routing configuration

> [!success]- Answer
> **B** — model cards are structured, standardized documentation artifacts describing intended use and limitations, supporting governance/compliance.

**46.** Which service automatically tracks data lineage for GenAI data pipelines, answering "where did this data come from"?
A. AWS Glue B. Amazon Polly C. Amazon Route 53 D. AWS Direct Connect

> [!success]- Answer
> **A** — Glue supports automatic data lineage tracking and Data Catalog registration for systematic source attribution.

**47.** A model's fairness evaluation was conducted once, at launch, six months ago. Is this sufficient governance for an ongoing production system?
A. Yes, fairness doesn't change over time B. No — continuous bias-drift monitoring is needed since usage patterns and data distributions can shift after launch C. Yes, as long as Guardrails are enabled D. No, but only if the model itself was retrained

> [!success]- Answer
> **B** — fairness characteristics can drift as real-world usage evolves; a one-time evaluation doesn't capture that ongoing drift, requiring continuous monitoring.

**48.** Which capability provides user-facing insight into why an agent reached a particular conclusion, supporting transparency?
A. Bedrock agent tracing (reasoning traces) B. AWS Direct Connect C. Amazon Route 53 D. Elastic Load Balancing

> [!success]- Answer
> **A** — agent tracing exposes the reasoning path behind a decision, supporting both audit and user-facing explainability.

**49.** Which approach is used for automated, systematic fairness evaluation of FM outputs at scale?
A. LLM-as-a-Judge combined with predefined fairness metrics and A/B testing B. Manual spot-checking only, once C. Ignoring fairness until a complaint is filed D. Increasing the model's context window

> [!success]- Answer
> **A** — systematic, repeatable fairness evaluation uses defined metrics plus LLM-as-a-Judge and A/B testing; manual, reactive spot-checking is not systematic.

**50.** A company wants to guarantee its chatbot never discusses a denied topic, even under adversarial prompting. Is a strongly worded system prompt instruction sufficient?
A. Yes, a strong instruction is a complete guarantee B. No — a prompt is a request the model can fail to follow; a Bedrock Guardrail with a denied-topics policy provides actual enforcement C. Yes, if temperature is set to 0 D. Yes, if the model is the largest available

> [!success]- Answer
> **B** — prompt instructions are not enforcement; Guardrails apply policy independent of whether the model "chooses" to comply, which is what a guarantee actually requires.

## Domain 4 – Operational Efficiency and Optimization for GenAI Applications (Q51–58)

**51.** A chatbot's per-request cost is high even with an appropriately-sized model, because every request includes full conversation history and full retrieved documents. What's the most direct fix?
A. Switch to a bigger model B. Token efficiency techniques: context pruning and prompt compression C. Add more Guardrails D. Increase Provisioned Throughput

> [!success]- Answer
> **B** — reducing tokens sent per request (trimming history, summarizing retrieved content) is the cheapest, most direct cost lever, before any infrastructure change.

**52.** A semantic cache reduces cost significantly but occasionally serves an answer that doesn't quite match the user's specific question. What's the fix?
A. Disable caching entirely B. Tighten the similarity threshold for cache hits, accepting a lower hit rate for correctness C. Increase the model's temperature D. Switch to exact-match caching for everything, always

> [!success]- Answer
> **B** — a too-loose similarity threshold causes near-miss cache hits; tightening it trades some cost savings for correctness, the right call when accuracy matters.

**53.** Provisioned Throughput is configured for a workload, but utilization is consistently well below provisioned capacity. What does this indicate?
A. The model is too small B. Capacity wasn't matched to actual traffic via proper capacity planning — right-size down or move to On-Demand C. Guardrails are misconfigured D. The Region is wrong

> [!success]- Answer
> **B** — this is a utilization/capacity-planning problem: paying for guaranteed capacity that isn't being used indicates the provisioning wasn't matched to real traffic patterns.

**54.** A team applies batching strategies (originally built for an offline document-processing job) to a new real-time chat feature, to "keep costs consistent." What's wrong?
A. Nothing, batching always helps B. Batching trades throughput efficiency for added latency, unsuitable for a real-time, latency-sensitive interactive use case C. Batching only works with SageMaker D. Batching is a security anti-pattern

> [!success]- Answer
> **B** — batching is a throughput optimization appropriate for async/offline work; applying it to real-time interactive workloads introduces unacceptable latency.

**55.** Which lever most directly reduces perceived (not actual total) latency for long FM-generated responses?
A. Response streaming B. A larger context window C. Provisioned Throughput D. Data masking

> [!success]- Answer
> **A** — streaming changes when the user starts seeing output, addressing perceived latency; total generation time is unchanged.

**56.** A RAG system's total response time is dominated by the retrieval step, not generation. Which optimization directly targets this?
A. Prompt compression B. Vector index optimization and query preprocessing C. A smaller generation model D. Response streaming

> [!success]- Answer
> **B** — retrieval latency is a separate bottleneck from generation latency; index optimization and query preprocessing target the retrieval step specifically.

**57.** During a traffic pattern shift toward more token-heavy, complex queries at flat request volume, auto-scaling configured around request-per-second fails to react in time. What's misconfigured?
A. Auto-scaling should be disabled entirely B. Auto-scaling triggers should be based on token processing volume, not just request count, for GenAI workloads C. The Region needs to change D. IAM policies are too permissive

> [!success]- Answer
> **B** — GenAI resource strain correlates with tokens processed, not request count; auto-scaling tuned only for request volume misses token-driven load spikes.

**58.** Which combination best supports proactively identifying that a feature's hallucination rate is trending upward over time?
A. CloudWatch custom metrics tracking hallucination rate, combined with anomaly detection B. AWS Direct Connect monitoring C. Standard uptime/latency dashboards alone D. Amazon Route 53 health checks

> [!success]- Answer
> **A** — GenAI-specific quality metrics (hallucination rate) tracked in CloudWatch with anomaly detection catch quality trends that standard infrastructure dashboards (uptime/latency) are blind to.

## Domain 5 – Testing, Validation, and Troubleshooting (Q59–65)

**59.** A team evaluates a new model version using only LLM-as-a-Judge scoring, ships it after seeing a quality improvement, and user satisfaction later declines. What was the evaluation gap?
A. LLM-as-a-Judge alone can share biases with the model being judged; human feedback and A/B/canary testing should complement it B. Nothing — LLM-as-a-Judge is a perfect ground truth C. The model version number was wrong D. Guardrails should have been disabled during evaluation

> [!success]- Answer
> **A** — LLM-as-a-Judge is fast/scalable but not a sole source of truth; pairing it with human feedback and real-traffic testing catches gaps automated judging misses.

**60.** A RAG system's final-answer quality score is mediocre. Before upgrading the (costly) generation model, what should be evaluated first?
A. Retrieval quality specifically (relevance scoring, context matching), to isolate whether retrieval or generation is the actual bottleneck B. The AWS Region C. The IAM policy attached to the Bedrock role D. The VPC configuration

> [!success]- Answer
> **A** — a good generation model can't compensate for poor retrieved context; isolating which stage (retrieval vs. generation) is actually underperforming should precede a costly model upgrade decision.

**61.** An agent's individual step outputs score well on fluency/relevance metrics, but the agent frequently fails to complete assigned multi-step tasks. What evaluation dimension was missing?
A. Task completion rate and tool usage effectiveness B. Token count per request C. Embedding dimensionality D. VPC endpoint configuration

> [!success]- Answer
> **A** — agent evaluation needs task-completion and tool-usage-specific metrics; per-response quality metrics alone can't detect an agent that produces fluent text while still failing the overall task.

**62.** A document-summarization feature occasionally misses content from later sections of long documents with no error raised. What's the likely cause?
A. Context window overflow with silent truncation B. A Guardrails misconfiguration C. An IAM permissions issue D. A vector store outage

> [!success]- Answer
> **A** — content exceeding the model's context window can be silently truncated with no exception raised; diagnosis requires actively checking for truncation, not waiting for an error.

**63.** An application's Bedrock-response parsing code intermittently throws errors. Before proposing a fix, what should be determined first?
A. Whether the failure is on the request side (malformed requests) or the response side (parsing assumptions violated) B. The AWS Region C. The embedding model in use D. The IAM role's creation date

> [!success]- Answer
> **A** — request-side and response-side integration issues have different fixes; isolating which side is actually failing should precede any fix attempt.

**64.** A RAG system's retrieval quality has degraded gradually over six months with no configuration changes made in that time. What's the most likely category, and first diagnostic step?
A. Retrieval drift — check embedding quality and drift monitoring first, since the corpus or query patterns likely shifted B. A prompt engineering problem — rewrite the prompt C. An IAM misconfiguration D. A Guardrails false positive

> [!success]- Answer
> **A** — since technical configuration hasn't changed, degradation without a configuration change points to drift (corpus or usage pattern shift) rather than a static configuration or prompt-design flaw.

**65.** A prompt template that worked reliably for months now frequently produces malformed output, though the template itself was never edited. What kind of issue is this, and what should be checked?
A. A prompt engineering problem — the template was never designed correctly B. A prompt maintenance/drift issue — check CloudWatch Logs for signs of model confusion correlated with input changes, or an underlying model version change C. A vector store issue D. A billing issue

> [!success]- Answer
> **B** — "used to work, now doesn't, unedited" is the signature of prompt maintenance/drift (usage pattern shift or provider-side model version change behind the same model ID), distinct from a prompt that was never well-designed in the first place.

## Next
Once this mock is scored and reviewed, log every miss in [Missed Questions Log](Missed Questions Log.md) with a link to the relevant deep note before attempting a second timed pass.


## Linked from

- [AIP-C01 Exam Prep — Everything Needed to Pass](index.md)
- [Missed Questions Log](Missed%20Questions%20Log.md)
- [Rapid Recall Cram Sheet](Rapid%20Recall%20Cram%20Sheet.md)
- [Service Selection Drill](Service%20Selection%20Drill.md)
