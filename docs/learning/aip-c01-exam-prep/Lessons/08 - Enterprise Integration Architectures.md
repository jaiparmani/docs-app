---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "2.3"
---

# Enterprise Integration Architectures

<small>9 min read</small>

> **Core idea:** Bringing FM capabilities into an existing enterprise isn't a new category of problem — it's the same enterprise integration discipline you already know (loose coupling, federated identity, least privilege) applied to a new capability, plus one genuinely new wrinkle: sometimes the data can't leave the building at all.

## The concept, explained

It helps to notice, up front, that this task is less about GenAI-specific novelty and more about applying integration and security practices that already exist in enterprise architecture — the exam is checking whether you'll reach for the boring, correct answer instead of overcomplicating things because "GenAI" is in the sentence.

**Connecting new GenAI capability to existing systems** should follow the same instinct as connecting any two systems: loose coupling over tight coupling. If a legacy CRM needs to trigger a GenAI-powered ticket summarization whenever a new support ticket comes in, the wrong shape is wiring the CRM directly and synchronously into the GenAI logic — that couples their availability and makes changes to either system risky for the other. The right shape is event-driven: the CRM emits an event (via Amazon EventBridge) when a ticket is created, and a Lambda function picks it up and calls the GenAI logic independently. Neither system needs to know the internal details of the other.

**Securing access to FM capabilities inside an enterprise** is, again, not a new problem — it's identity federation (letting your existing enterprise identity provider control who can access the FM service), role-based access control (different teams get different permission levels), and least-privilege API access (nobody gets more access than their actual job requires). If a scenario describes multiple internal teams needing different access levels to a shared GenAI platform, this is exactly the standard enterprise access-control pattern, not something requiring a bespoke GenAI-specific security model.

**The genuinely new wrinkle is data residency at the physical infrastructure level.** Some organizations — often for regulatory or contractual reasons — need certain data to physically never leave their own premises, even while wanting to use cloud-hosted FMs for other, less sensitive processing. This is what **AWS Outposts** is for: it extends real AWS infrastructure into an on-premises facility, so sensitive processing can stay local while still connecting securely to cloud-hosted services for everything else. **AWS Wavelength** solves an adjacent but different problem — very low-latency, edge-located compute (useful for latency-sensitive applications near end users), not primarily a data-sovereignty tool.

Last piece: once a GenAI feature is being consumed by many different teams and applications inside an organization, two problems tend to show up. First, deploying changes safely — this is where **CodePipeline** (orchestrating the deployment pipeline) and **CodeBuild** (running automated tests, including security scans, with rollback support) come in, applied to GenAI components the same way you'd apply CI/CD discipline to any other production system. Second, consistency and visibility across many consumers — if ten different internal applications each call Bedrock independently, nobody has a unified view of usage, cost, or behavior across all of them. The fix is a **centralized GenAI gateway**: one abstraction layer all consumption routes through, giving you consistent observability and control in a single place instead of scattered across every individual integration.

## Quick check

> [!question]- A facility has strict requirements that certain data never leaves on-premises infrastructure, but still needs to integrate with cloud-hosted FMs for other processing. What AWS offering fits this hybrid need?
> This is a hybrid — not "all cloud" and not "all on-premises."

> [!success]- Answer
> AWS Outposts — it extends real AWS infrastructure on-premises, letting sensitive data processing stay physically local while the rest of the architecture still connects to cloud-hosted FM services for whatever doesn't need to stay on-site.

## How this plays out in practice

Picture a legacy CRM getting a new GenAI-powered ticket-summarization feature: EventBridge captures the "new ticket created" event, a Lambda function picks it up and calls the summarization logic — the CRM never has to know or care how the summarization actually works, and the summarization logic never has to be tightly wired into CRM internals.

Picture a regulated healthcare facility that must keep patient data processing on-premises but still wants to use cloud FMs for unrelated, non-sensitive workflows (like internal documentation search). That's the Outposts hybrid pattern exactly.

Picture ten different internal teams each independently calling Bedrock with their own IAM setups, no consistent logging, no shared cost visibility. That's the signal for a centralized GenAI gateway — one place all that traffic routes through, so observability and access control are consistent instead of reinvented ten separate times.

## What the exam is actually testing

- **"Integrate GenAI into an existing enterprise system" scenarios want loose coupling in the answer.** Tight, synchronous coupling to legacy system internals is the trap answer.
- **Security for enterprise GenAI integration is standard enterprise security** — federation, RBAC, least privilege — applied to a new capability. Don't overthink it as needing something GenAI-specific beyond what's already covered under data security generally.
- **A "centralized gateway" answer is usually correct** when a scenario describes many teams or applications independently consuming GenAI capability with no consistent oversight.

## Practice questions
Write your own answer first — then expand.

**1.** A company wants GenAI-powered ticket summarization triggered whenever a new support ticket is created in their legacy CRM. What integration pattern avoids tight coupling?
> [!success]- Answer
> Event-driven integration: EventBridge captures the new-ticket event, triggering a Lambda function that calls the summarization logic independently — the CRM and the GenAI logic stay loosely coupled rather than directly wired together.

