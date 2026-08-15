---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
task: "3.3"
---

# AI Governance and Compliance

<small>10 min read</small>

> **Core idea:** Governance is about being able to prove, after the fact, what your system did and why. A GenAI system can work perfectly and still fail an audit, because "it worked" was never the question — "can you demonstrate control over it" is.

## The concept, explained

It's worth separating this task from the two before it clearly, because it's easy to blur them together. Safety controls (the previous two lessons) are about *preventing* bad outcomes. Governance is about *proving and explaining* what actually happened — a genuinely different job, and one that matters even when nothing ever goes wrong, because a regulator or auditor doesn't take your word for it that the system behaved correctly.

Four concrete capabilities make up this task, and each answers a specific auditor's question.

**"What does this model actually do, and what are its known limitations?"** This is answered by a **SageMaker programmatic model card** — a standardized, structured documentation artifact, not a wiki page someone wrote once and forgot to update. The word "programmatic" matters here: it implies the documentation can be generated and kept current systematically, rather than being a manual, easily-stale write-up.

**"Where did this data come from, and can you trace this specific answer back to its source?"** This is answered by **data lineage tracking**, typically via AWS Glue automatically tracking lineage and the Glue Data Catalog registering data sources, combined with **metadata tagging for source attribution**. This matters especially for RAG systems, and it's worth understanding why: a RAG system, unlike a purely generative one, actually *does* retrieve specific documents to ground each answer — so there's a real, traceable answer to "why did the model say this" available, if (and only if) you capture which document(s) informed each specific response. If you don't capture that linkage, you've squandered the one genuine auditability advantage RAG has over a model just generating from its own internal knowledge.

**"Can you show me a complete audit trail of decisions and access?"** This is **CloudTrail** (API-level: who called what, when) plus **CloudWatch Logs** (application-level: what was actually decided or output). Together they're the mechanical backbone of "prove what happened" — CloudTrail tells you about the access pattern, CloudWatch Logs tells you about the actual content.

**"Is this still true, or did it change since we last checked?"** This is the piece most candidates forget, and it's the one the exam tests hardest: governance is **continuous**, not a one-time launch gate. A model that passed a fairness evaluation, or had accurate documentation, six months ago can drift — usage patterns shift, the underlying data distribution changes, the model itself might even be silently updated by the provider. Automated detection for misuse, drift, and policy violations, plus bias-drift monitoring and automated alerting, exist specifically because a point-in-time governance review goes stale, quietly, the same way any snapshot does.

The idea to really hold onto from this whole task: **an organization needs one consistent governance framework applied across all its GenAI projects, not project-by-project ad hoc decisions.** If different teams each independently decide whether to build a model card, whether to track lineage, whether to log decisions — you end up with inconsistent audit readiness across the organization, and *that inconsistency itself* is a governance failure, distinct from any individual project's specific gaps.

## Quick check

> [!question]- A model passed a fairness evaluation before launch six months ago. Usage patterns and the underlying data distribution have since shifted meaningfully, but no further fairness assessment has occurred. Is the original evaluation still sufficient for governance purposes?
> Think about what a "snapshot in time" can and can't tell you about the present.

> [!success]- Answer
> No — fairness and bias characteristics can drift as usage patterns and data distributions change over time, and a one-time pre-launch evaluation doesn't capture that drift. Continuous bias-drift monitoring is required to maintain governance assurance for an ongoing production system; a single point-in-time check isn't enough on its own.

## How this plays out in practice

Picture a RAG-powered internal assistant that gives a confidently wrong answer, and when the team investigates, nobody can determine which retrieved document (if any) actually informed that response. That's the traceability advantage of RAG going unused — the retrieved documents were known at generation time, but the linkage was never captured or logged, so the audit trail simply doesn't exist.

Picture an organization where Bedrock Guardrails are configured and considered a complete governance solution — until a regulator asks for documentation of the model's known limitations and an audit trail of which data sources informed a specific customer-facing decision. Guardrails address content safety; they say nothing about limitations documentation or data lineage. Those are separate, missing artifacts.

Picture different data science teams each independently deciding their own governance practices — some building model cards, some not, inconsistent audit logging across teams, no unified compliance view. The individual gaps are real, but the deeper failure is the absence of one organization-wide framework everyone is required to follow.

## What the exam is actually testing

- **Governance artifacts (model cards, lineage records, fairness metrics) go stale if treated as one-time documentation.** A model card that hasn't been updated as the model or its usage changed is itself a governance gap, not a completed task.
- **Guardrails ("we have safety controls") is frequently confused with governance ("we can prove and explain what happened") — the exam tests this conflation directly.** Audit-readiness and regulatory-compliance scenarios want lineage, logging, and model cards in the answer, not just Guardrails.
- **A one-time fairness evaluation, presented as sufficient for an ongoing production system, is a repeated trap.** Continuous monitoring is the expected answer whenever the scenario describes a system that's actively in use and evolving, not a one-off analysis.

## Practice questions
Write your own answer first — then expand.

**1.** A RAG-powered internal assistant gives a confidently wrong answer, and nobody can determine which retrieved document (if any) it was based on. What governance gap does this expose?
> [!success]- Answer
> Missing metadata tagging / source attribution at generation time. RAG has an inherent traceability advantage over pure generative systems — the retrieved documents are known at generation time — but only if that linkage is actually captured and logged. Without it, the system loses that auditability benefit entirely.

