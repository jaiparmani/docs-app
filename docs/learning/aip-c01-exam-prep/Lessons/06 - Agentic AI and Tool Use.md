---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "2.1"
---

# Agentic AI: Agents, Tool Use, MCP, Multi-Agent Orchestration

<small>12 min read</small>

> **Core idea:** Every question about giving an agent more autonomy comes paired with a question about how you bound it. This pairing — capability plus boundary — is the single most repeated pattern across the entire exam, not just this task.

## The concept, explained

An agent, at its simplest, is a foundation model given memory, tools, and a loop: it can break a task into steps, decide which tool to call at each step, and act on the results, instead of just producing one response to one prompt. That capability is genuinely powerful — and genuinely dangerous if left unchecked, which is exactly why this task area is built the way it is. Read through the official skill list for this task and you'll notice almost every one names a capability *and* a corresponding safeguard in the same breath. That's not an accident; it's the whole point.

Start with the frameworks. **Strands Agents** and **AWS Agent Squad** are AWS-native tools purpose-built for constructing agents with memory/state and coordinating multiple agents together. You don't need to know their internals deeply — you need to recognize them by name as "the AWS-native way to build this," rather than confusing them with something else.

Now the reasoning mechanism. A common pattern for how an agent "thinks" is called **ReAct** (reason, then act, then observe the result, then reason again) — and the exam wants this implemented as an explicit, observable process, not a black box running silently inside one Lambda invocation. **AWS Step Functions** is the tool for this: it turns the reasoning loop into a visible state machine, where you can actually see each step the agent took. This matters practically, not just architecturally — if an agent misbehaves, you need to be able to look at what happened, and an opaque in-process loop doesn't give you that.

Here's the idea worth really internalizing: **an agent with no stopping condition is not just inefficient, it's a real liability.** A ReAct loop that never converges on a final answer could, in principle, keep reasoning and calling tools indefinitely — racking up cost and latency with no ceiling. Step Functions-based stopping conditions (a maximum number of iterations, a timeout) aren't a nice-to-have optimization; they're a required safety boundary for any agent design you propose. If a scenario describes an agent and doesn't mention a bound on its reasoning loop, that's a gap worth flagging.

The same "bound it" instinct applies to what an agent's tools are actually allowed to *do*. Here's a scenario worth sitting with: an agent has broad IAM permissions "just in case it needs them," and its system prompt says "only take actions relevant to customer support." A crafted, adversarial input gets the agent to take an action outside that intended scope. What actually failed here? Not the prompt being poorly worded — the failure is that the prompt was ever treated as the enforcement mechanism in the first place. The agent's IAM role determines what its tools can *actually* do, structurally, regardless of what the prompt requested. This is the same principle from prompt engineering (a prompt is a request, not a guarantee) applied to agent actions specifically: **IAM policy scoping is the real boundary, not prompt wording.**

Tool calls themselves need a second layer of defense, for a different reason: a model can hallucinate malformed arguments when calling a tool — passing the wrong type, missing a required field, inventing a parameter that doesn't exist. You can never fully trust a model's output as safe input to a real system. The fix is a validation layer (typically Lambda) sitting between the model's tool-call output and the actual tool execution, checking and rejecting bad calls before they cause damage.

For the mechanics of *how* tools are exposed to an agent, this is where **MCP (Model Context Protocol)** comes in — it gives an agent a consistent way to discover and call tools regardless of who built them. The implementation choice between a **Lambda-based MCP server** and an **ECS-based MCP server** comes down to one question: does this tool need to hold state across multiple calls, or run longer than Lambda's execution limits comfortably allow? If yes, ECS. If it's a simple, fast, stateless operation, Lambda — and Lambda should be your default unless the scenario specifically describes a stateful or long-running need.

Last piece: when multiple specialized agents contribute to one outcome — say, a pricing agent and an inventory agent both weighing in on whether to approve a large order — they can genuinely disagree. Someone (or something) has to resolve that. This is **aggregation/arbitration logic**, and it's a real design element you need to include explicitly, not something that resolves itself. A multi-agent design with no defined way to handle disagreement between agents is an incomplete design.

