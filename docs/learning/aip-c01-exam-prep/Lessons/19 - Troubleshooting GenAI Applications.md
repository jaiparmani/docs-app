---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "5.2"
---

# Troubleshooting GenAI Applications

> **Core idea:** This is the applied counterpart to everything else in the exam — monitoring tells you something's wrong, evaluation tells you whether quality is acceptable, this task is about diagnosing root cause once you know something's broken. There are five distinct failure categories, and the exam's real test is whether you can correctly classify a symptom into the right one, because the fix genuinely differs across them.

## The concept, explained

GenAI troubleshooting requires a different instinct than typical application debugging, and it's worth naming why up front: failures here are often *soft* — a plausible-looking wrong answer — rather than *hard*, like an exception or a crash. You can't just read a stack trace to find the bug. That's why this task's diagnostic tools (context-window diagnostics, embedding quality checks, drift monitoring) exist — they're built for failures that don't announce themselves.

Let's walk through the five categories, because distinguishing them correctly is the actual skill being tested.

**Content handling / context overflow** is a genuinely sneaky failure mode, because it's often silent. If input exceeds a model's context window, content gets truncated to fit — and the model answers based on whatever's left, without necessarily raising any error. A document-summarization feature that occasionally misses content from the later sections of long documents, with no exception ever thrown, is the signature of this failure. You have to actively check for truncation (comparing actual token counts against the model's context limit) rather than waiting for an error that may never come.

