---
tags: [aws, certification, genai-developer-professional, agents]
exam: AIP-C01
domain: "2 — Implementation and Integration"
tasks: [2.1]
---

# Agentic AI: Agents, Tool Use, MCP, and Multi-Agent Orchestration

## Core concept
An agent is an FM given **memory, tools, and a reasoning loop** so it can break a task into steps, decide which tool to call at each step, and act on the results — instead of producing one response to one prompt. The AIP-C01 framing is explicitly production-safety-conscious: every skill in Task 2.1 pairs a capability ("give the model autonomy") with a corresponding control ("bound that autonomy so it fails safely"). This is the single most exam-relevant lens for this whole domain: **an agent architecture question is rarely just "how does it work," it's "how does it work, and what stops it from running away."**

The production framing: agents introduce a genuinely new failure mode that simple prompt/response FM calls don't have — a model in a loop, calling tools, potentially indefinitely, potentially with side effects (an API call that changes real state). Every architectural piece in this note exists to make that loop observable, boundable, and safe to run unattended.

## Service comparison
| Need | Choice | Why |
|---|---|---|
| Single or multi-agent system with memory/state management | **Strands Agents**, **AWS Agent Squad** | AWS-native frameworks purpose-built for building agentic systems with state and multi-agent coordination |
| Structured, step-by-step reasoning (ReAct, chain-of-thought) as an explicit workflow | **Step Functions** implementing ReAct patterns | Makes the reasoning loop an observable, auditable state machine rather than an opaque loop inside a single Lambda invocation |
| Bounding agent behavior (stopping conditions, timeouts, resource limits) | **Step Functions** (stopping conditions), **Lambda** (timeout mechanisms), **IAM policies** (resource boundaries), **circuit breakers** (failure mitigation) | An agent without explicit stop conditions can loop indefinitely or exceed its intended scope — these are the concrete AWS-native mechanisms for bounding it |
| Coordinating multiple specialized models/agents for a complex task | Custom aggregation logic, model selection frameworks, specialized FMs per subtask | Different subtasks may be better served by different models — coordination logic decides which specialized capability handles which part |
| Human review/approval within an agent workflow | **Step Functions** to orchestrate review/approval steps, **API Gateway** for feedback collection | Human-in-the-loop isn't a UI feature bolted on — it's an explicit workflow step the agent pauses at |
| Extending an agent's capabilities with external tools | **Strands API** for custom tool behaviors, standardized function definitions, **Lambda** for error handling/parameter validation in tool calls | Tools need the same input validation and error handling discipline as any API a user could call directly |
| Lightweight, stateless tool access for an agent | **Lambda-based MCP servers** | Fits simple, fast, stateless tool operations |
| Complex, stateful, or long-running tool operations for an agent | **Amazon ECS-based MCP servers** | Fits tools needing persistent state or longer execution than Lambda's constraints comfortably allow |
| Consistent access pattern across many different tools | **MCP client libraries** | Standardizes how an agent discovers and calls tools, regardless of which service implements them |

## Trade-offs & failure modes
- **An agent without a stopping condition is an unbounded liability, not just an inefficiency.** ReAct-style reasoning loops can, in principle, continue indefinitely if the model doesn't converge on a final answer — Step Functions-based stopping conditions (max iterations, timeout) are not an optimization, they're a required safety boundary.
- **Tool calls with side effects need the same defensive engineering as any production API call.** Parameter validation and error handling in the Lambda layer wrapping a tool call exist because an FM can hallucinate malformed tool arguments — a tool invocation layer that trusts the model's output blindly is the failure mode this skill set exists to prevent.
- **IAM resource boundaries scope what an agent's tools are *allowed* to do, independent of what the model *intends* to do.** This is the same "don't trust the caller's stated intent, enforce the boundary structurally" principle as any least-privilege design — an agent with an overly broad IAM role can cause real damage even if its prompt-level instructions were well-intentioned.
- **Multi-agent coordination adds a genuinely new class of complexity: aggregation logic.** When multiple specialized agents/models contribute to one outcome, someone has to decide how to combine or arbitrate their outputs — this custom aggregation logic is itself a design surface that can fail (e.g. two agents disagreeing with no tie-breaking rule).
- **Lambda vs. ECS for MCP servers is a statelessness/duration trade**, the same shape as any serverless-vs-container decision: Lambda for quick, stateless tool calls; ECS when a tool needs to hold state across calls or run longer than Lambda's execution limits comfortably allow.
- **Circuit breakers for agent workflows mean the same thing they meant in traditional distributed systems**: if a tool an agent depends on starts failing repeatedly, the agent should stop calling it and fail gracefully (or fall back), not retry into a cascading failure.

