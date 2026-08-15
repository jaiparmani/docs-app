# Day 50 — Observability: Metrics, Logging, Distributed Tracing (HLD)

<small>7 min read</small>

## What we're learning today
Starts Block E. Every design in this roadmap answered "how do I build this." Today starts answering the question you'll actually live with in production: "how do I know what's happening inside it, and where's the bottleneck when something's slow or broken." This applies across every prior design at once, not as a new component in any single one.

## Core concept
**Observability** rests on three complementary signal types: **metrics** (aggregated numeric time series — "p99 latency is 400ms"), **logs** (discrete, detailed event records — "request X failed with error Y at time T"), and **distributed traces** (the causal path of one request across every service it touched). Each answers a different question; none of the three substitutes for the other two.

## Visual diagram
```
Metrics: "checkout latency p99 spiked to 2s at 14:32" -> tells you SOMETHING is wrong, and roughly when

Logs: grep for errors around 14:32 -> "PaymentService: timeout calling FraudCheckService"
      -> tells you WHAT specifically failed

Distributed trace for one slow request:
  [Gateway: 5ms] -> [OrderService: 10ms] -> [PaymentService: 1800ms] -> [FraudCheckService: 1750ms]
                                                                              ^^^^ here's the bottleneck
      -> tells you WHERE in the call chain the time actually went
```

