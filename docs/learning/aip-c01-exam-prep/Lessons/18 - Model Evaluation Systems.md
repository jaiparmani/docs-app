---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "5.1"
---

# Model Evaluation Systems for GenAI

> **Core idea:** "Is this a good response" doesn't have a clean objective metric the way traditional ML accuracy does. This task is about building systematic, repeatable evaluation despite that — the opposite of someone eyeballing a few outputs and declaring it looks fine.

## The concept, explained

Traditional ML evaluation is comparatively easy: you usually have a clear correct answer, and metrics like accuracy or F1 score capture how close you got. GenAI evaluation doesn't have that luxury — "is this response relevant, factually accurate, consistent, and well-written" is inherently more subjective and multi-dimensional. This task is about the discipline of evaluating anyway, systematically, rather than giving up on rigor because the target is fuzzier.

**Bedrock Model Evaluations** is the AWS-native starting point — a service purpose-built for running automatic and/or human evaluation jobs comparing FM outputs, whether you're comparing two candidate models or checking a single model's outputs against a reference. Layered on top of that, **A/B testing and canary testing** apply the same deployment-safety discipline you'd use for any software change: expose a new model or prompt version to a subset of real traffic before committing to it fully, rather than betting everything on offline evaluation alone.

Here's the idea worth understanding precisely: **LLM-as-a-Judge is genuinely useful, and it's also genuinely limited, and the exam wants you to hold both of those at once.** Using an FM to evaluate another FM's outputs is fast, scalable, and far cheaper than human review at scale — but the judge model can share systematic blind spots or biases with the model it's evaluating, since it's ultimately the same kind of system doing the judging. The mature answer isn't "avoid LLM-as-a-Judge" — it's "treat it as one signal among several," pairing it with human feedback (especially for anything high-stakes) rather than trusting it as a sole source of truth. A scenario where a team relies solely on LLM-as-a-Judge scoring to make a full production rollout decision, and then discovers real users are unhappy despite the good automated scores, is testing exactly this gap.

The next idea is one you've now seen in several different forms across this exam, applied here specifically to evaluation: **a RAG system's evaluation needs to separate retrieval quality from generation quality.** If you only measure the final answer's quality, a mediocre score can't tell you whether the fix is a better generation model or better retrieved context — and upgrading an expensive generation model when the actual problem is retrieval wastes money and doesn't fix anything. Retrieval-specific evaluation — relevance scoring, context matching verification — needs to happen as its own step, before you commit to a model upgrade based on a blended score.

**Agent evaluation needs its own distinct dimension: did the task actually get done.** This is worth understanding as a genuinely different question from "did each individual response look good." An agent can produce fluent, plausible-sounding text at every single step of a multi-step task while still failing to actually accomplish the task — calling the wrong sequence of tools, stopping prematurely, looping without converging. Standard per-response quality metrics (fluency, relevance) are blind to this failure mode entirely, because each individual output can look fine in isolation. Task completion rate and tool usage effectiveness are the metrics that actually catch it.

Finally, tying back to the deployment lessons: **model comparison needs to weigh cost and latency alongside quality, not quality alone.** When two candidate models score nearly identically on a quality benchmark, the model with meaningfully lower cost or latency is very often the better real-world choice — evaluating purely on the quality axis and ignoring the operational dimensions can lead you to the wrong decision even when the quality comparison itself was done correctly.

And the umbrella principle across all of this: **evaluation is a continuous process, not a one-time pre-launch gate.** Every subsequent prompt edit, model version update, or retrieval pipeline change is a fresh opportunity for a silent regression — continuous evaluation workflows with automated regression testing and quality gates in the deployment pipeline are what actually catch that, not a single evaluation done once at launch and never revisited.

## Quick check

> [!question]- A team evaluates a new model version using only LLM-as-a-Judge scoring against their previous model, sees a clear quality improvement, and ships it. Two weeks later, user satisfaction scores decline. What evaluation gap likely explains this?
> Consider what LLM-as-a-Judge can and can't be trusted to catch on its own.

