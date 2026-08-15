---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "4.1"
---

# Cost Optimization for GenAI Workloads

<small>11 min read</small>

> **Core idea:** GenAI cost scales with tokens processed, not requests handled — a genuinely different shape than traditional application cost, and one that makes "how many tokens does this actually need to send" the first question worth asking, before any infrastructure change.

## The concept, explained

If you're used to optimizing cloud costs for traditional applications, your instincts are mostly still useful here, but the *unit of cost* has changed, and that changes where you look first. A traditional API request costs roughly the same regardless of what's in it. An FM request's cost is driven by token count — and token count is wildly variable per request, in a way raw request-count-based cost models were never built to capture. Keep that difference in mind, and the four levers in this task organize themselves naturally.

**Token efficiency is the cheapest lever, and it's worth trying first, before anything infrastructure-related.** If a request includes an entire prior conversation history, plus several retrieved documents in full, you're paying for all of that on every single call — whether or not it's actually needed. Context pruning (trimming history to what's relevant), prompt compression (summarizing rather than including full retrieved content), and response-size controls all directly reduce the token count you're billed for, with no new infrastructure required. This is genuinely the first thing to check when a scenario describes unexpectedly high per-request cost with an appropriately-sized model already in use.

**Model selection is the same cost-capability match you already met in the deployment lessons, viewed through the cost lens specifically.** Tiered usage — routing simple queries to a cheaper model, escalating only when needed — pays off specifically when query complexity varies meaningfully across the workload. If it doesn't vary, the routing logic is pure overhead with no corresponding savings, which is worth remembering as its own small trap.

**Throughput and utilization is about making sure capacity you're already paying for is actually being used.** This is a subtler point worth understanding precisely: if you have Provisioned Throughput configured and a cost review finds utilization consistently well below what's provisioned, the problem isn't that Provisioned Throughput is a bad choice — it's that the *capacity planning* wasn't matched to real traffic patterns. You're paying for guaranteed capacity that's sitting mostly idle. The fix is either right-sizing the provisioned capacity down to match actual usage, or — if the traffic is genuinely more bursty than sustained — moving that workload back to On-Demand entirely, since Provisioned Throughput's whole value proposition doesn't apply to a traffic shape that isn't actually sustained and predictable.

**Caching is where this task gets genuinely interesting, because there's a real trade-off buried inside it that the exam tests directly.** Exact-match caching (deterministic request hashing) only serves a cached response when a request is *literally identical* to one already answered — safe, but low hit rate, because natural-language requests rarely repeat verbatim. **Semantic caching** matches on meaning instead of exact text, which gives a much higher hit rate — but here's the catch: it risks serving a cached answer to a request that's *similar but not actually equivalent* to the one that was cached. That's a real correctness risk, traded for cost savings, and a strong answer proposing semantic caching should also address how that risk is bounded — typically by tuning the similarity threshold, and falling back to a fresh invocation whenever the match confidence is too low. There's also a privacy dimension worth knowing: a semantic cache serving one user's previously-cached (and potentially personalized) response to a *different* user is a real data-leakage bug, not just a caching edge case — caches need to be scoped correctly per user or tenant when responses could contain personalized content.

## Quick check

> [!question]- A team implements semantic caching for an FAQ-style assistant, and cost drops significantly. Shortly after, users start reporting occasionally receiving answers that don't quite match their specific question. What's the likely cause, and the fix?
> Think about what "semantic" caching is actually matching on, and what happens when that match is too loose.

> [!success]- Answer
> The semantic similarity threshold for cache hits is set too loosely, causing the cache to serve a previously-cached answer for a question that's similar but not actually equivalent to the new one. The fix is tightening the similarity threshold — accepting a somewhat lower cache-hit rate (and therefore slightly higher cost) in exchange for correctness — or falling back to a fresh FM invocation whenever the match confidence is below a stricter bar.

## How this plays out in practice