## Quick check

> [!question]- An agent has broad IAM permissions "to make sure it can complete any task," and its system prompt instructs it to "only take actions relevant to customer support requests." A crafted input causes it to take an unintended action outside that scope. What was the actual security failure?
> This mirrors the prompt-vs-Guardrail distinction from the prompt engineering lesson — apply the same reasoning here.

> [!success]- Answer
> The failure was relying on the prompt instruction as the enforcement mechanism, instead of scoping IAM permissions to the minimum the agent's legitimate tasks actually require. The IAM role determines what's structurally possible for the agent's tools to do; the prompt is just a request the model can fail to honor under adversarial input. The fix is least-privilege IAM scoping, not a better-worded prompt.

## How this plays out in practice

Picture an agent reasoning in a loop with no maximum iteration count, quietly running for far longer (and costing far more) than anyone expected on a task it never quite converged on — that's the unbounded-loop failure mode, and the fix is an explicit Step Functions stopping condition, not "the agent will figure it out eventually."

Picture a tool call that fails because the model passed a malformed parameter — maybe it hallucinated a field name that doesn't exist in the tool's actual schema. That's caught (or should be caught) by a Lambda validation layer sitting in front of the real tool invocation, not by hoping the model gets it right.

Picture two agents — one evaluating pricing, one evaluating inventory — jointly recommending whether to approve a large customer order, and they disagree. Without an explicit tie-breaking rule or an escalation path to a human, the workflow just... stalls. That's the missing-aggregation-logic failure mode.

## What the exam is actually testing

- **The recurring pattern for this whole task**: any answer that proposes giving an agent more autonomy should also propose how that autonomy is bounded — a stopping condition, an IAM scope, a human-review gate. Answers that only address capability, without a boundary, are incomplete.
- **Prompt-level restrictions on agent behavior are never sufficient on their own.** IAM policy scoping is the structural enforcement mechanism the exam wants you to reach for.
- **Don't default to ECS "for reliability."** Match the compute choice to what the tool actually needs — Lambda is the correct, lighter default for simple stateless tools; ECS is for genuinely stateful or long-running ones.
- **Human-in-the-loop review belongs on high-stakes or irreversible actions specifically**, not on every single agent step. Adding review everywhere "to be safe" is itself treated as a design mistake — it defeats the purpose of automating the task at all.

## Practice questions
Write your own answer first — then expand.

**1.** An agent reasons in a ReAct loop with no maximum iteration count. What's the risk, and what AWS-native mechanism addresses it?
> [!success]- Answer
> The risk is an unbounded loop that could reason and call tools indefinitely, driving up cost and latency with no ceiling. Step Functions implementing the ReAct pattern should include an explicit stopping condition — a maximum iteration count or a timeout — bounding the loop's worst-case behavior.

**2.** An agent occasionally passes malformed parameters to a tool because the model hallucinates an argument that doesn't match the tool's expected schema. What layer should catch this, and why isn't "improve the prompt" a sufficient fix?
> [!success]- Answer
> A Lambda-based validation layer, sitting between the model's tool-call output and the actual tool invocation, checking parameters against the expected schema before execution. Prompt improvements reduce but never eliminate hallucinated or malformed arguments — a model's output can never be fully trusted as safe input to a real system, so a structural validation step is required regardless of how good the prompt is.

**3.** A tool needs to maintain conversation state across multiple invocations over an extended period. Should it be a Lambda-based or ECS-based MCP server?
> [!success]- Answer
> ECS-based. Lambda fits lightweight, stateless tool operations well, but a tool needing to hold state across multiple calls over an extended duration exceeds what Lambda is comfortably designed for; ECS supports the persistent, longer-running execution this requirement describes.

**4.** Two specialized agents — one for pricing, one for inventory — occasionally reach conflicting recommendations, stalling a workflow with no path forward. What's missing from this multi-agent design?
> [!success]- Answer
> Explicit aggregation or arbitration logic — a defined tie-breaking rule, an arbitration step, or an escalation to human review when the agents disagree. Multi-agent coordination requires this as a first-class design element; without it, conflicting outputs have no defined resolution.

