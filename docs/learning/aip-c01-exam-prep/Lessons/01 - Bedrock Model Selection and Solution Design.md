---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "1.1, 1.2"
---

# Bedrock Model Selection & Solution Design

<small>11 min read</small>

> **Core idea:** Model selection is a constrained optimization — capability vs. cost vs. latency vs. context window vs. regional availability — and your architecture must let that choice change without a redeploy.

## The concept, explained

You already know Bedrock gives you managed API access to foundation models. What this exam actually tests is a level below that: given a specific, concrete constraint — a latency SLA, a cost ceiling, a data-residency rule, a need for guaranteed throughput — which model do you pick, and how do you call it?

Think of every Bedrock integration as having three separate decisions bundled together, and the exam wants you to keep them separate in your head:

1. **Which model** — this is a capability/cost/latency trade-off. A bigger, more capable model isn't automatically the right answer; it's the right answer only when the task genuinely needs that capability.
2. **How you call it** — on-demand (pay per token, can throttle under load) or provisioned throughput (fixed cost, guaranteed capacity). This is really a question about your traffic shape, not about which option is "better."
3. **How your application is decoupled from both of those choices** — so that changing the model or the invocation method later doesn't mean a code deploy.

Let's walk through each.

**On-Demand vs. Provisioned Throughput** isn't a "which is better" question — it's a traffic-shape question. On-Demand bills you per token/request with no capacity commitment, which is great when your traffic is bursty or unpredictable, but it can throttle (return a `ThrottlingException`) if you're competing for shared capacity during a spike. Provisioned Throughput reserves capacity at a fixed hourly cost, guaranteeing you won't be throttled — but you're paying that fixed cost whether you're using the capacity or not. So the real question isn't "which is more reliable," it's "does this workload have sustained, predictable, high volume (Provisioned Throughput) or bursty, unpredictable volume (On-Demand)?"

**Cross-Region Inference** is where the exam likes to set a trap. It exists to solve two real problems: a model isn't available in your Region, or your Region is capacity-constrained. Bedrock will transparently route your inference request to another Region where the model *is* available. That sounds like a pure win — until you remember that routing the request means your data (the prompt, potentially sensitive) physically leaves your Region. If a scenario mentions strict data-residency requirements (GDPR, data sovereignty, "must stay in the EU") *and* a model that's only available in a different Region, Cross-Region Inference is not a free fix — it directly creates the compliance problem the scenario is worried about. The correct move there is usually to pick a model that *is* available in the required Region, even if it's less capable.

**Custom Model Import** solves a narrower problem: you already have a fine-tuned model (trained outside Bedrock, maybe on SageMaker) and you want to serve it through Bedrock's managed invocation API instead of standing up a separate SageMaker endpoint just for serving. This is different from fine-tuning *within* Bedrock — Custom Model Import is specifically about bringing in weights you already have.

**Decoupling your application from the model choice** is the piece candidates most often skip, and it's the one the exam rewards heavily. If your business logic calls `bedrock.invoke("anthropic.claude-v2")` directly, then swapping models — for an A/B test, for a cost optimization, because the old model got deprecated — means editing and redeploying code. The fix is to put model selection behind a configuration layer: something like AWS AppConfig holding "the current model for this use case," read by a thin Lambda/API Gateway layer that your business logic calls generically. Now swapping models is a config change, not a deploy. This is the concrete, buildable answer to "how do you support dynamic model selection."

**Customization lifecycle** matters because a fine-tuned model isn't a one-time artifact — it needs versioning (SageMaker Model Registry), a deployment pipeline, and critically, a **rollback plan**. If a newly-promoted fine-tuned model quietly produces worse outputs, you need to be able to revert to the last known-good version fast, not scramble to fix forward.

## Quick check

> [!question]- A workload needs a model that's only available outside your required data-residency Region. What's the tempting-but-wrong answer, and what's the safer one?
> Think about what Cross-Region Inference actually *does* to the data, not just whether it solves the availability problem.