**2.** A model passed a fairness evaluation six months ago; usage patterns have since shifted meaningfully. Is the original evaluation still sufficient?
> [!success]- Answer
> No — fairness characteristics can drift as usage and data distributions change; continuous bias-drift monitoring is required for an ongoing production system, not a single pre-launch check.

**3.** An organization has Bedrock Guardrails configured and considers their AI governance requirements satisfied. A regulator asks for documentation of the model's known limitations and an audit trail of which data sources informed a specific decision. What's missing?
> [!success]- Answer
> Guardrails address content safety (preventing harmful outputs) — a different requirement from governance (traceability and accountability). The organization is missing model cards documenting known limitations and data lineage/source attribution tracking, which Guardrails doesn't provide.

**4.** Different data science teams independently decide their own governance controls for their own GenAI projects, resulting in inconsistent audit logging and inconsistent model-card usage across the organization. What's the underlying governance failure?
> [!success]- Answer
> The absence of an organization-wide governance framework applied consistently across every project. Standardized model card requirements, audit logging standards, and lineage tracking need to be organizational requirements, not left to individual team discretion.

**5.** What's the specific reason RAG systems have a genuine auditability advantage over purely generative systems, and what has to happen for that advantage to actually be usable?
> [!success]- Answer
> RAG grounds responses in specific retrieved documents, so there's a real, traceable answer to "why did the model say this" available in principle. For that advantage to be usable, the system needs to actually capture and log which specific document(s) informed each response — without that metadata tagging/source attribution, the traceability exists in theory but not in practice.

## Scenario drill
Longer, exam-realistic scenarios. Work through each fully before revealing the answer.

**Scenario 1.** A financial services firm's RAG-powered advisory assistant is investigated after a customer complaint about a specific recommendation. The compliance team asks engineering to show exactly which internal document informed the assistant's answer on the date in question. Engineering discovers that while the knowledge base retrieval was working correctly at the time, no one ever logged which specific documents were retrieved for which specific responses — that information is simply gone. What governance capability was missing, and what should have been in place?
A. A bigger knowledge base B. Metadata tagging and source-attribution logging captured at generation time, tying each response to the specific document(s) that informed it — without this, RAG's inherent traceability advantage over pure generative answers is never actually realized C. A better foundation model D. More frequent model retraining

> [!success]- Answer
> **B.** This is the "RAG has a real auditability advantage, but only if you capture it" lesson played out as a real compliance failure — the retrieval information existed at the moment of generation but was never persisted, so it's now unrecoverable. (A, C, and D are all unrelated to the actual gap, which is a logging/traceability process failure, not a model-quality or scale issue.)

**Scenario 2.** A healthcare AI vendor's model passed a thorough fairness evaluation eighteen months ago across demographic groups, and that evaluation is still cited in their current marketing and compliance materials as proof of the model's fairness today. In the intervening time, the vendor has expanded into three new patient populations with different demographic makeups, and usage patterns have shifted substantially. A new client's compliance team pushes back on accepting the eighteen-month-old evaluation as current proof. Are they right to push back?
A. No, a thorough evaluation is valid indefinitely once completed B. Yes — fairness characteristics can drift as usage patterns and underlying data distributions shift, and an evaluation from eighteen months ago, before three new patient populations were added, doesn't capture the system's current fairness profile; continuous monitoring, not a point-in-time certificate, is what's actually needed C. No, as long as the model's parameters haven't changed D. Yes, but only because eighteen months exceeds some fixed expiration rule

> [!success]- Answer
> **B.** This is the continuous-governance principle applied to a very concrete situation — new populations and shifted usage are exactly the kind of change that can invalidate an old fairness assessment, and the compliance team's skepticism is well-founded, not overly cautious. (A and C both treat fairness as a static, one-time property, which is precisely the misconception this task is built to correct. D implies an arbitrary time-based rule rather than the real, substantive reason — usage and population changes — that the old evaluation is no longer trustworthy.)

**Scenario 3.** Across a large enterprise, one business unit rigorously documents every model with a SageMaker model card and tracks full data lineage, while a different business unit, building an equally customer-facing GenAI feature, does neither, because there's no company-wide requirement forcing them to. When a regulator requests a company-wide audit of all GenAI systems, the inconsistency itself becomes a finding, separate from any specific gap in the second unit's individual practices. What's the root organizational issue, and what would fix it?
A. The second business unit simply needs to work harder B. The absence of a single, organization-wide governance framework applied consistently across all GenAI projects — standardizing model card requirements, lineage tracking, and audit logging as mandatory practices company-wide, rather than leaving governance rigor to each team's own discretion C. The first business unit is doing unnecessary extra work and should stop D. The regulator's finding is unfair since one unit did everything correctly

> [!success]- Answer
> **B.** The specific failure highlighted here isn't really about either team individually — it's that governance consistency was never made an organizational requirement, so results varied entirely by which team happened to prioritize it. A standardized, mandatory framework is what actually fixes this at the root. (A blames individuals for what's structurally a policy gap. C undervalues real, necessary governance work. D misses that inconsistency across a company is itself a legitimate audit concern, regardless of any one team's individual diligence.)

## Next
[14 - Responsible AI Principles](14 - Responsible AI Principles.md)


## Linked from

- [AIP-C01 Exam Prep — Everything Needed to Pass](../index.md)
- [Data Security and Privacy for GenAI](12%20-%20Data%20Security%20and%20Privacy.md)
