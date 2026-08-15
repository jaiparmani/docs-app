---
tags: [reads, finance, compounding, mental-models]
---

# Why Humans Are Terrible at Exponentials

<small>6 min read</small>

Ask someone to estimate how far a car travels in six hours at sixty miles an hour and they will get it right without writing anything down. Ask the same person how much a pot of money becomes after forty years at seven percent a year and they will almost certainly guess low, often by a factor of several. Both questions are arithmetic. Only one of them is arithmetic the human nervous system evolved to do.

The linear question is easy because linear things are what a body encounters. Walking, throwing, pouring, stacking — direct physical experience is almost entirely additive, and a brain calibrated on it develops a reliable feel for rates. Exponential processes are rarer and, crucially, boring for a long time before they are dramatic. By the time one becomes visually obvious, most of the interesting decisions about it have already been made. This is not a failure of intelligence. It is a mismatch between the shape of the process and the shape of the intuition.

## The Doubling Clock

The cleanest way to build a feel for compounding is to stop thinking in percentages and start thinking in doublings. Anything growing at a steady percentage rate doubles on a fixed schedule, and once you know the schedule the rest of the picture assembles itself.

The shortcut is the rule of 72: divide 72 by the annual percentage rate to approximate the number of years to double. At 6 percent, roughly twelve years. At 9 percent, roughly eight. At 2 percent, roughly thirty-six. It is an approximation, and it should be treated as one — it is most accurate for rates in the mid single digits to low teens and drifts at the extremes. At 7 percent it predicts 10.3 years against a true value of about 10.2, which is close enough for a train journey. At 20 percent it predicts 3.6 years against a true value of about 3.8, which is close enough to be useful and wrong enough that you should not build a spreadsheet on it.

The value of the doubling frame is that it makes the back-loading visible. Take 7 percent over forty years, which multiplies your starting amount by roughly 15. Thirty years in, the multiple is about 7.6 — just over half the final figure. **The last quarter of the time period produces nearly half of the total outcome.** In any final doubling period, the money grows by as much as it did in the entire history preceding it, because that is definitionally what a doubling is. This is why exponentials feel like they arrive suddenly. Nothing arrived suddenly. You were watching a doubling sequence and only the last few terms were large enough to notice.

## Why Time Beats Money

This back-loading has a consequence that most people accept intellectually and still fail to feel: for a long compounding series, when you start matters more than how much you put in.

Here is an illustrative comparison, with round numbers chosen to make the arithmetic legible rather than to describe anyone's actual situation. Two people, same assumed 7 percent annual return, same forty-year horizon. The first invests 5,000 a year for ten years and then stops contributing entirely, letting the balance compound untouched for the remaining thirty. The second contributes nothing for ten years, then invests 5,000 a year for the next thirty.

The first person contributes 50,000 in total. Their ten years of contributions grow to roughly 69,000, and thirty further years of compounding multiply that by about 7.6, ending near 526,000. The second person contributes 150,000 — three times as much — and ends near 472,000. The early starter put in a third of the money and finished ahead.

The numbers are made up, the return is assumed constant when real returns are anything but, and no real portfolio behaves this tidily. But the structural point survives all of that: the first person's contributions each got forty-ish years of doublings, the second person's got thirty or fewer, and in an exponential process those extra years at the front are worth more than a large volume of cash at the back. Time is the exponent. Money is only the base.

## The Same Machine, Run Backwards

Here is the half that gets less attention and deserves more. Compounding is not a wealth-building mechanism. It is a mathematical property of proportional growth, and it is perfectly indifferent to whose side it is on.

Consider a fee. Suppose an investment would return 7 percent a year and you pay 1 percent a year to hold it, leaving 6 percent. Over forty years, 7 percent multiplies your money by about 15.0 and 6 percent multiplies it by about 10.3. The ratio is roughly 0.69, meaning that a one percent annual fee — a number small enough that most people would not bother to negotiate it — has consumed close to **31 percent of the final outcome**. Make it a 2 percent fee and the surviving fraction falls to about 47 percent. You paid 2 percent a year and it cost you half of everything. The fee compounds because every unit taken this year is also a unit that cannot double next year, and the year after, and so on to the end.

The same engine drives consumer debt. A credit card at 20 percent nominal, compounded monthly, has an effective annual rate near 22 percent, which by the rule of 72 doubles a balance in a bit over three years. A balance carried and ignored for a decade is not a balance plus interest; it is a balance that has passed through three doublings. The lender is running exactly the arithmetic that the disciplined saver runs, in the same direction, on the other side of the table.

## Everything Else That Bends

Once the shape is familiar, it shows up far from money. Epidemics are the obvious case: an infection with a steady growth rate looks like a rounding error for weeks and then like a catastrophe in days, and every argument about whether the response was an overreaction is really an argument about where on the curve you were standing. Technology adoption has the same signature — the thing that "came out of nowhere" was usually doubling quietly for a decade at a base too small to register.

Software engineers meet it as technical debt. A codebase degrades non-linearly because each new piece of complexity interacts with the complexity already present, so the cost of the next change grows in proportion to the mess rather than adding to it. A team that feels the slowdown has already spent most of the runway.

The uncomfortable conclusion is that there is no fix at the level of intuition. You do not get better at feeling exponentials with practice; experienced investors and epidemiologists still guess low when caught without a calculator. What changes is that they stop trusting the guess. The defence against a process your mind cannot represent is not a better mind. It is the discipline of writing the numbers down every single time — and treating the moment when a growth curve still looks flat as the moment the decision actually matters.


## Linked from

- [4_Finance](index.md)