> [!success]- Answer
> The tempting answer is Cross-Region Inference — it does solve the "model isn't available here" problem cleanly. But it does so by routing the inference payload to another Region, which directly conflicts with a strict data-residency requirement. The safer answer is to pick a model that's actually available in the required Region, even if it means accepting less capability, or to host a customized/fine-tuned model within that Region instead.

## How this plays out in practice

Picture a latency-critical chat widget doing simple intent classification — "is this a billing question or a technical question." That's a narrow, well-defined task. Reaching for the largest flagship model here is the wrong instinct: a smaller or latency-optimized model that clears the accuracy bar will be faster and cheaper, and the exam consistently rewards recognizing that a task's complexity — not the biggest model available — should drive the choice.

Now picture a team that wants to compare three different models against real production traffic before committing to one. If model selection is hardcoded, that's three separate deploys and three separate rollbacks. If model selection is config-driven, it's three config changes, and the comparison can even run live, side by side.

And picture the EU-residency example from the quick check above, played out fully: a team builds a great RAG application using a model that happens to only be available in `us-east-1`. Someone notices the Region mismatch late, reaches for Cross-Region Inference as an "easy fix," and ships it — not realizing they've just started sending EU customer data to a US Region on every single request. That's the exact failure mode this task area is testing for.

## What the exam is actually testing

A few patterns repeat constantly across this task, and once you notice them you'll catch them fast:

- **The oversized-model distractor.** Whenever a scenario describes a simple, narrow task and one of the answer choices is "use the largest/most capable model," that's almost always the wrong answer. The exam wants you to match capability to actual need.
- **The Provisioned Throughput trap.** "Provisioned Throughput guarantees performance" is a true statement, but it's the wrong recommendation for bursty or low-volume traffic — you'd be paying a fixed cost for capacity you're mostly not using. Watch for scenarios that describe unpredictable or sporadic traffic paired with a Provisioned Throughput answer choice.
- **The Cross-Region residency conflict.** Any time "data residency" and "model unavailable in my Region" show up in the same scenario, the exam is testing whether you'll flag the conflict rather than just solving the availability problem.
- **The reflexive-SageMaker trap.** Not every customization need requires standing up a full SageMaker training pipeline. Check whether Bedrock's own fine-tuning or Custom Model Import already covers the requirement before reaching for the heavier tool — and remember, model *training* itself is explicitly out of scope for this exam's target role, so a question that seems to require deep training knowledge almost certainly has a simpler, Bedrock-native answer.

## Practice questions
Write your own answer first — then expand.

**1.** A team wants to A/B test three Bedrock models without any code deploys. What architecture change enables this?
> [!success]- Answer
> A config-driven model-selection layer — AWS AppConfig holding the current model choice, read by a thin Lambda/API Gateway layer that business logic calls generically ("invoke the model for this task"), rather than a hardcoded model ID. Swapping or testing models becomes a config change, not a deploy.

**2.** A newly promoted fine-tuned model regresses in quality, discovered two days post-launch. What two things were missing from the deployment process?
> [!success]- Answer
> A pre-promotion evaluation/quality gate that should have caught the regression before it reached production, and a fast rollback path (via SageMaker Model Registry versioning) to revert to the prior known-good model version immediately once the regression was noticed.

**3.** A simple document-classification task is paired with a flagship, most-capable model as one of the answer options. Is that the correct choice?
> [!success]- Answer
> No — the smaller, cheaper model that still clears the accuracy bar for this narrow task is the better answer. Matching capability to actual task complexity beats defaulting to "the most capable model available."

**4.** A workload has low-volume, bursty traffic. On-Demand or Provisioned Throughput?
> [!success]- Answer
> On-Demand. Provisioned Throughput's fixed cost against mostly-idle capacity is a cost-optimization failure for this traffic shape — you'd be paying for guaranteed capacity you rarely use.