## Explanation
- **Metrics answer "is something wrong" cheaply, at scale, but can't tell you why.** A metric like p99 latency, error rate, or queue depth is aggregated across many requests — cheap to store and alert on, but a spike tells you *that* something's wrong, not *which specific request* or *which specific downstream call* caused it.
- **Logs answer "what specifically happened" for an individual event, but don't show causality across services.** A log line from `PaymentService` saying "timeout calling FraudCheckService" is precise, but correlating it with the right upstream `OrderService` log line and the right `Gateway` log line — across three different services' log streams — requires some way to tie them together.
- **This is exactly what a trace ID (propagated across every service call in a request) solves.** Every request gets a unique trace ID at the edge (the gateway from [Day 32](Day 32 - API Gateway and Service Discovery (HLD).md)), and every downstream service call carries that same ID forward — logs, metrics, and spans (individual timed operations) can all be correlated by it after the fact, turning "three separate log streams" into "one coherent timeline for this specific request."
- **A distributed trace is literally what makes a multi-service request's critical path visible** — the diagram above shows exactly why `PaymentService`'s 1800ms is dominated by its call to `FraudCheckService`, not its own logic — information a metric (aggregate latency) or an isolated log line (one service's view only) can't give you on their own. This is the concrete tool for the "where is the bottleneck" question this whole roadmap has been building toward.
- **Alerting should be on symptoms (SLO-facing metrics: latency, error rate, availability), not causes** — alerting directly on "CPU usage on server 17" produces noisy, low-signal pages; alerting on "checkout p99 latency exceeds 1s for 5 minutes" is a real, user-facing symptom worth waking someone up for, and the trace/log investigation that follows is how you find the cause. This is a deliberate operational design choice, not just a monitoring-tool feature.

## Real-world examples
- **Prometheus + Grafana:** the standard open-source metrics stack — Prometheus scrapes/stores time-series metrics, Grafana visualizes and alerts on them; this is the "is something wrong" layer in most modern stacks.
- **Jaeger / AWS X-Ray:** distributed tracing systems that implement exactly the trace-ID-propagation model above — X-Ray specifically integrates with API Gateway, Lambda, and other AWS services to automatically propagate trace context across a request's full path, directly relevant to your AWS track.
- **ELK/OpenSearch stack (Elasticsearch, Logstash, Kibana):** the logging layer — and notice this is literally [Day 31](Day 31 - Search Systems and Elasticsearch (HLD).md)'s inverted-index search engine, repurposed for searching structured log data instead of documents — the same "why not just grep a database" argument from that day applies here at log volume.

## Interview perspective
System design interviews rarely ask "design an observability system" directly, but strong candidates volunteer observability unprompted when discussing any design's production readiness — naming what metric would catch a specific failure mode, or how you'd trace a slow request across the services in *this* design, is a senior-level signal that a design isn't just "does it work" but "can I operate it." Weak answers treat monitoring as an afterthought bolted on at the end, if mentioned at all.

## Trade-offs
| | Metrics | Logs | Traces |
|---|---|---|---|
| Storage/query cost at scale | Low (aggregated) | High (every event, verbose) | Medium-high (sampled in practice) |
| Granularity | Aggregate only | Per-event, but siloed per service | Per-request, cross-service |
| Best for | Alerting, dashboards, "is something wrong" | Root-causing a specific known failure | Finding *where* in a call chain the problem is |

- **Trace sampling is a real, necessary trade-off at scale** — tracing every single request at massive QPS is expensive to store and process; production systems typically sample (e.g. trace 1% of requests, or trace 100% of *errored* requests specifically) — worth naming as a deliberate cost-vs-completeness decision, not an oversight.

## Interview question
"Checkout latency p99 spikes for five minutes, then recovers. By the time you look, the spike is over. What lets you figure out what happened after the fact?"

> [!question]- Think it through, then expand
> The metric already told you something happened — what do you need next, and where does it come from?

> [!success]- Answer
> The metric (p99 latency) only tells you *that* something happened and roughly *when* — it doesn't tell you which service or downstream call was responsible. You'd pull traces from requests that fell in that time window (ideally the system already retained some, e.g. via always-tracing errored/slow requests even under sampling) and look at their span breakdowns to find which specific downstream call dominated the latency during the spike — then cross-reference that service's logs from the same window for the specific error or condition (e.g. a downstream timeout, a lock contention spike, a cold cache after a deploy) that explains *why* that call was slow. This is the metrics → traces → logs drill-down flow in practice: each layer narrows the investigation, none of them alone would have been enough.

## Key design principle
**Metrics tell you something is wrong and roughly when; traces tell you where in a multi-service call chain; logs tell you exactly what happened at that specific point — real incident investigation moves through all three, in that narrowing order, not any one in isolation.**

## Scenario Practice

**Scenario 1:** An on-call engineer gets paged for "checkout latency p99 above threshold." The metric confirms something is wrong, but gives no clue *where* in the multi-service checkout flow the slowness is coming from. What's the next tool to reach for, and why not logs first?

> [!question]- Think it through, then expand
> This day's key design principle describes a specific narrowing order across the three pillars — which one comes right after "something is wrong, roughly when"?

> [!success]- Answer
> Distributed tracing comes next, not logs — the metric has already told you *that* something's wrong and roughly *when*; the next question is *where* in the call chain (which of the several services checkout touches is actually the slow one), and a trace across the request's full path through every service is built exactly for answering that. Jumping straight to logs first means guessing which service's logs to even look at, since logs alone don't show you the causal chain across services — the framework's narrowing order (metrics → traces → logs) exists precisely so you spend your investigation time narrowing the search space at each step instead of searching broadly and randomly.

**Scenario 2:** A team adds a unique label to every metric for `user_id`, hoping to slice latency by individual user. Within a day, the metrics backend is falling over and costs have spiked dramatically. What happened?

> [!question]- Think it through, then expand
> A metrics system stores a separate time series for every unique combination of label values — what happens to that count when one label has millions of possible values?

> [!success]- Answer
> This is a cardinality explosion: a metrics backend allocates a distinct time series for every unique combination of label values, and `user_id` — with potentially millions of distinct values — multiplies the number of stored time series by that same factor, which most metrics systems are simply not built to handle at that scale, leading to the exact backend collapse and cost spike described. High-cardinality dimensions like user ID belong in logs or traces (which are built to handle arbitrary, high-cardinality fields per-event) rather than as a metric label — this is a concrete instance of this day's key design principle about each pillar being suited to a specific kind of question, and "which specific user was affected" was always a logs/traces question, not a metrics one.

## Tomorrow

Day 51 (HLD) — Multi-Region & Disaster Recovery: closes the roadmap by extending "what happens when a node fails" (asked repeatedly since Day 19) up to "what happens when an entire region fails."
