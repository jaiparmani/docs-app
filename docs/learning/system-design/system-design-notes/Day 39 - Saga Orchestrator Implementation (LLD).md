# Day 39 — Saga Orchestrator, Implemented (LLD)

<small>5 min read</small>

## What we're learning today
Day 38 described Saga conceptually. Today builds the actual orchestrator state machine — the piece of code that knows which steps ran, and exactly which compensations to fire, in what order, when something fails.

## Core concept
A **Saga orchestrator** is a state machine that executes a sequence of steps, persists progress after each one, and — on failure — walks backward through the **already-completed** steps only, firing each one's compensating action in reverse order.

## Visual diagram
```
Saga definition (checkout):
  Step 1: CreateOrder      | compensate: CancelOrder
  Step 2: ChargePayment    | compensate: RefundPayment
  Step 3: ReserveInventory | compensate: ReleaseInventory  <- fails here
  Step 4: ArrangeShipping  | compensate: CancelShipping

Execution log (persisted after each step):
  [CreateOrder: DONE] [ChargePayment: DONE] [ReserveInventory: FAILED]

Compensation (reverse order, only completed steps):
  RefundPayment -> CancelOrder
  (ArrangeShipping never ran, so CancelShipping never needs to run)
```

## Explanation
- **The orchestrator must persist state after every step, not just hold it in memory.** If the orchestrator process crashes mid-Saga, it needs to resume (or at least correctly compensate) based on durable state, not lose track of what already committed — the same durability instinct as [Day 20](Day 20 - Write-Ahead Log Implementation (LLD).md)'s WAL, applied to workflow progress instead of database rows.
- **Compensation only runs for steps that actually completed** — a step that never ran (because an earlier step failed first) has nothing to undo, and running its compensation would be a bug (e.g. calling `CancelShipping` for a shipment that was never arranged).
- **Compensations run in strict reverse order.** This matters when steps have implicit dependencies — e.g. you must refund the payment before (or at least logically corresponding to) cancelling the order that justified the charge, mirroring how the forward steps depended on each other in creation order.
- **Each individual step, and each individual compensation, needs its own retry/idempotency discipline** (Day 33, Day 24) — the orchestrator's job is sequencing and tracking state, not replacing the reliability patterns each step still needs internally. A common mistake is treating the orchestrator itself as the source of reliability and leaving individual steps fragile.
- **What "the Saga is done" actually means:** either every step succeeded (forward-complete), or every completed step was successfully compensated (rolled-back-complete). A Saga that fails partway through compensation itself (e.g. `RefundPayment` keeps failing after retries) is stuck in an inconsistent state requiring manual intervention — worth stating explicitly rather than implying the design has no failure mode of its own.

```
pseudocode:
function runSaga(steps):
    completed = []
    for step in steps:
        persist(state: step.name, status: STARTED)
        try:
            step.execute()
            persist(state: step.name, status: DONE)
            completed.append(step)
        except:
            persist(state: step.name, status: FAILED)
            compensate(reversed(completed))
            return FAILED

function compensate(completedStepsReversed):
    for step in completedStepsReversed:
        retryWithBackoff(step.compensatingAction)  # Day 33
        persist(state: step.name, status: COMPENSATED)
```

## Real-world examples
- **AWS Step Functions:** a managed orchestration service that's essentially "Saga orchestrator as a product" — you define steps and error-handling/retry policies declaratively, and it persists execution state durably so a crash of the underlying infrastructure doesn't lose workflow progress.
- **Temporal / Camunda:** open-source workflow orchestration engines built specifically around this durable-state, resumable-on-crash execution model — widely used for exactly this class of multi-step, multi-service business transaction.
- **Order-processing systems at any e-commerce company operating at scale:** the checkout Saga from Day 38, implemented essentially as sketched above, is close to how real order pipelines are built once a single-database transaction can no longer span the whole checkout flow.

## Interview perspective
Interviewers probing this expect you to notice the two subtle correctness requirements unprompted: (1) only compensate steps that actually completed, and (2) compensate in reverse order. Candidates who describe Saga only at Day 38's conceptual level, without being able to sketch this state-tracking logic, are giving a "I've read about this" answer rather than a "I could build this" one — exactly the gap the HLD/LLD pairing in this whole roadmap exists to close.

## Trade-offs
| | Orchestration (this note) | Choreography (Day 38 mention) |
|---|---|---|
| Where the "which steps completed" state lives | Centralized, in the orchestrator | Distributed — inferred from events each service reacted to |
| Debuggability | High — one place to look | Lower — must reconstruct from scattered event logs |
| Single point of coordination dependency | Yes — orchestrator itself needs its own availability story (could itself use Day 36's leader election if run as a cluster) | No central dependency, but harder to reason about globally |

## Interview question
"The orchestrator crashes right after `ChargePayment` succeeds, but before it persists that success. It restarts. What does it do?"

> [!question]- Think it through, then expand
> What does the orchestrator's durable log actually say happened, versus what actually happened?

> [!success]- Answer
> The durable log shows `ChargePayment: STARTED` but never `DONE` — the orchestrator can't distinguish "the charge succeeded but we crashed before recording it" from "the charge never actually ran." The safe recovery path depends on the step being idempotent (Day 24): re-attempt `ChargePayment` using the same idempotency key as before. If it already succeeded downstream, the idempotent handler returns the same result without double-charging; if it never ran, it runs now. This is exactly why "each step needs its own idempotency, not just the orchestrator's sequencing" (this note's fourth bullet) — the orchestrator's crash-recovery correctness *depends on* that property holding for every step.

## Key design principle
**An orchestrator's crash-safety comes from persisting state after every step transition and relying on each step's own idempotency for safe re-execution — sequencing logic alone doesn't provide durability or safety on its own.**

## 30-second challenge
Why would it be a design mistake to persist Saga state only in the orchestrator's local memory/disk instead of a shared, durable, replicated store — what specific failure does that leave unhandled?

## Tomorrow
Day 40 (HLD) — Event Sourcing & CQRS: a different way to think about state entirely — instead of storing "current state" and mutating it, store every change as an immutable event and derive state by replay. Directly extends the "persist a durable log of what happened" instinct from today's orchestrator design.
