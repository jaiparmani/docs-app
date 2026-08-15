---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "2.4"
---

# FM API Integration Patterns

<small>10 min read</small>

> **Core idea:** How your application actually talks to an FM — synchronously or asynchronously, streamed or not, retried carefully or carelessly — matters as much as which model you picked. This task is about the calling conventions.

## The concept, explained

Once you've picked a model and figured out how to deploy it, there's a separate set of decisions about how your application code actually invokes it, and this task tests those decisions specifically.

**Synchronous versus asynchronous** comes down to one question: does the caller need an immediate response? A direct Bedrock API call, made synchronously, fits interactive use cases — a chat message, a live query — where someone is waiting on the other end. But picture a batch job that needs to summarize 10,000 documents overnight, implemented as 10,000 sequential synchronous calls from a single Lambda function. That design frequently times out, and even when it doesn't, it's the wrong shape entirely — nothing about "summarize these documents overnight" requires an immediate response to any individual call. The right architecture uses Amazon SQS to queue the jobs, with a pool of workers processing them independently and in parallel. This is really just "match the invocation pattern to whether anyone's actually waiting," applied to FM calls specifically.

**Streaming** is worth understanding precisely, because it's easy to overstate what it actually fixes. Bedrock's streaming APIs, delivered to a client via WebSockets or server-sent events, let tokens appear incrementally as they're generated, instead of the user waiting for the entire response to finish before seeing anything. This is a real, meaningful fix for *perceived* latency — a chat interface that streams feels dramatically more responsive. But it does not reduce the *actual* total time the model takes to generate the full response; that stays the same. If a scenario is asking you to reduce actual total processing time, streaming is the wrong lever — you'd want a smaller model, tighter output-length constraints, or parallelizing independent sub-steps instead. Keep those two things — perceived latency and actual total latency — clearly separate in your head, because the exam will test the distinction directly.

**Resilience** for FM calls follows the same principles as resilience for any distributed system call, just applied here specifically: use the AWS SDK's exponential backoff for retries (never retry immediately in a tight loop — under a throttling event, immediate retries pile more load onto an already-struggling resource, making things worse, not better), add rate limiting at API Gateway, build in fallback mechanisms for graceful degradation when a call fails anyway, and use AWS X-Ray for cross-service tracing so that when something is slow or failing, you can actually see *where* in the chain (API Gateway → Lambda → Bedrock, possibly plus a retrieval call) the problem is happening, instead of guessing.

**Routing** between multiple models is the last piece: static routing (a fixed rule in application config — "requests of type A always go to model X") is simple and predictable, and it's the right choice whenever the correct model for a given request type is knowable ahead of time. Dynamic routing (implemented via Step Functions, reacting to content or live metrics) is more adaptive but genuinely more complex, and it's only worth that complexity when the right model actually depends on conditions that change at runtime — not as a default "more sophisticated must be better" choice.

## Quick check

> [!question]- A team's Bedrock integration retries every failed request immediately in a tight loop. During a period of elevated throttling, this made response times worse for everyone, not just the requests that originally failed. What's missing?
> Think about what immediate, aggressive retries actually do to a resource that's already struggling.

> [!success]- Answer
> Exponential backoff, combined with a circuit breaker or fallback mechanism. Immediate tight-loop retries pile more load onto an already-struggling shared resource, amplifying the very problem they're trying to route around instead of relieving it.

## How this plays out in practice

Picture the overnight batch-summarization job again, fully played out: 10,000 sequential synchronous calls from one Lambda function, timing out repeatedly, because nothing about the design acknowledges that this workload never needed synchronous, immediate responses in the first place. Move it to SQS with a worker pool, and the same job runs in parallel, doesn't time out, and doesn't tie up one function waiting on ten thousand sequential round-trips.

Picture a chat application where users describe it as "feeling slow," even though the backend metrics show the total response time is within an acceptable range. Adding streaming fixes exactly this complaint — because the complaint was about perceived responsiveness, not actual total time, and streaming is precisely the tool for that specific gap.

Picture a request chain — API Gateway, then Lambda, then a Bedrock call, then maybe a retrieval step — where latency spikes intermittently and nobody can tell which link in the chain is actually slow. That's what X-Ray's cross-service tracing exists to answer directly, instead of adding ad hoc logging at every layer and guessing.

## What the exam is actually testing

- **Streaming fixes perceived latency, not actual total processing time.** If a scenario explicitly asks for a reduction in actual total time, streaming is the wrong answer — the exam uses this distinction as a direct test.
- **Any retry strategy in a correct answer needs exponential backoff.** Naive immediate retries are a frequent, deliberately-planted wrong answer choice.
- **Dynamic (Step Functions-based) routing isn't automatically the "better" or more sophisticated answer.** Static routing is simpler and entirely sufficient when the right model per request type is knowable in advance — recommend dynamic routing only when the scenario genuinely describes runtime-dependent routing needs.

## Practice questions
Write your own answer first — then expand.

**1.** A batch job runs 10,000 sequential synchronous Bedrock calls from a single Lambda function and frequently times out. What's the better architecture?
> [!success]- Answer
> Asynchronous processing via Amazon SQS, with a pool of workers processing the jobs independently and in parallel — this workload never needed an immediate synchronous response per document.