> [!success]- Answer
> Relying solely on LLM-as-a-Judge without complementary human feedback. The judge model may share systematic biases or blind spots with the model being evaluated, or simply fail to capture what real users actually value in a response. A more robust evaluation would have paired the automated scoring with human feedback collection — and ideally an A/B or canary test against real traffic — before committing to a full rollout.

## How this plays out in practice

Picture a RAG application with a mediocre final-answer quality score, and a team assuming the generation model needs an expensive upgrade. Before making that costly decision, evaluating retrieval quality specifically — relevance scoring, context matching — could reveal that retrieval is actually the weak link, and no generation model upgrade would fix that; the answer would be improving retrieval instead.

Picture an agent-based workflow where every individual step's output scores well on standard fluency and relevance metrics, but the agent frequently fails to actually complete the multi-step tasks it's assigned. Task completion rate and tool usage effectiveness are the metrics that would have caught this — standard response-quality scoring simply can't see it, because each step looked fine on its own.

Picture two candidate models scoring nearly identically on a quality benchmark, with the team defaulting to whichever scored marginally higher without considering anything else. If the marginally-lower-scoring model has meaningfully better cost and latency characteristics, it may well be the better overall choice — a decision that requires bringing cost-performance analysis into the evaluation, not quality score alone.

## What the exam is actually testing

- **LLM-as-a-Judge presented as sufficient on its own for a high-stakes decision is a repeated trap.** Pair it with human feedback for anything that matters.
- **Evaluating a RAG system only on final answer quality is an incomplete evaluation.** Retrieval quality needs to be assessed separately, especially before committing to an expensive generation-model upgrade.
- **Evaluating an agent the same way you'd evaluate a simple FM response** — with standard quality metrics only — misses task-completion failures entirely. Agent evaluation needs its own dimension.
- **Treating evaluation as a one-time, pre-launch activity is a recurring wrong answer** for scenarios describing an actively-evolving production system. Continuous evaluation with regression testing is the expected answer there.

## Practice questions
Write your own answer first — then expand.

**1.** A team evaluates a new model version using only LLM-as-a-Judge scoring, sees a quality improvement, and ships it — then user satisfaction declines two weeks later. What evaluation gap explains this?
> [!success]- Answer
> Relying solely on LLM-as-a-Judge without human feedback — the judge model can share biases or blind spots with the model it's evaluating, and can miss what real users actually value. Pairing automated scoring with human feedback and real-traffic testing before a full rollout closes this gap.

**2.** A RAG application's final-answer quality score is mediocre. The team assumes the generation model needs upgrading. What should be evaluated first, before that potentially costly decision?
> [!success]- Answer
> Retrieval quality specifically — relevance scoring and context matching verification — to determine whether retrieval or generation is actually the bottleneck. If retrieval is returning poor context, no generation model upgrade will fix the underlying problem.

**3.** An agent's individual outputs score well on fluency and relevance at every step, but it frequently fails to complete the multi-step tasks it's assigned. What evaluation dimension was missing?
> [!success]- Answer
> Task completion rate and tool usage effectiveness — metrics measuring whether the overall task was actually accomplished, which standard per-response quality metrics can't detect since each individual step's output can look fine in isolation.

**4.** Two candidate models score nearly identically on quality, and the team picks the marginally higher-scoring one without further analysis. What might they be missing?
> [!success]- Answer
> Cost-performance analysis — token efficiency, latency, and overall cost. When quality scores are nearly tied, the model with meaningfully better cost or latency characteristics is often the better real-world choice, and ignoring that dimension can lead to a worse net decision.

