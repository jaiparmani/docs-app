---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "2.2"
---

# FM Deployment Strategies

<small>9 min read</small>

> **Core idea:** Serving a large language model in production has a different resource-sizing problem than serving a typical web service — because a single request's cost can vary enormously depending on how much text it involves, in a way that "requests per second" doesn't capture.

## The concept, explained

If you've deployed typical stateless services before, your instinct for capacity planning is probably "count requests per second, size accordingly." That instinct is wrong for LLM serving, and understanding *why* it's wrong is really the whole point of this task.

A typical API request costs roughly the same amount of compute no matter what's in it. An LLM inference request doesn't — a short classification query and a 4,000-token document summary hit the same endpoint but consume wildly different amounts of GPU time and memory. So if you size an LLM-serving container based on requests-per-second (the way you'd size a normal web service), you can end up with a system that looks fine on the metric you're watching while actually being bottlenecked on the metric that matters: **token processing capacity and GPU utilization.** That mismatch — healthy-looking request count, strained token throughput — is exactly the symptom this task wants you to recognize and diagnose correctly.

Beyond sizing, this task covers three deployment options and how to choose between them. **Lambda** fits simple, on-demand invocation of Bedrock. **Bedrock Provisioned Throughput** (you covered this in the model-selection lesson) is for guaranteed capacity under sustained load. **SageMaker AI endpoints** come in when you need infrastructure-level control over a custom-trained model — and here's the thing the exam wants you to notice: this usually isn't an either/or choice between Bedrock and SageMaker. A real architecture often needs *both*, side by side — Bedrock handling the managed, off-the-shelf FM workloads, and SageMaker handling the specific workload that needs custom training infrastructure. Treating "Bedrock vs. SageMaker" as a strict binary is a common wrong turn.

The other big idea in this task is **model cascading**, and it's worth understanding as a specific answer to a specific cost problem, not just a vague "use cheaper models sometimes" idea. Picture a customer support application where most incoming queries are simple FAQ-style questions, and a smaller number are genuinely complex multi-part troubleshooting cases — but the system sends every single query, regardless of complexity, to the same flagship, most-expensive model. That's paying flagship-model cost for questions that a much cheaper, faster model could have handled perfectly well. Model cascading fixes this by routing queries to a smaller/cheaper model first, and escalating to the larger model only when the smaller one's output signals it's needed (low confidence, or an explicit complexity classification step). This only pays off, though, when query complexity genuinely varies across the workload — if every query in a workload is roughly equally complex, cascading adds routing overhead with no corresponding savings, which is worth recognizing as its own trap.

## Quick check

> [!question]- An LLM-serving container is sized based on expected requests-per-second, the same way the team sizes their typical web services. In production, GPU utilization looks inconsistent, and token throughput turns out to be the actual bottleneck. What was wrong with the sizing approach?
> Think about what a "typical web service" sizing assumption gets wrong specifically for LLM inference.

> [!success]- Answer
> Sizing by request count assumes each request costs roughly the same amount of compute, which holds for typical web services but not for LLM inference — a single request's token count (and therefore its GPU/compute cost) can vary enormously. The container should be sized around token processing capacity and GPU utilization specifically, not raw request-per-second volume.

## How this plays out in practice

Picture the support-app model-cascading scenario played all the way through: most incoming tickets are simple ("how do I reset my password") and a smaller fraction are genuinely complex multi-step troubleshooting. Sending everything to the flagship model means paying premium cost for the easy 80% of traffic that a cheap, fast model would have handled just fine. Introduce a routing step — cheap model first, escalate on low confidence or explicit complexity signals — and the average cost per query drops sharply without sacrificing quality on the genuinely hard cases.

Or picture a team that needs both: managed access to off-the-shelf foundation models for most of their application (Bedrock), and full control over a custom-trained model for one specialized workload their business genuinely depends on (SageMaker). The correct architecture uses both together, not one instead of the other.

## What the exam is actually testing

- **"Bedrock vs. SageMaker" is rarely a genuine either/or in scenario questions.** When a scenario describes needs on both sides — managed FM access *and* custom training infrastructure control — the correct answer is usually a hybrid architecture using both.
- **Container/infrastructure sizing questions for LLM serving want token-throughput and GPU-utilization reasoning**, not request-count reasoning. This is one of the most repeated traps in this task specifically.
- **Model cascading is justified when query complexity genuinely varies** across the workload. Don't recommend it reflexively for a workload where every query is roughly equally complex — that's added complexity for no benefit.

## Practice questions
Write your own answer first — then expand.

**1.** An LLM-serving container is sized like a typical web service, by requests-per-second. GPU utilization is inconsistent, and token throughput is the actual bottleneck. What's the fix?
> [!success]- Answer
> Resize the deployment around token processing capacity and GPU utilization specifically, since LLM inference cost scales with tokens processed per request, not with raw request count.

**2.** A customer support application sends both simple FAQ-style queries and complex multi-part troubleshooting queries to the same flagship model, and cost is high relative to the value delivered on the simple queries. What deployment pattern directly addresses this?
> [!success]- Answer
> Model cascading — route queries to a smaller, cheaper model first, and escalate to the larger model only when the smaller model's response indicates the query needs more capability, matching cost to actual query complexity.

**3.** A team needs both managed access to off-the-shelf foundation models and full infrastructure control over a custom-trained model for one specific workload. Should they choose Bedrock or SageMaker?
> [!success]- Answer
> Both, in a hybrid architecture — Bedrock for the managed FM workloads, SageMaker for the specific workload requiring custom training infrastructure control. This is not a strict either/or choice.

**4.** Why wouldn't model cascading be worth the added complexity for a workload where every incoming query is roughly equally complex?
> [!success]- Answer
> Cascading's cost savings come specifically from redirecting the simpler share of a workload away from the expensive model. If complexity doesn't actually vary across the workload, there's no meaningful "simple query" population to redirect, so the added routing logic increases complexity without producing any corresponding cost savings.

**5.** What resource dimension, specific to LLM serving, should drive container capacity planning more heavily than it would for a typical stateless API service?
> [!success]- Answer
> Token processing capacity and GPU utilization — because LLM inference cost per request scales with how much text is involved, which varies far more than the roughly-uniform cost of a typical API request.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A media company deploys an LLM-serving container fleet sized to handle 500 requests per second, matching how they size their other stateless microservices. In production, some requests are one-line headline generations while others are full 2,000-word article summaries — both count as "one request" in their sizing model. GPU utilization spikes unpredictably and the team can't explain why the same request-per-second number sometimes causes problems and sometimes doesn't. What's the core sizing mistake?
A. The container fleet needs more replicas, regardless of anything else B. Sizing was based on request count, which treats a one-line generation and a 2,000-word summary as equivalent — the fleet should be sized around token processing capacity and GPU utilization, which actually varies enormously between those two request types C. The model needs to be retrained D. The issue is unrelated to sizing and is a networking problem

> [!success]- Answer
> **B.** This is the token-vs-request-count mismatch stated as directly as it gets — the same request-per-second figure represents wildly different actual compute loads depending on token volume, which request-count-based sizing can't capture. (A might incidentally help but doesn't address the root cause. C and D are unrelated to the actual described symptom.)