Picture a customer support chatbot with unexpectedly high per-request cost, using an appropriately-sized model. Investigation shows every request includes the full prior conversation history and several retrieved documents in full text. Before touching the model or the infrastructure at all, the direct fix is context pruning and prompt compression — reducing what's actually sent on each call.

Picture a team with Provisioned Throughput configured for a workload, where a cost review reveals utilization is consistently well below the provisioned capacity. The lesson here isn't "Provisioned Throughput was a mistake" — it's that the capacity wasn't matched to real traffic via proper planning, and either right-sizing down or moving to On-Demand fixes the actual gap.

Picture monthly FM spend spiking 4x with no corresponding increase in user traffic. The right first move is AWS Cost Anomaly Detection combined with token usage tracking, to isolate exactly which request pattern is driving the spike — the two most plausible root causes worth checking are a prompt/context bug that started sending far more tokens per request than intended, or a runaway agentic workflow (connecting back to the agent lessons) looping without a proper stopping condition.

## What the exam is actually testing

- **"Use a bigger model" is not automatically the safer, correctness-preserving choice when cost matters.** Matching model size to task complexity is consistently rewarded, and it isn't in tension with correctness when a smaller model genuinely meets the capability bar.
- **A semantic caching proposal that doesn't acknowledge its correctness risk is an incomplete answer.** A strong answer names how the near-miss risk is bounded, not just that caching saves money.
- **Batching (throughput optimization) is the wrong lever for interactive, latency-sensitive workloads** — it belongs to async/offline processing specifically, a distinction worth double-checking whenever a scenario mixes cost optimization with a real-time user-facing feature.
- **Token-efficiency techniques should be tried before infrastructure-level changes** when a scenario doesn't specifically describe sustained high volume — it's the cheapest lever and requires no new infrastructure.

## Practice questions
Write your own answer first — then expand.

**1.** A customer support chatbot's per-request cost is unexpectedly high even with an appropriately-sized model, because every request includes full conversation history and several retrieved documents in full. What's the most direct fix?
> [!success]- Answer
> Token-efficiency techniques: context pruning (trim history to what's relevant) and prompt compression (summarize retrieved documents rather than including them in full) — the cheapest, most direct lever, tried before any infrastructure change.

**2.** A semantic cache reduces cost significantly but users report occasionally receiving answers that don't quite match their specific question. What's the fix?
> [!success]- Answer
> Tighten the similarity threshold for cache hits, accepting a lower hit rate (and somewhat higher cost) in exchange for correctness, or fall back to a fresh invocation when match confidence is below a stricter bar.

**3.** A team has Provisioned Throughput configured, but a cost review shows actual utilization consistently well below provisioned capacity. What does this indicate, and what are two possible fixes?
> [!success]- Answer
> It indicates the provisioned capacity wasn't matched to real traffic patterns via proper capacity planning. Fixes: right-size the Provisioned Throughput down to match actual usage, or — if traffic is genuinely bursty rather than sustained — move the workload back to On-Demand entirely.

**4.** A batching strategy built for an offline document-processing job is later reused for a new real-time chat feature, "to keep costs consistent." What's wrong with this reuse?
> [!success]- Answer
> Batching trades throughput efficiency for added latency (waiting for a batch to fill before processing), which is fine for offline work but introduces unacceptable delay for a real-time, latency-sensitive chat feature. Cost-optimization techniques need to match the workload's actual latency requirements, not just be reused wherever cost matters.

**5.** Monthly FM spend spikes 4x with no corresponding increase in user traffic. What's the recommended first diagnostic step, and two plausible root causes?
> [!success]- Answer
> Use AWS Cost Anomaly Detection combined with token usage tracking to isolate the exact request pattern driving the spike. Two plausible causes: a prompt/context bug causing bloated token counts per request, or a runaway agentic workflow without a proper stopping condition looping far more than intended.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A news aggregator's article-summarization feature sends the entire original article, plus the last 20 messages of unrelated chat history from the user's session, plus three retrieved "related articles" in full text, on every single summarization request — even though the model only needs the target article to do its job. Monthly costs have grown far faster than user traffic. What's the highest-leverage first fix?
A. Move to Provisioned Throughput to lock in predictable pricing B. Token efficiency: stop sending irrelevant chat history and unnecessary full related-article text on a request that only needs the target article — context pruning and prompt compression directly cut the token volume driving the cost, with no infrastructure change required C. Add a semantic cache in front of the whole pipeline D. Switch to a smaller, cheaper model

> [!success]- Answer
> **B.** This is a clear case of unnecessary tokens being sent on every call — completely unrelated chat history and full related-article text that the summarization task doesn't actually need. Fixing that directly, at essentially zero engineering cost, should come before any infrastructure or model change. (A doesn't address wasted tokens at all, it just changes the pricing model. C might help for exact repeat requests but summarization requests are likely mostly unique, so cache hit rate would be low. D reduces quality-per-token cost but doesn't fix the underlying waste — you'd still be sending irrelevant content, just to a cheaper model.)

