---
tags: [aws, certification, genai-developer-professional, bedrock]
exam: AIP-C01
domain: "1 — Foundation Model Integration, Data Management, and Compliance"
tasks: [1.1, 1.2]
---

# Bedrock Model Catalog, Selection & Integration Patterns

<small>9 min read</small>

## Core concept
Bedrock's value isn't "managed access to FMs" — you know that from AIF-C01. The AIP-C01 question is: **given a specific business constraint (latency SLA, cost ceiling, regional availability, data residency, need for guaranteed throughput), which model and which invocation pattern satisfies it, and how do you build the integration so the model choice isn't hardcoded into your application?** Model selection at this level is an ongoing architectural decision, not a one-time pick — models get deprecated, cheaper/better options ship constantly, and a production system that can't swap models without a code deploy is already behind.

The production framing that matters: every Bedrock integration has three separable concerns that get conflated in weak designs — **which model** (capability/cost/latency), **how you call it** (on-demand vs provisioned vs cross-region), and **how your app is decoupled from that choice** (so changing any of the first two doesn't require redeploying business logic).

## Service comparison
| Need | Choice | Why |
|---|---|---|
| Consume a pretrained FM via API, no infra to manage | Amazon Bedrock | Default answer whenever the requirement is "call a foundation model," full stop |
| Guaranteed throughput / reserved capacity for predictable high volume | Bedrock **Provisioned Throughput** | Fixed hourly cost buys guaranteed capacity — the only way to get a throughput SLA, on-demand can throttle under load |
| Variable, unpredictable request volume | Bedrock **On-Demand** | Pay per token/request, no capacity commitment, but subject to throttling at shared-capacity limits |
| A model isn't available (or is capacity-constrained) in your primary Region | Bedrock **Cross-Region Inference** | Routes inference to another Region transparently — but this moves data cross-region, a real compliance consideration, not just a technical one |
| You already have your own fine-tuned model weights and want them served through the same managed API as built-in models | Bedrock **Custom Model Import** | Brings externally-trained weights into Bedrock's invocation layer, avoiding a separate SageMaker endpoint just to serve them |
| Full control over training infrastructure, custom algorithms, or a model class Bedrock doesn't offer | Amazon SageMaker AI | The escape hatch when Bedrock's catalog and customization features genuinely don't cover the requirement — not the default |
| Parameter-efficient customization (LoRA, adapters) for a narrow domain task | SageMaker AI to deploy the adapted model, or Bedrock's own fine-tuning/customization where supported | Full retraining is usually the wrong answer when the actual need is "adapt behavior for one domain" |

## Trade-offs & failure modes
- **On-Demand vs Provisioned Throughput is a latency-predictability trade, not just a cost trade.** On-Demand can throttle (`ThrottlingException`) under shared-capacity contention — fine for bursty, latency-tolerant workloads, unacceptable for a customer-facing SLA. Provisioned Throughput removes that risk at a fixed cost regardless of actual usage — the wrong choice for spiky, low-average-volume traffic (you pay for idle capacity).
- **Cross-Region Inference is a resilience pattern with a hidden data-residency cost.** It exists specifically for Skill 1.2.3's "continuous operation during service disruptions" and for models with limited regional availability — but it means inference *payloads cross Region boundaries*. A design that enables this for a workload with strict data-residency requirements (GDPR, data sovereignty) is a real, exam-relevant failure mode, not a hypothetical.
- **Model-swap-without-code-change is an abstraction problem, not a Bedrock feature.** Bedrock doesn't give you this for free — you build it: route model selection through configuration (AWS AppConfig) rather than hardcoded model IDs, behind a thin invocation layer (Lambda + API Gateway) so business logic calls "the current model for task X," never a specific model ID directly.
- **Customization lifecycle needs the same rigor as any deployed artifact.** SageMaker Model Registry for versioning, automated deployment pipelines to roll out updated fine-tuned models, and — critically — a **rollback strategy** for when a new model version regresses quality. Treating a fine-tuned model as a one-way deploy with no rollback path is the failure mode this skill exists to prevent.
- **Graceful degradation needs a defined fallback, not just a retry.** Step Functions-based circuit-breaker patterns should have an explicit fallback behavior (smaller/faster backup model, cached response, degraded feature) — "retry the same failing call" is not a resilience pattern.

## Security & cost considerations
- **IAM least privilege on `bedrock:InvokeModel`** scoped to specific model ARNs where possible — a service role with blanket Bedrock access is over-permissioned for most integration patterns.
- **VPC endpoints (PrivateLink)** for Bedrock calls from within a VPC avoid traversing the public internet — relevant whenever the scenario mentions a regulated or security-sensitive workload.
- **Cost-capability trade-off is the recurring exam theme for Task 1.2.1**: the correct model is the *smallest/cheapest model that meets the capability bar*, not the most capable model available. A scenario describing a simple classification or extraction task paired with a flagship large model in the answer choices is usually testing whether you'll over-provision capability.
- **Provisioned Throughput cost is fixed regardless of utilization** — recommending it for a workload explicitly described as low-volume or bursty is a cost-optimization failure the exam will test directly (this connects forward to [10 - Cost Optimization](10 - Cost Optimization.md)).

## Troubleshooting signals
| Symptom | Likely cause | Fix direction |
|---|---|---|
| Intermittent `ThrottlingException` under load | On-Demand shared capacity limits reached | Move to Provisioned Throughput, or implement exponential backoff/retry (connects to [06 - FM Deployment and API Integration](06 - FM Deployment and API Integration.md)) |
| Requests failing only in certain Regions | Model not available in that Region, or regional capacity exhausted | Cross-Region Inference, or explicit multi-region deployment with routing |
| A newly deployed fine-tuned model produces worse outputs than the previous version | No evaluation gate before promotion, or a bad rollback plan | SageMaker Model Registry versioning + automated quality gates before promotion (connects to [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md)); rollback to prior registered version |
| Application code changes required every time the team wants to test a new model | Model ID hardcoded in business logic | Introduce a config-driven model-selection layer (AppConfig-backed) |

## Exam traps & decision rules
- **Trap: "always recommend the newest/largest model."** Decision rule: match model capability to the task's actual requirement; a smaller model meeting the bar wins on cost and often latency.
- **Trap: "Cross-Region Inference is purely a performance feature."** Decision rule: it's also a data-movement decision — a question combining "strict data residency" with "model unavailable in-Region" is testing whether you'll still reach for Cross-Region Inference without flagging the compliance conflict.
- **Trap: "any customization need means build a SageMaker training pipeline."** Decision rule: check whether Bedrock's own customization/fine-tuning or Custom Model Import satisfies the requirement first — reaching for full SageMaker training is the answer only when Bedrock's catalog and customization genuinely can't cover it (and remember: model *training* itself is out of scope for this exam's target role).
- **Trap: "Provisioned Throughput is always better because it's guaranteed."** Decision rule: guaranteed capacity you don't need is wasted cost — Provisioned Throughput is correct only when the scenario describes sustained, predictable, high volume with a real throughput SLA.

