---
tags: [aws, certification, genai-developer-professional, exam-prep]
exam: AIP-C01
---

# AIP-C01 Exam Prep — Everything Needed to Pass

This folder now contains a complete, self-sufficient path to passing AIP-C01: a full lesson for every one of the exam's 19 official tasks (explained properly, not just bullet-point facts), plus timed practice and quick-recall drills. It's organized around passing the exam efficiently, but each lesson genuinely teaches the concept — it's not a substitute for understanding, it's understanding aimed specifically at what gets tested.

For even deeper production/architecture reasoning beyond what's needed to pass, see the [deep notes](../aws-genai-developer-aip-c01/README - Syllabus.md) — every lesson here links to its corresponding deep note under "Go deeper."

## Lessons (19 — full coverage of every official exam task)

**Domain 1 — Foundation Model Integration, Data Management, and Compliance (31%)**
1. [01 - Bedrock Model Selection and Solution Design](Lessons/01 - Bedrock Model Selection and Solution Design.md)
2. [02 - Data Validation and Processing Pipelines](Lessons/02 - Data Validation and Processing Pipelines.md)
3. [03 - Vector Stores and Embeddings](Lessons/03 - Vector Stores and Embeddings.md)
4. [04 - RAG Retrieval Mechanisms](Lessons/04 - RAG Retrieval Mechanisms.md)
5. [05 - Prompt Engineering and Governance](Lessons/05 - Prompt Engineering and Governance.md)

**Domain 2 — Implementation and Integration (26%)**
6. [06 - Agentic AI and Tool Use](Lessons/06 - Agentic AI and Tool Use.md)
7. [07 - FM Deployment Strategies](Lessons/07 - FM Deployment Strategies.md)
8. [08 - Enterprise Integration Architectures](Lessons/08 - Enterprise Integration Architectures.md)
9. [09 - FM API Integration Patterns](Lessons/09 - FM API Integration Patterns.md)
10. [10 - App Integration Patterns and Dev Tools](Lessons/10 - App Integration Patterns and Dev Tools.md)

**Domain 3 — AI Safety, Security, and Governance (20%)**
11. [11 - AI Safety and Content Controls](Lessons/11 - AI Safety and Content Controls.md)
12. [12 - Data Security and Privacy](Lessons/12 - Data Security and Privacy.md)
13. [13 - AI Governance and Compliance](Lessons/13 - AI Governance and Compliance.md)
14. [14 - Responsible AI Principles](Lessons/14 - Responsible AI Principles.md)

**Domain 4 — Operational Efficiency and Optimization (12%)**
15. [15 - Cost Optimization](Lessons/15 - Cost Optimization.md)
16. [16 - Performance Optimization](Lessons/16 - Performance Optimization.md)
17. [17 - Monitoring for GenAI Applications](Lessons/17 - Monitoring for GenAI Applications.md)

**Domain 5 — Testing, Validation, and Troubleshooting (11%)**
18. [18 - Model Evaluation Systems](Lessons/18 - Model Evaluation Systems.md)
19. [19 - Troubleshooting GenAI Applications](Lessons/19 - Troubleshooting GenAI Applications.md)

Each lesson follows the same shape: a plain-language explanation of the concept and why it's built the way it is, an inline "Quick check" you can test yourself on mid-read, worked examples, the specific traps the exam plants, 5 short practice questions, and a **Scenario Drill** of 3 longer, exam-realistic multiple-choice questions (full business context, 4 options, reasoned rationale for every option) matching the real exam's actual question style. That's 8 questions per lesson, 152 total across the 19 lessons, plus 65 in the mock exam.

## Practice and drill tools
- [Mock Exam 1](Mock Exam 1.md) — 65 scored-format questions (multiple-choice and multiple-response, matching the real exam's question types), domain-weighted to the actual blueprint, timed 170 minutes. Click-to-reveal answers.
- [Rapid Recall Cram Sheet](Rapid Recall Cram Sheet.md) — one page, every fact worth having cold on exam morning, nothing else.
- [Service Selection Drill](Service Selection Drill.md) — fast requirement → AWS service lookup across the full in-scope surface, since AIP-C01's service list is much larger than AIF-C01's.
- [Missed Questions Log](Missed Questions Log.md) — fill this in after every mock. Still the single highest-leverage note in this folder.

## How to use this folder
1. Work through the 19 lessons in order — each domain builds a coherent picture, and later lessons occasionally reference earlier ones.
2. Use the inline "Quick check" as a real checkpoint — don't expand the answer until you've actually committed to one.
3. Take [Mock Exam 1](Mock Exam 1.md) fully timed, no notes, no pausing, once the lessons are done.
4. Every miss goes into [Missed Questions Log](Missed Questions Log.md), linked back to the specific lesson that covers it.
5. Redrill [Service Selection Drill](Service Selection Drill.md) and [Rapid Recall Cram Sheet](Rapid Recall Cram Sheet.md) until they're automatic.
6. On exam morning: [Rapid Recall Cram Sheet](Rapid Recall Cram Sheet.md) only, nothing new.

## What this folder doesn't fully replace
Notes alone — even good ones — aren't the whole story for a professional-level, scenario-heavy exam like this:
- **Hands-on practice.** This exam rewards having actually touched the console/API — invoked Bedrock, configured a Guardrail, built a Knowledge Base — not just read about it.
- **Repeated timed practice at volume.** One mock exam surfaces some gaps; several, taken over time with a shrinking Missed Questions Log, surface the rest.
- **AWS's own disclaimer**: the official exam guide states it "does not provide a comprehensive list of the content on the exam." These lessons cover the full published blueprint faithfully, which is the strongest guarantee available — not a promise that literally nothing else could appear.

## Related
[README - Syllabus](../aws-genai-developer-aip-c01/README - Syllabus.md) (deep notes folder)