**2.** A chat application adds streaming, users report it "feels faster," but a backend metric shows total processing time is unchanged. Was this a successful fix?
> [!success]- Answer
> Yes, for the stated complaint — streaming targets perceived latency specifically, and total generation time being unchanged is expected. It would not be the right fix if the actual requirement were to reduce total processing time, which needs a different lever entirely (smaller model, shorter output, parallelized sub-steps).

**3.** Immediate tight-loop retries during a Bedrock throttling event made response times worse for all users, not just the ones with originally failed requests. What resilience pattern was missing?
> [!success]- Answer
> Exponential backoff (via the AWS SDK), combined with a circuit breaker or fallback mechanism, instead of naive immediate retries that amplify load on an already-struggling shared resource.

**4.** It's unclear which service in a request chain — API Gateway, Lambda, or Bedrock — is causing intermittent latency spikes. What tool diagnoses this?
> [!success]- Answer
> AWS X-Ray, providing cross-service distributed tracing across the full request chain, so you can see exactly where time is being spent instead of guessing.

**5.** A team wants to route requests to different models based on real-time load and quality signals that change over time. Static or dynamic routing?
> [!success]- Answer
> Dynamic routing, implemented via Step Functions reacting to content or live metrics — static routing can't adapt to conditions that change at runtime, which is exactly what this scenario requires.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A publishing company needs to generate SEO-optimized summaries for 50,000 archived articles as a one-time backfill project, with no user waiting on any individual result. The engineering team's initial implementation is a single script making 50,000 sequential synchronous Bedrock calls, which they estimate will take over 30 hours to run and is prone to failing partway through with no easy way to resume. What's the better architecture?
A. Run the same script on a bigger EC2 instance B. Enqueue the 50,000 jobs via Amazon SQS and process them with a pool of parallel workers, since this is a batch workload with no immediate-response requirement — this also naturally supports partial-failure recovery, since unprocessed jobs simply remain in the queue C. Switch to Bedrock streaming APIs to speed up each individual call D. Reduce the number of articles being processed

> [!success]- Answer
> **B.** Nothing about this workload needs synchronous, immediate responses — it's the textbook case for SQS-based async processing with parallel workers, which also solves the resumability problem essentially for free, since failed or unprocessed jobs simply stay queued. (A doesn't fix the sequential bottleneck or the resumability problem. C addresses perceived latency for an interactive use case, which is irrelevant here since nobody is waiting synchronously. D avoids the problem rather than solving it.)

**Scenario 2.** A telehealth company's symptom-checker chatbot displays nothing to the user until the model's full response — often 300+ tokens of guidance — has finished generating, resulting in a multi-second blank screen that user testing shows is causing people to abandon the conversation. The engineering lead argues the actual generation time is within their target SLA, so nothing needs to change. Is the engineering lead's reasoning sound?
A. Yes, if the SLA is met, there's no problem B. No — the SLA measures actual total generation time, but the user-experience problem is about perceived latency (a blank screen while waiting), which streaming the response via Bedrock's streaming APIs would directly address, independent of whether the SLA is technically met C. Yes, and the fix is to shorten the SLA target D. No, the fix is to use a smaller model

> [!success]- Answer
> **B.** This is the perceived-vs-actual-latency distinction tested directly through a business consequence (abandonment) rather than a technical metric — meeting a total-time SLA doesn't mean the user experience is good if there's a long blank-screen period, and streaming is the specific, correct fix for exactly that gap. (A conflates a technical metric with actual user experience. C doesn't address the real problem, which is the *display* pattern, not the time budget. D might help marginally with total time but doesn't address the core blank-screen perception problem the way streaming does.)

**Scenario 3.** A SaaS company's Bedrock integration handles transient errors by catching the exception and immediately retrying the same request, in a loop, up to 10 times with no delay between attempts. During a period of elevated Bedrock throttling, monitoring shows this retry behavior actually increased the throttling rate further and degraded response times for unrelated, healthy requests too. What's wrong with the retry implementation, and what's the fix?
A. Nothing is wrong, retrying is always correct B. The immediate, no-delay retry loop adds more load onto an already-struggling shared resource, worsening the throttling; the fix is exponential backoff between retry attempts, combined with a circuit breaker that stops retrying entirely once failures are sustained C. The fix is to retry even more times, up to 50 D. The fix is to remove all retry logic entirely

> [!success]- Answer
> **B.** Immediate, unthrottled retries are exactly the anti-pattern that amplifies a throttling event instead of recovering from it — exponential backoff spaces out retries to relieve pressure, and a circuit breaker stops the pattern entirely once it's clear the problem is sustained rather than momentary. (A ignores the documented negative effect on other requests. C makes the amplification problem worse. D removes resilience entirely, leaving genuinely transient failures unhandled.)

## Go deeper
[06 - FM Deployment and API Integration](../../aws-genai-developer-aip-c01/06 - FM Deployment and API Integration.md) — the full architecture-reasoning version.

## Next
[10 - App Integration Patterns and Dev Tools](10 - App Integration Patterns and Dev Tools.md) — closes Domain 2.
