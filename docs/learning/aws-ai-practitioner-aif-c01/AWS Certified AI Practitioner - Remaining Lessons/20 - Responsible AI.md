---
tags: [aws, certification, ai-practitioner, responsible-ai]
lesson: 20
exam: AIF-C01
---

# Responsible AI

<small>2 min read</small>

> **Goal:** Design and use AI systems so they are fair, safe, transparent, privacy-aware, and subject to appropriate oversight.

## Principles and risks

| Principle / risk | Meaning | Example mitigation |
|---|---|---|
| Fairness / bias | Avoid unjust outcomes for groups | Representative data, bias testing, human review |
| Transparency | Clearly communicate AI use and limitations | Disclose AI involvement and sources where appropriate |
| Explainability | Help people understand a decision | Explain influential factors for high-impact decisions |
| Privacy | Protect personal and sensitive data | Data minimization, access controls, encryption |
| Safety | Prevent harmful or unsuitable outcomes | Guardrails, testing, escalation paths |
| Hallucination | Plausible but unsupported output | RAG, grounded prompts, review |

## Lifecycle approach

1. Define intended use, users, and unacceptable outcomes.
2. Assess data quality, representation, and privacy.
3. Test outputs for bias, safety, quality, and misuse.
4. Deploy controls, human oversight, and user feedback paths.
5. Monitor and improve over time.

## AWS examples

- Use Bedrock Guardrails to help constrain harmful or unwanted content.
- Use RAG and citations/attribution where appropriate to ground enterprise answers.
- Use IAM and KMS to help protect data; these support responsible use but do not by themselves make a model fair.

## Exam tips

- **Bias** is unfair systematic behavior; **hallucination** is unsupported or incorrect content.
- High-impact decisions (healthcare, lending, hiring) need stronger validation and human oversight.
- Responsible AI is continuous, not a one-time check before launch.
- Reducing risk does not mean a system is risk-free.

## Practice questions

1. A loan model has worse approval outcomes for a protected group. What concern is most directly raised?  
   A. Tokenization  B. Bias and fairness  C. Context-window size  D. Latency

2. What is an appropriate control for high-stakes AI-assisted medical guidance?  
   A. Remove all human review  B. Increase temperature  C. Human oversight and rigorous evaluation  D. Use only a longer prompt

**Answers:** 1-B, 2-C.

## Next

[21 - Security Compliance and Governance](21 - Security Compliance and Governance.md)