**Scenario 2.** A team implements a semantic cache for their internal IT-helpdesk chatbot, and cost drops by 60%. A few weeks later, an employee reports the bot gave them password-reset instructions for a completely different internal system than the one they asked about, and investigation shows this happened because a semantically similar (but not identical) past question's cached answer was served. What's the right way to fix this without abandoning the cache entirely?
A. Disable caching entirely B. Tighten the semantic similarity threshold required for a cache hit, accepting somewhat lower cache-hit-rate (and cost savings) in exchange for not serving near-miss answers, and fall back to a fresh model call when confidence is below that stricter bar C. Switch to exact-string-match caching for every single query type, regardless of use case D. Increase the cache's storage size

> [!success]- Answer
> **B.** This is the semantic-caching correctness trade-off playing out exactly as expected — the fix isn't to abandon a genuinely valuable cost optimization, it's to tune the similarity threshold more conservatively so near-miss answers stop being served as if they were exact matches. (A throws away a working, valuable optimization instead of tuning it. C would work but sacrifices almost all of the cache's benefit for a helpdesk bot where users rarely phrase the same question identically. D doesn't address the correctness problem at all — it's a capacity fix for an accuracy problem.)

**Scenario 3.** A company configures Bedrock Provisioned Throughput sized to handle their busiest hour of the day (9-10am, when support volume peaks). A cost review six months later shows this capacity sits at roughly 15% utilization for 20 of the 24 hours in a typical day. The infrastructure lead argues this is "the cost of guaranteeing no throttling during peak hour" and shouldn't be changed. Evaluate this reasoning.
A. The reasoning is entirely correct and no change is needed B. The reasoning conflates "guaranteed peak capacity" with "the only possible way to get it" — a hybrid approach (Provisioned Throughput sized closer to a sustained baseline, with On-Demand or a secondary tier absorbing the genuine peak hour) could preserve the peak-hour guarantee while eliminating most of the 20 hours of paid-for idle capacity C. The company should abandon Provisioned Throughput entirely and accept peak-hour throttling D. The company should increase Provisioned Throughput further, to guarantee capacity for future growth too

> [!success]- Answer
> **B.** The infrastructure lead isn't wrong that peak-hour reliability matters, but sizing fixed, expensive, guaranteed capacity for the *rare peak* rather than the *typical baseline* is exactly the utilization-mismatch failure mode this task warns about — a hybrid sizing approach can preserve what actually matters (no peak-hour throttling) while cutting the substantial idle-capacity waste. (A accepts a real, quantified inefficiency without examining alternatives. C over-corrects, discarding a real and valid need (peak-hour reliability) entirely. D compounds the described problem rather than fixing it.)

## Go deeper
[10 - Cost Optimization](../../aws-genai-developer-aip-c01/10 - Cost Optimization.md) — the full architecture-reasoning version.

## Next
[16 - Performance Optimization](16 - Performance Optimization.md)


## Linked from

- [AIP-C01 Exam Prep — Everything Needed to Pass](../index.md)
- [Responsible AI Principles](14%20-%20Responsible%20AI%20Principles.md)