## Rapid recall
- On-Demand = variable/bursty, pay-per-use, can throttle. Provisioned Throughput = sustained/predictable, fixed cost, guaranteed capacity.
- Cross-Region Inference = resilience + limited-regional-availability fix, but crosses data-residency boundaries.
- Custom Model Import = serve your own already-fine-tuned weights through Bedrock's managed API.
- Model selection should be config-driven (AppConfig/Lambda/API Gateway), never hardcoded — this is what "dynamic model selection without code changes" means.
- Customization lifecycle = Model Registry (versioning) + automated pipelines + explicit rollback strategy.
- Cost-capability trade-off: smallest model that clears the bar, not the biggest available.

## Practice questions
Write your own answer first — then expand.

**1.** A team's application currently calls a hardcoded Bedrock model ID directly from business logic. Product wants to A/B test three different models without redeploying the application. What's the correct architecture change?

> [!success]- Answer
> Introduce a configuration-driven model-selection layer — e.g. AWS AppConfig holding the current model ID(s) per use case, read by a thin Lambda/API Gateway invocation layer that business logic calls generically ("invoke the model for task X"). This decouples model choice from application code entirely, so swapping models (or A/B testing) is a config change, not a deploy.

**2.** A workload requires strict EU-only data residency. The preferred model is only available in a non-EU Region. What should you flag as the core conflict, and what's the safer path?

> [!success]- Answer
> Cross-Region Inference would resolve the availability gap but routes inference payloads outside the EU, directly conflicting with the residency requirement — this is the trap, not a free resilience win. The safer path is selecting an EU-available model (even if less capable) or deploying/hosting a customized model within an EU Region via SageMaker, rather than accepting the cross-region data movement.

**3.** A customer support summarization feature runs at low, unpredictable volume (occasional bursts, mostly idle). An engineer proposes Provisioned Throughput "to guarantee performance." Is this the right call?

> [!success]- Answer
> No — Provisioned Throughput has a fixed cost regardless of utilization, so paying for guaranteed capacity against a mostly-idle, bursty workload wastes money on unused reserved throughput. On-Demand with retry/backoff for occasional throttling fits this traffic shape far better; Provisioned Throughput is justified only by sustained, predictable, high-volume traffic with a genuine throughput SLA.

**4.** A newly promoted fine-tuned model version is producing subtly worse outputs in production, discovered two days after rollout. What two things does this expose as missing from the deployment process?

> [!success]- Answer
> A quality gate before promotion (an evaluation step that should have caught the regression before it reached production — see [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md)) and a fast rollback path (the ability to revert to the prior known-good registered model version via SageMaker Model Registry immediately upon detecting regression, rather than scrambling to diagnose and fix forward).

**5.** A scenario describes a straightforward document-classification task (a handful of fixed categories, short input text) and offers a flagship, highest-capability foundation model as one answer choice alongside a smaller, cheaper model. Which is generally the better answer, and why is this pattern common on the exam?

> [!success]- Answer
> The smaller, cheaper model — provided it can clear the accuracy bar for a well-defined, narrow classification task. This pattern (simple task + oversized model as a distractor) directly tests Task 1.2.1's "cost-capability tradeoff evaluation" skill: the exam consistently rewards matching capability to actual requirement over defaulting to the most powerful available option.

## Related
[README - Syllabus](README - Syllabus.md) · [02 - Vector Stores and Embeddings](02 - Vector Stores and Embeddings.md) · [06 - FM Deployment and API Integration](06 - FM Deployment and API Integration.md) · [10 - Cost Optimization](10 - Cost Optimization.md) · [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md)


## Linked from

- [AWS Certified Generative AI Developer - Professional (AIP-C01)](index.md)
- [AWS Certified Generative AI Developer – Professional (AIP-C01) — Syllabus](README%20-%20Syllabus.md)
- [Bedrock Model Selection & Solution Design](../aip-c01-exam-prep/Lessons/01%20-%20Bedrock%20Model%20Selection%20and%20Solution%20Design.md)
- [Cost Optimization for GenAI Workloads](10%20-%20Cost%20Optimization.md)
- [FM Deployment Strategies and API Integration Patterns](06%20-%20FM%20Deployment%20and%20API%20Integration.md)
- [Model Evaluation Systems for GenAI](13%20-%20Model%20Evaluation%20Systems.md)
- [Vector Stores and Embeddings for FM Augmentation](02%20-%20Vector%20Stores%20and%20Embeddings.md)