**FM integration issues** need to be isolated to one specific question before you can fix them: is the problem on the request side, or the response side? A request-side problem (malformed parameters, wrong API usage) needs a completely different fix than a response-side problem (your application's parsing code making assumptions about response format that the model occasionally violates). Conflating these — trying to fix a parsing bug when the actual issue is a malformed request, or vice versa — wastes debugging effort on the wrong layer entirely.

**Prompt engineering problems** describes a prompt that was never quite right to begin with — producing inconsistent results across similar inputs, where ad hoc edits haven't reliably helped. The fix here is moving to systematic prompt testing with structured version comparison, rather than continuing to tweak and hope.

**Retrieval system issues** have the widest diagnostic surface of any category in this task, because retrieval genuinely has the most independent points of failure: the embedding model might be a poor domain fit, the chunking strategy might be losing context, the index or search configuration might be misconfigured, or — a specific and easy-to-miss case — the corpus or query patterns might have simply *drifted* since the system was last tuned, with no configuration changes at all needed to cause it. This last case is worth sitting with: if retrieval quality was strong at launch and has degraded gradually over months, with nobody having touched the chunking strategy or vector store configuration in that time, the most likely explanation isn't a configuration problem (nothing changed) — it's that the underlying corpus or how users are actually querying it has shifted, and the system needs to be retuned to match that new reality.

**Prompt maintenance issues** are the ones people most often confuse with plain prompt engineering problems, and the distinction matters a lot for where you look. A prompt engineering problem is "this was never quite right." A prompt maintenance issue is "this used to work fine, and now it doesn't" — even though nobody edited the template. That specific shape — unedited template, previously reliable, now degraded — points somewhere different: either the range of inputs flowing through the template has shifted over time (new use cases reusing an old template it wasn't designed for), or, less obviously, the underlying model behind the same Bedrock model ID was updated on the provider's side, quietly shifting behavior without any change on your end. CloudWatch Logs reviewed for signs of the model growing "confused" is the first place to look.

One more genuinely useful practical tool that spans several of these categories: **AWS X-Ray's cross-service tracing.** A single user-facing failure can originate several layers upstream of where it's actually noticed — a retrieval call, a prompt construction step, the FM call itself, all chained together. Without distributed tracing across that chain, figuring out which specific layer actually introduced the problem is mostly guesswork; X-Ray gives you a single correlated view of the whole request path instead.

## Quick check

> [!question]- A document-summarization feature occasionally produces summaries that clearly missed content from the later sections of long input documents, with no error ever raised. What's the likely root cause, and how would you confirm it?
> This is the silent-failure category from this lesson — work through why no error appears.

> [!success]- Answer
> Context window overflow with silent truncation — the input document exceeds the model's context window, and the excess content (typically from the later sections) gets cut off before reaching the model, with no exception raised since truncation is often handled quietly rather than treated as an error. Confirm it by checking actual token counts of the affected documents against the model's context limit, then fix it with dynamic chunking or hierarchical summarization so all content is represented within the window instead of silently dropped.

## How this plays out in practice

Picture a Bedrock-integrated application that intermittently throws parsing errors in the code processing model responses. Before proposing any fix, the team needs to determine whether the failure is request-side (malformed requests triggering unexpected responses) or response-side (the parsing code assuming a response shape the model doesn't always honor) — these have different fixes, and guessing at the wrong one wastes time.

Picture a RAG system whose retrieval quality was strong at launch but has noticeably degraded over six months, with no changes made to chunking or vector store configuration in that time. Since the technical configuration itself hasn't changed, the likely explanation is drift — the underlying corpus or how users are querying it has shifted — and checking embedding quality and drift signals is the right first step, not assuming a configuration problem that, by definition, can't exist if nothing was actually changed.

Picture a prompt template that performed reliably for months, then recently started producing inconsistent, sometimes off-target responses — with nobody having edited the template itself. This is a prompt maintenance issue, not a prompt engineering problem, and the first place to look is CloudWatch Logs for signs of model confusion correlated with a shift in the kinds of inputs the template is now handling, or evidence of an underlying provider-side model version change behind the same model ID.

## What the exam is actually testing

- **Classifying the symptom correctly, before proposing a fix, is the actual skill.** Treating every "bad output" as a prompt engineering problem is the single most common mistake — a retrieval-caused bad answer isn't fixed by tweaking the prompt.
- **Context overflow doesn't always raise a visible error.** The correct instinct is to actively check for truncation, not wait for an exception that may never come.
- **Retrieval troubleshooting requires isolating the actual failure point** (embedding, chunking, indexing, or drift) rather than guessing and changing everything at once — a scenario describing a specific symptom points to one specific cause, not a blanket "re-embed everything and hope."
- **"It never worked well" and "it used to work and now it doesn't" are genuinely different diagnostic categories**, and reading the scenario carefully for which one is being described is what points you to prompt engineering versus prompt maintenance.

## Practice questions
Write your own answer first — then expand.

**1.** A document-summarization feature occasionally misses content from later sections of long input documents, with no error raised. What's the likely root cause?
> [!success]- Answer
> Context window overflow with silent truncation — input exceeding the model's context window gets cut off, typically from the later sections, without raising an exception. Confirm via context window overflow diagnostics comparing actual token counts to the model's limit, then fix with dynamic chunking or summarization.

**2.** A Bedrock-integrated application intermittently throws parsing errors in its response-handling code. What should be determined before attempting a fix?
> [!success]- Answer
> Whether the failure is on the request side (malformed requests, wrong API usage) or the response side (parsing logic making assumptions about response format the model occasionally violates) — these require different fixes, so isolating which side is failing should come first.

**3.** A RAG system's retrieval quality was strong at launch but has degraded gradually over six months, with no configuration changes made in that time. What's the most likely category of issue, and the first diagnostic step?
> [!success]- Answer
> Retrieval drift — since the technical configuration hasn't changed, the underlying corpus or user query patterns have likely shifted. Check embedding quality and drift monitoring first, rather than assuming a configuration problem when nothing was actually configured differently.

**4.** A prompt template performed reliably for months, then recently started producing inconsistent output, even though the template itself was never edited. What kind of issue is this, and what's the first thing to check?
> [!success]- Answer
> A prompt maintenance issue (drift), not a prompt engineering problem, since the template hasn't changed. Check CloudWatch Logs first for signs of model confusion correlated with a shift in the kinds of inputs now flowing through the template, or for evidence of an underlying provider-side model version change behind the same model ID.

**5.** A new feature calling Bedrock synchronously fails under moderate load with timeout errors, and the team wants to know whether the bottleneck is API Gateway, Lambda, or the Bedrock call itself. What tool directly supports this diagnosis?
> [!success]- Answer
> AWS X-Ray, providing cross-service distributed tracing across the full request chain — without it, pinpointing which specific layer is causing the timeout requires guessing or manually adding logging at every layer separately.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A publishing company's book-manuscript-review assistant works well for short stories but consistently produces feedback that ignores plot developments in the final third of full-length novels submitted for review, with no error message ever appearing in the application logs. The team initially suspects the model simply isn't very good at long-form analysis. What should be checked first, and what's the likely actual cause?
A. Immediately switch to a different foundation model provider B. Check whether the manuscripts are exceeding the model's context window and being silently truncated — the "ignores the final third" pattern, with no error raised, is the classic signature of context overflow, not a model-capability limitation C. Increase the temperature setting D. The likely cause is a Guardrails misconfiguration

> [!success]- Answer
> **B.** "Consistently misses later content, no error raised" is precisely the silent-truncation fingerprint — before concluding the model lacks capability, check whether the actual full manuscript is even reaching the model, since content exceeding the context window is often quietly cut off rather than triggering a visible failure. (A jumps to a drastic, expensive fix before diagnosing the actual cause. C affects output randomness, unrelated to whether content is being truncated. D is a distractor — Guardrails govern content safety, not context-length handling.)

**Scenario 2.** A team's application occasionally throws parsing exceptions when processing Bedrock responses, and a developer's first instinct is to add broader exception-handling ("just catch and ignore any parsing error") around the response-parsing code, without investigating further. A colleague suggests this masks rather than fixes the problem. What should actually be determined first, and why does the colleague's concern matter?
A. The developer's fix is fine — silently catching errors is always acceptable B. Whether the failure originates on the request side (malformed requests producing unexpected responses) or the response side (parsing code assuming a response shape the model doesn't always honor) — broadly swallowing exceptions without this diagnosis risks silently discarding real, systematic failures that a proper fix (request validation or more robust/schema-enforced parsing) would actually resolve C. The fix is to increase the request timeout D. The fix is to switch to a synchronous invocation pattern

> [!success]- Answer
> **B.** The colleague is right to push back — broadly suppressing exceptions doesn't fix anything, it just hides the symptom, and could mask a systematic request- or response-side bug that would otherwise be caught and properly resolved once correctly isolated to one side or the other. (A endorses exactly the anti-pattern the colleague is flagging. C and D don't address a parsing-exception problem at all — they're unrelated to whether requests or responses are malformed.)

**Scenario 3.** A company's document-search RAG assistant, launched a year ago, performed well initially. Over the past several months, without any changes to chunking configuration, embedding model, or vector store settings, retrieval relevance has been gradually declining, and support tickets about "the assistant doesn't understand our questions anymore" have increased. In the same period, the company expanded significantly into a new product line with substantially different terminology than what existed at launch. What's the most likely explanation, and where should the team look first?
A. The vector store hardware is degrading with age B. Retrieval drift — the corpus and query vocabulary have shifted significantly with the new product line, while the system's chunking, embeddings, and indexing were tuned against the original, now-outdated corpus and terminology; check embedding quality and drift signals against the new product line's content first C. The embedding model provider changed the model without telling them D. Users have simply forgotten how to phrase questions correctly

> [!success]- Answer
> **B.** No configuration changed, but the world the system operates in did — a major new product line with different terminology is exactly the kind of real-world shift that causes retrieval drift without touching a single setting, and it's a specific, checkable cause rather than a vague "something's wrong." (A is not a real failure mode for cloud-managed vector store infrastructure. C is possible in principle but isn't suggested by anything in the scenario, whereas the product-line expansion is directly stated and highly relevant. D blames users rather than examining a concrete, verifiable system-side cause.)

## Go deeper
[14 - Troubleshooting GenAI Applications](../../aws-genai-developer-aip-c01/14 - Troubleshooting GenAI Applications.md) — the full architecture-reasoning version.

## Closes the full lesson set
All 19 official tasks across all 5 domains now have a lesson. Next: update the folder README with the full lesson index, then start layering in additional scenario-heavy practice per lesson.