**5.** What AWS feature lets you serve your own already-fine-tuned model weights through Bedrock's managed API, instead of standing up a separate SageMaker endpoint?
> [!success]- Answer
> Bedrock Custom Model Import.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A healthcare startup is building a clinical-notes summarization tool. Patient data must never leave the `eu-central-1` Region under their data processing agreement. Their preferred foundation model, which tests show has the best summarization quality for medical text, is only available in `us-east-1`. The team is under deadline pressure and a developer suggests enabling Bedrock Cross-Region Inference to unblock the launch this week. What should you recommend?
A. Approve Cross-Region Inference — it's an AWS-managed feature, so it's automatically compliant B. Reject it — Cross-Region Inference would route patient data to `us-east-1`, violating the data processing agreement; select an `eu-central-1`-available model instead, even if summarization quality is somewhat lower C. Approve it, but only for a two-week trial period D. Reject it, and instead train a completely new model from scratch in `eu-central-1`

> [!success]- Answer
> **B.** Cross-Region Inference solves availability, not compliance — it explicitly moves inference payloads across the Region boundary, which directly conflicts with a strict data-residency agreement. The correct move is accepting a less-capable but compliant in-Region model. (A ignores what the feature actually does; C is still a violation, just a smaller one; D reaches for full model training, which is out of scope for this role and wildly disproportionate when Bedrock's own model catalog likely has an EU-compliant option.)

**Scenario 2.** A retail company's product-description generator handles a highly variable workload: near-zero traffic overnight, and sharp bursts during flash sales that can 20x normal volume within minutes. The infrastructure team proposes Bedrock Provisioned Throughput sized for peak flash-sale volume, to guarantee no throttling ever occurs. What's the concern with this proposal, and what's a better fit?
A. No concern — guaranteed capacity is always the safer choice B. Provisioned Throughput sized for peak volume means paying that fixed cost around the clock, including the many hours of near-zero overnight traffic — On-Demand with exponential backoff for the rare throttling case fits this bursty pattern better C. The concern is that Provisioned Throughput doesn't support retail workloads D. There is no way to handle bursty traffic with Bedrock at all

> [!success]- Answer
> **B.** Provisioned Throughput's fixed cost applies whether or not the capacity is being used — sizing it for a rare peak means paying for mostly-idle capacity the vast majority of the time. On-Demand, paired with proper retry/backoff handling for the brief throttling risk during bursts, matches this workload's actual shape far better and is dramatically cheaper on average. (A ignores the real cost trade-off; C and D are simply false.)

**Scenario 3.** An engineering team's GenAI application currently has the Bedrock model ID hardcoded inside their order-processing service's source code. Leadership wants to start testing a newer, cheaper model against the current one, and eventually wants the ability to instantly roll back to the old model if the new one underperforms, without any deployment. What architectural change most directly enables this?
A. Nothing needs to change — just edit the model ID in code and redeploy when needed B. Introduce a configuration-driven model-selection layer (e.g., AWS AppConfig read by a thin Lambda/API Gateway layer) so the active model is a runtime configuration value, not a compiled-in constant C. Duplicate the entire order-processing service, one copy per model D. Always use Bedrock Provisioned Throughput, since it inherently supports multiple models

> [!success]- Answer
> **B.** This is exactly the config-driven model-selection pattern: decoupling which model is "live" from the application's compiled code, so switching (or instantly rolling back) is a configuration change, not a deployment. (A is what they're trying to move away from — a redeploy is required both to change models and to catch a bad rollback. C is unnecessary duplication with no real benefit. D confuses a throughput/capacity setting with a model-selection mechanism — the two are unrelated.)

## Go deeper
[01 - Bedrock Model Catalog and Integration Patterns](../../aws-genai-developer-aip-c01/01 - Bedrock Model Catalog and Integration Patterns.md) — the full architecture-reasoning version of this lesson, with more production trade-off detail.

## Next
[02 - Data Validation and Processing Pipelines](02 - Data Validation and Processing Pipelines.md)


## Linked from

- [AIP-C01 Exam Prep — Everything Needed to Pass](../index.md)