**2.** A regulated facility must keep certain data processing on-premises while still integrating with cloud-hosted Bedrock models for other tasks. What AWS service enables this hybrid architecture?
> [!success]- Answer
> AWS Outposts, extending AWS infrastructure on-premises for the local-processing requirement while still connecting to cloud-hosted FM services for everything that doesn't need to stay local.

**3.** Different enterprise teams need different levels of access to a shared internal GenAI platform. What's the standard approach?
> [!success]- Answer
> Identity federation between the FM service and the organization's existing identity system, combined with role-based access control and least-privilege API access — the same enterprise security model you'd apply to any shared internal system, not a GenAI-specific security model.

**4.** A team wants automated security scanning and rollback capability before any GenAI component change reaches production. What AWS services support this?
> [!success]- Answer
> AWS CodePipeline for orchestrating the deployment pipeline, and AWS CodeBuild for running automated tests including security scans, configured with rollback support as part of the pipeline.

**5.** Multiple internal applications each independently call Bedrock, with no consistent observability or access control across any of them. What architectural pattern addresses this?
> [!success]- Answer
> A centralized GenAI gateway — a single abstraction layer that all GenAI consumption routes through, providing consistent observability and control across every consuming application instead of each one integrating separately.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A national pharmacy chain wants to use a cloud-hosted FM to help pharmacists quickly look up drug interaction information, but is legally required to keep all patient prescription data processing within their own physical data centers due to healthcare regulations in their operating country. A cloud architect proposes simply not sending any patient-identifying data to the cloud FM and hoping that's sufficient. Compliance rejects this as too risky to rely on informally. What's a more robust architectural approach?
A. Just trust developers to never include patient data in prompts B. Use AWS Outposts to keep patient-data processing genuinely on-premises, with only the non-patient-specific drug-interaction lookup logic reaching the cloud-hosted FM — enforced architecturally, not by developer discipline alone C. Refuse to use any GenAI capability at all D. Move the entire pharmacy system to the cloud and accept the compliance risk

> [!success]- Answer
> **B.** Compliance is right to reject "developers will just be careful" as the sole control — that's exactly the kind of informal safeguard that fails eventually. Outposts provides a genuine architectural boundary keeping sensitive processing on-premises while still enabling cloud FM access for the parts of the workflow that don't require patient data. (A is the rejected informal approach. C over-corrects and throws away real value. D directly ignores the stated legal requirement.)

**Scenario 2.** A manufacturing company wants their GenAI-powered quality-inspection summaries, generated whenever a new inspection is logged in their decades-old on-premises inspection system, to automatically trigger without requiring a rewrite of that legacy system. An engineer proposes having the GenAI service poll the legacy database directly every few seconds to check for new inspection records. What's a better-fitting integration pattern?
A. The polling approach is fine and simple, keep it B. Event-driven integration — have the legacy system (or a lightweight adapter on it) emit an event via Amazon EventBridge when a new inspection is logged, triggering a Lambda function that calls the GenAI logic, avoiding both the legacy rewrite and constant polling overhead C. Rewrite the entire legacy inspection system D. Have a human manually trigger the GenAI summary each time

> [!success]- Answer
> **B.** This achieves the stated goal — no legacy rewrite — while avoiding the inefficiency and tight coupling of constant polling. EventBridge plus Lambda is the standard event-driven pattern for exactly this kind of "trigger new work when something happens elsewhere" integration. (A works but is wasteful and doesn't scale well; polling every few seconds is inefficient compared to an event-driven trigger. C contradicts the stated constraint of not rewriting the legacy system. D isn't automation at all, defeating the purpose.)

**Scenario 3.** An enterprise has six different internal teams each independently building GenAI features, each with their own separate IAM setup calling Bedrock directly, with no shared visibility into total usage, cost, or behavior across teams. Leadership wants unified cost tracking and consistent security policy enforcement across all GenAI usage company-wide, without forcing every team to rebuild their features from scratch. What's the recommended architectural fix?
A. Force all six teams to rewrite their features using identical code B. Introduce a centralized GenAI gateway — one abstraction layer all teams route their Bedrock consumption through — giving leadership unified observability and consistent policy enforcement without requiring each team's underlying feature logic to change C. Ban GenAI usage until a single team can build everything D. Give every team admin access to a shared AWS account

> [!success]- Answer
> **B.** A centralized gateway is exactly the fix for "many independent consumers, no unified visibility" — it adds a consistent control and observability layer without requiring each team to rebuild their actual feature logic, satisfying both stated goals. (A is far more disruptive than necessary. C blocks legitimate business value for an solvable problem. D makes the security/consistency problem worse, not better.)

## Next
[09 - FM API Integration Patterns](09 - FM API Integration Patterns.md)


## Linked from

- [AIP-C01 Exam Prep — Everything Needed to Pass](../index.md)
- [FM Deployment Strategies](07%20-%20FM%20Deployment%20Strategies.md)