**5.** A prompt template is edited to fix a specific issue and deployed directly to production with no automated pre-deployment check, inadvertently degrading a different, previously-working use case of the same template. What process would have caught this?
> [!success]- Answer
> An automated regression testing / quality gate step in the deployment pipeline — running the updated template against a continuous evaluation suite covering all known use cases before promoting it to production, catching the regression before it reached users.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A startup builds a new customer-service model version and evaluates it purely by having an LLM-as-a-judge system score 500 sample responses against the previous version, across dimensions like helpfulness and tone. The new version scores meaningfully higher on every dimension, so the team ships it to 100% of production traffic immediately. Within days, real customer satisfaction ratings for the new version are noticeably lower than the old version's had been. What evaluation step, if it had been included, most likely would have caught this before full rollout?
A. A larger sample size for the LLM-as-a-judge evaluation B. A canary or A/B test exposing the new version to a subset of real production traffic first, combined with human feedback collection, rather than trusting the LLM-as-a-judge score alone as sufficient grounds for a full rollout C. Running the same LLM-as-a-judge evaluation twice for confirmation D. Switching to a bigger LLM as the judge

> [!success]- Answer
> **B.** This is the LLM-as-a-judge limitation played out concretely — offline automated scoring looked great, but real user preference diverged from it, which is exactly the gap that staged rollout (canary/A-B testing) against real traffic, plus human feedback, is meant to catch before committing fully. (A doesn't address the type of gap involved — more samples scored the same (flawed) way doesn't help. C repeats the same limited method rather than diversifying the evaluation approach. D doesn't fix the underlying blind-spot-sharing concern, since a bigger judge model can still share correlated biases.)

**Scenario 2.** A travel-booking company's RAG-based FAQ assistant has a declining answer-quality score. Without further investigation, the team commits budget and two months of engineering time to fine-tune a more expensive, more capable generation model, expecting this to fix the decline. After the fine-tuned model ships, the quality score barely improves. What evaluation step, done before committing to the fine-tuning project, would likely have avoided this wasted effort?
A. A bigger fine-tuning dataset would have fixed it B. Retrieval-specific evaluation (relevance scoring, context-matching verification) done first, to determine whether the actual bottleneck was retrieval quality rather than generation quality — if retrieval was the real issue, no amount of generation-model improvement would meaningfully help C. Running the evaluation with a lower temperature setting D. Asking the original (unmodified) model the same questions twice for consistency

> [!success]- Answer
> **B.** This is exactly the wasted-effort scenario the retrieval-vs-generation evaluation split is meant to prevent — committing two months of engineering to the wrong layer of the pipeline because the actual bottleneck (retrieval) was never isolated and checked first. (A assumes the fine-tuning approach itself was correct and just needed to be bigger, which doesn't address whether generation was even the right thing to fine-tune in the first place. C and D are unrelated diagnostic steps that wouldn't reveal a retrieval-vs-generation bottleneck.)

**Scenario 3.** A logistics company's warehouse-routing agent is evaluated purely on whether each individual step's language output "sounds reasonable" to a human reviewer skimming transcripts — and by that measure, it scores well. Operationally, however, warehouse staff report the agent frequently fails to actually complete routing tasks, sometimes stopping partway through or looping between two options without ever finalizing a route. What evaluation dimension was never actually measured, and why does the existing "sounds reasonable" review miss it?
A. Nothing was missed; sounding reasonable at each step is sufficient evidence of good performance B. Task completion rate and tool-usage effectiveness were never measured — an agent can produce individually plausible-sounding text at every step while still failing to actually accomplish the overall multi-step task, a failure mode that per-step "does this sound reasonable" review is structurally unable to detect C. The fix is simply increasing the agent's context window D. The fix is switching to a non-agentic, single-prompt approach entirely

> [!success]- Answer
> **B.** This is the agent-evaluation gap stated at its clearest — reviewing individual steps in isolation for plausibility says nothing about whether the sequence of steps actually converges on a completed task, which is precisely why task-completion-rate and tool-usage-effectiveness metrics exist as a distinct evaluation dimension for agents specifically. (A is the exact blind spot this scenario is built to expose. C doesn't address a completion/looping problem. D abandons the agentic approach entirely rather than adding the missing evaluation dimension that would let the team actually diagnose and fix the real issue.)

## Go deeper
[13 - Model Evaluation Systems](../../aws-genai-developer-aip-c01/13 - Model Evaluation Systems.md) — the full architecture-reasoning version.

## Next
[19 - Troubleshooting GenAI Applications](19 - Troubleshooting GenAI Applications.md)