## Security & cost considerations
- **Least-privilege IAM per tool/agent** is the primary security control — an agent's blast radius on a mistake (or a successful prompt injection) is bounded by what its IAM role can actually do, not by how well the prompt asked it to behave.
- **Every additional agent loop iteration or tool call is an additional FM invocation cost** — an agent without a bounded max-iteration count isn't just a safety risk, it's an unbounded cost risk. This connects directly to [10 - Cost Optimization](10 - Cost Optimization.md).
- **Human-in-the-loop steps add latency by design** — appropriate for high-stakes or irreversible actions (the same principle from AIF-C01's Responsible AI content, now with concrete AWS implementation via Step Functions approval steps), inappropriate as a default for every agent action regardless of stakes.

## Troubleshooting signals
| Symptom | Likely cause | Fix direction |
|---|---|---|
| An agent workflow runs far longer (or costs far more) than expected for a given task | Missing or too-permissive stopping conditions on the reasoning loop | Add explicit max-iteration/timeout stopping conditions via Step Functions |
| A tool call fails with malformed parameters that don't match the tool's expected schema | No parameter validation layer between the model's tool-call output and the actual tool invocation | Add Lambda-based validation/error handling in front of the tool call |
| An agent successfully performs an action outside its intended scope after a crafted/adversarial input | IAM role for the agent's tools is overly permissive | Scope IAM policies to least privilege per tool, independent of prompt-level restrictions |
| Two specialized agents contributing to one task produce conflicting outputs with no clear resolution | No aggregation/arbitration logic defined for multi-agent coordination | Add explicit aggregation logic or a model-selection/arbitration framework |
| A tool an agent depends on is degraded, and the agent keeps retrying it, delaying the whole workflow | No circuit breaker around the tool-call step | Add a circuit breaker with a fallback path for that tool |

## Exam traps & decision rules
- **Trap: describing agent capability without describing agent boundaries.** Decision rule: any answer proposing an autonomous agent for a scenario should pair it with an explicit boundary mechanism (stopping condition, IAM scope, human review gate) — the exam consistently pairs "give it autonomy" with "and how do you bound it" as the actual test.
- **Trap: assuming prompt-level instruction is a sufficient control on agent tool use.** Decision rule: IAM policy boundaries and Lambda-level validation are the structural controls; prompt instructions telling the agent "only use tool X for Y" are not enforcement.
- **Trap: choosing ECS-based MCP servers by default "for reliability."** Decision rule: match compute choice to the tool's actual statefulness/duration needs — Lambda is the lighter, cheaper, correct default for simple stateless tools.
- **Trap: adding human-in-the-loop review to every agent action "to be safe."** Decision rule: reserve human review steps for high-stakes/irreversible actions specifically; blanket human review on every step defeats the purpose of automation and is a design smell the exam will flag as over-engineering.

## Rapid recall
- Strands Agents / Agent Squad = AWS-native agent frameworks with memory/state, multi-agent coordination.
- Step Functions = the backbone for ReAct reasoning loops, stopping conditions, human-review orchestration, and circuit breakers.
- Lambda = tool-call validation/error handling AND lightweight stateless MCP servers; ECS = complex/stateful MCP servers.
- IAM policies = the real enforcement boundary on agent tool actions, not prompt instructions.
- Every agent design answer should pair capability with a boundary — that pairing is the actual exam signal.

## Practice questions
Write your own answer first — then expand.

**1.** An engineer builds an agent that reasons in a ReAct loop until it decides it has a final answer, with no explicit maximum iteration count. What's the risk, and what AWS-native mechanism addresses it?

> [!success]- Answer
> The risk is an unbounded loop — the agent could continue reasoning/calling tools indefinitely if it never converges, driving up cost and latency with no ceiling. Step Functions implementing the ReAct pattern should include an explicit stopping condition (max iterations or a timeout), making the loop's worst-case behavior bounded and predictable rather than open-ended.

**2.** An agent has broad IAM permissions "to make sure it can complete any task it's asked to do," and its system prompt instructs it to "only take actions relevant to customer support requests." A crafted user input causes it to take an unintended action outside that scope. What was the actual security failure?

> [!success]- Answer
> Relying on the prompt instruction as the enforcement mechanism instead of IAM policy scoping. The prompt is a request the model can fail to honor, especially under adversarial input; the IAM role granted to the agent's tools is the structural boundary that determines what's *actually possible*, regardless of what the prompt asked for. The fix is scoping IAM permissions to the minimum needed for legitimate customer-support actions specifically.

**3.** A team is building a tool for an agent that needs to maintain a multi-step conversation state across several tool invocations over an extended period. Should this tool be implemented as a Lambda-based MCP server or an ECS-based MCP server?

> [!success]- Answer
> ECS-based. Lambda fits lightweight, stateless tool operations well, but a tool needing to maintain state across multiple invocations over an extended duration exceeds what Lambda is well-suited for — ECS supports the persistent, longer-running, stateful execution this requirement describes.

**4.** An agent occasionally passes malformed parameters to a tool because the model hallucinates an argument that doesn't match the tool's expected schema, causing runtime errors. What layer should catch this, and why shouldn't the fix be "improve the prompt so the model gets it right"?

> [!success]- Answer
> A Lambda-based validation layer between the model's tool-call output and the actual tool invocation, checking parameters against the expected schema before execution. Prompt improvements can reduce but never eliminate hallucinated/malformed arguments — the model's output can never be fully trusted as input to a real system, so a structural validation step is required regardless of how good the prompt is.

**5.** A workflow uses two specialized agents — one for pricing analysis, one for inventory analysis — to jointly recommend whether to approve a large order. The two agents occasionally reach conflicting recommendations with no defined resolution process, causing the workflow to stall. What's missing from this multi-agent design?

> [!success]- Answer
> Explicit aggregation/arbitration logic for combining or resolving disagreement between the two agents' outputs — e.g. a defined tie-breaking rule, a third arbitration step, or an escalation to human review when the agents disagree. Multi-agent coordination requires this as a first-class design element; without it, conflicting outputs have no defined path to a final decision.

## Related
[README - Syllabus](README - Syllabus.md) · [03 - RAG Architecture](03 - RAG Architecture.md) · [06 - FM Deployment and API Integration](06 - FM Deployment and API Integration.md) · [07 - AI Safety and Guardrails](07 - AI Safety and Guardrails.md) · [08 - Data Security and Privacy](08 - Data Security and Privacy.md) · [13 - Model Evaluation Systems](13 - Model Evaluation Systems.md)
