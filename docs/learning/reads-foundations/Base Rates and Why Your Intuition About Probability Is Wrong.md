---
tags: [reads, foundations, reasoning, statistics]
---

# Base Rates and Why Your Intuition About Probability Is Wrong

<small>6 min read</small>

Here is a question that has been put to doctors, medical students, and statisticians for decades, and which most of them get wrong.

A disease affects 1 in 1,000 people. There is a test for it. The test correctly identifies the disease essentially every time someone has it. It also has a 5% false positive rate — meaning that of healthy people who take it, 5% will be told they have the disease anyway.

You take the test. It comes back positive. What is the probability you actually have the disease?

Most people answer somewhere around 95%. The reasoning feels airtight: the test is 95% accurate, it said yes, so there's a 95% chance it's right. The actual answer is about 2%.

## Working it out slowly

The way to see this is to stop thinking about probabilities and start thinking about people. Imagine 1,000 people take the test.

Because the disease affects 1 in 1,000, roughly **one** of those people actually has it. The test is excellent at catching real cases, so that person tests positive. One true positive.

The other 999 people are healthy. But the test has a 5% false positive rate, so about 5% of those 999 — roughly **50 people** — will also test positive despite being perfectly fine.

So at the end of the day, 51 people are holding a positive test result. Exactly one of them is sick. If you are one of those 51 people, your chance of being the sick one is 1 in 51 — a little under 2%.

Nothing about the test's accuracy changed. The test really does have a 5% false positive rate, and it really does catch nearly every genuine case. What changed is that we accounted for how rare the disease is to begin with. That starting rarity — 1 in 1,000 — is the **base rate**, and ignoring it is one of the most reliably wrong things human intuition does.

## Why the mistake is so natural

The reason this trips people up isn't stupidity. It's that our minds substitute an easier question for a harder one.

The hard question is: *given a positive result, how likely is disease?* The easy question is: *given disease, how likely is a positive result?* Those two things feel like the same question and are not remotely the same number. The second is about 100%. The first is about 2%.

There's also something more basic going on. Vivid, specific evidence feels compelling in a way that dry background statistics do not. A positive test result is concrete and personal and sitting right in front of you. "One in a thousand people have this" is abstract and about strangers. Psychologists call the general tendency here representativeness — we judge how likely something is by how well it *matches a pattern*, rather than by how common it actually is.

This is why people are more frightened of shark attacks than of car journeys, and why a candidate who "just seems like a founder" gets funded over one whose numbers are better. The pattern-match is loud and the base rate is silent.

## Bayes' theorem is just this, formalised

There's a piece of mathematics that encodes exactly what we did with those 1,000 imaginary people, called Bayes' theorem. It has a slightly forbidding formula, but the idea underneath it is not complicated:

**Start from where you were. Move in the direction the evidence points. Move proportionally to how strong the evidence is.**

The starting point is the base rate — the prior. The evidence is the test. The mistake almost everyone makes is skipping the first step entirely: leaping straight to where the evidence points, as if you had no information before the evidence arrived. But you did. You knew the disease was rare. That knowledge doesn't evaporate because a test beeped.

The strength of the evidence matters too, and this is where the arithmetic bites. A test with a 5% false positive rate sounds strong. But when you're hunting for something that occurs in 0.1% of cases, a 5% error rate is *fifty times larger than the thing you're looking for*. The noise swamps the signal, not because the test is bad, but because the target is rare.

## Where engineers meet this problem

If you build software, you have almost certainly shipped a version of this and possibly not noticed.

Consider a fraud detection model that is "99% accurate." Fraud might occur in 0.1% of transactions. Run that model over a million transactions: 1,000 are genuinely fraudulent and the model catches them, but 1% of the 999,000 legitimate transactions — nearly 10,000 of them — get flagged too. Your fraud team now has 11,000 alerts to review, and 90% of them are innocent customers whose cards you just declined. The model's accuracy was never the problem. The rarity of fraud was.

This is precisely why nobody serious evaluates a rare-event classifier on accuracy. A model that simply predicted "not fraud" for every single transaction would be 99.9% accurate and completely worthless. It's why **precision** (of the things I flagged, how many were real?) and **recall** (of the real things, how many did I catch?) exist as separate numbers — they're the two questions the base rate forces apart, the same two questions that got tangled in the medical test above.

The same shape recurs everywhere: security alerts that overwhelm the team reviewing them, monitoring thresholds that fire constantly until everyone ignores them, screening tools that surface far more false leads than real ones. In each case, someone built a detector with a perfectly respectable error rate, pointed it at something rare, and was surprised by the flood.

## What this actually buys you

Once you've internalised base rates, a particular question becomes automatic: **how common is the thing being claimed, before I saw this evidence?**

A startup pitches an idea that sounds brilliant. How many brilliant-sounding pitches succeed? A candidate interviews spectacularly. How many spectacular interviewers turn out to be strong hires? A striking research finding lands in your feed. How many striking findings hold up?

You are not being cynical by asking. You're doing the thing the medical test example demands: refusing to jump straight to where the evidence points, and insisting on knowing where you started from.

The uncomfortable implication is that when you're looking for something genuinely rare, **most of your positive signals will be wrong even with a good detector**. That isn't a failure of your tools. It's arithmetic. And the practical response is usually not to hunt for a better detector, but to accept that a single positive result is only ever the start of an investigation — never the end of one.


## Linked from

- [6_Foundations](index.md)