**5.** An agent has broad IAM permissions restricted only by a prompt instruction limiting it to customer-support actions. What's the actual vulnerability, in one sentence?
> [!success]- Answer
> The prompt is not an enforcement mechanism — the broad IAM role is what actually determines what the agent's tools can do, regardless of the prompt's instructions, so the fix is scoping IAM to least privilege, not strengthening the wording of the prompt.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A travel-booking company builds an agent that can search flights, check prices across providers, and, if authorized, book a ticket. During a demo, the agent gets stuck in a loop repeatedly re-searching flights with slightly reworded queries, never reaching a final booking decision, running for over 40 minutes before someone manually kills the process. What's the missing design element, and what AWS service implements the fix?
A. A bigger context window, so the agent can "remember" it already searched B. An explicit stopping condition (maximum iteration count or timeout) implemented via AWS Step Functions orchestrating the agent's reasoning loop C. A stronger system prompt telling the agent to "please finish quickly" D. Switching to a smaller, faster model

> [!success]- Answer
> **B.** An unbounded reasoning loop is exactly the failure this scenario describes, and the concrete fix is a structural stopping condition in the orchestration layer, not something you can reliably fix by asking nicely in the prompt. (A doesn't prevent an unbounded loop, it just changes what's in context during it. C is a prompt-level request, and this whole task's core lesson is that requests aren't enforcement. D might make each iteration faster but doesn't bound the total number of iterations.)

**Scenario 2.** A company builds an internal agent with permissions to query and modify records in their CRM, scoped by an IAM role that has full read/write access to the entire CRM database "to avoid permission headaches during development." The system prompt restricts the agent to "only update records related to the current user's own support ticket." A penetration test later shows a crafted input can get the agent to modify an unrelated customer's record. What's the actual fix, distinct from prompt wording?
A. Add a warning message to the system prompt B. Scope the agent's IAM role down to least privilege for its legitimate task — for example, granting write access only to fields/records genuinely needed for the ticket-update use case — since the IAM role, not the prompt, is what structurally determines what the agent's tools can actually do C. Increase the agent's temperature to make it more predictable D. Add more unit tests for the agent's prompt

> [!success]- Answer
> **B.** This is the IAM-as-real-boundary lesson applied directly — a broad IAM role granted "to avoid headaches" is exactly the setup that turns a prompt-injection success into a real, structural security incident. Scoping the role to least privilege is what actually closes the gap, independent of anything the prompt says. (A and D are still prompt/testing-layer fixes, not structural ones. C affects randomness in generation, not permission enforcement, and lower temperature doesn't make a model immune to adversarial prompting anyway.)

**Scenario 3.** A company builds a "research assistant" agent that needs to remember details across a long, multi-day research project — partial findings, sources already checked, open questions — spanning many separate tool invocations over several days. An architect proposes implementing the tool-access layer as a set of Lambda functions. What's the concern, and what's the better fit?
A. No concern — Lambda is always the right choice for any tool B. Lambda functions are optimized for lightweight, stateless, short-duration operations; a tool needing to persist and recall project state across days and many invocations is better implemented as an ECS-based MCP server, which supports genuinely stateful, longer-running execution C. The concern is that Lambda cannot call external APIs D. The concern is cost — Lambda is always more expensive than ECS

> [!success]- Answer
> **B.** The described need — persistent state across many invocations spanning days — is exactly the case that exceeds what Lambda's stateless, short-execution model comfortably supports, and exactly what an ECS-based MCP server is suited for. (A ignores a real, relevant constraint. C is factually wrong — Lambda can call external APIs fine, statelessness is the actual issue, not API access. D is not a reliable general statement about relative cost, and isn't the actual reason to choose one over the other here.)

## Go deeper
[05 - Agentic AI and Tool Use](../../aws-genai-developer-aip-c01/05 - Agentic AI and Tool Use.md) — the full architecture-reasoning version.

## Next
[07 - FM Deployment Strategies](07 - FM Deployment Strategies.md)