**Scenario 2.** A legal-services company's contract-review chatbot handles two very different query types: "what does clause 4.2 mean" (simple lookups, the majority of traffic) and "compare these two 40-page contracts for material differences" (rare, complex, high-value queries). All queries currently go to the same top-tier, most expensive model. The CFO flags GenAI costs as a top-3 expense line and wants it addressed without hurting the quality of the complex comparisons. What should the team do?
A. Switch everything to a cheaper model uniformly B. Implement model cascading: route simple lookup queries to a smaller, cheaper, faster model, and escalate only the genuinely complex comparison queries to the top-tier model, matching cost to actual query complexity C. Reduce the context window for all queries D. Just accept the cost as a cost of doing business

> [!success]- Answer
> **B.** This is precisely the scenario model cascading exists for — traffic with meaningfully varying complexity, where uniform treatment either overspends on the easy majority or underserves the hard minority. Cascading gets both right at once. (A would likely hurt the complex-comparison quality the CFO explicitly wants preserved. C risks truncating the 40-page contract comparisons, which need substantial context. D ignores an available, well-suited fix.)

**Scenario 3.** A fintech startup needs to deploy a customer-facing chatbot using an off-the-shelf foundation model, and separately needs to deploy a fraud-detection model that their data science team trained entirely in-house on proprietary transaction data, requiring specific infrastructure control over the serving environment. An architect proposes standardizing on SageMaker AI endpoints for both, "to keep the architecture consistent." Is this the best approach?
A. Yes, consistency should always be the top priority B. No — the chatbot is a good fit for managed Bedrock access (no custom training involved), while the fraud-detection model genuinely needs SageMaker's infrastructure control; a hybrid architecture using both, matched to each workload's actual needs, fits better than forcing consistency C. Yes, because SageMaker is always more secure than Bedrock D. No, both should use SageMaker Canvas instead

> [!success]- Answer
> **B.** This is the "Bedrock vs. SageMaker is rarely a true binary" lesson applied directly — the chatbot has no custom-training need Bedrock doesn't already satisfy, while the fraud model's requirements (custom training, infrastructure control) are exactly SageMaker's strength. Forcing both onto the same platform for the sake of consistency ignores what each workload actually needs. (A elevates a stylistic preference over fit-for-purpose. C is an unfounded generalization about security. D misapplies Canvas, a no-code tool, to a workload that needs custom infrastructure control.)

## Go deeper
[06 - FM Deployment and API Integration](../../aws-genai-developer-aip-c01/06 - FM Deployment and API Integration.md) — the full architecture-reasoning version.

## Next
[08 - Enterprise Integration Architectures](08 - Enterprise Integration Architectures.md)
