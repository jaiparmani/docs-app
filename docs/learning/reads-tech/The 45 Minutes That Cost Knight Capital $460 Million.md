---
tags: [reads, tech, engineering-history, incidents, finance, deployments]
---

# The 45 Minutes That Cost Knight Capital $460 Million

<small>6 min read</small>

On the morning of August 1, 2012, Knight Capital Group — one of the largest market makers on the New York Stock Exchange, responsible at the time for something like ten percent of all US equity trading volume — turned on new software and started losing about ten million dollars a minute. By the time anyone managed to stop it, 45 minutes later, the firm had accumulated a mountain of unwanted stock positions, taken a loss north of $460 million, wiped out most of its capital, and set itself on a path to being acquired within months. Nobody hacked Knight Capital. Nobody committed fraud. An ordinary deployment, done almost right, put the firm out of business before lunch.

The proximate cause was a new feature called RLP, for Retail Liquidity Program, meant to let Knight's system fill retail orders more efficiently. Rolling it out meant pushing updated trading software to eight servers that handled order routing. Seven of the eight received the new code cleanly. The eighth did not. Nobody caught the discrepancy, and the market opened forty minutes later with one server running old code sitting alongside seven running new code, all reading from the same order flow, all authorized to send live orders to the exchange.

## Dead code isn't safe code

Here is the detail that makes this incident more than a story about a bad deploy: the old code on that eighth server wasn't just outdated, it was code Knight believed was retired. Years earlier, the same server flag had been used to trigger a different, defunct feature called Power Peg, a test function that bought and sold stock aggressively to see how the system behaved under load. Power Peg had been decommissioned, but the code that implemented it was never deleted — it was simply no longer called, because nothing in the current system was supposed to set that flag anymore.

The new RLP deployment reused the flag. Not maliciously, not even carelessly in isolation — it's a small, easy-to-make assumption that an unused flag is a free flag. But on the one server that never got the update, setting that flag didn't activate RLP. It woke up Power Peg, which still lived in the binary, still had full authority to trade, and interpreted incoming retail orders as triggers to start buying and selling aggressively and repeatedly, chasing execution rather than filling a customer order once. Multiply that by every order the retail system routed through that server for 45 straight minutes, across 150-odd stocks, and you get a firm accidentally running a runaway trading bot on live capital markets infrastructure with no one at the controls.

This is the part worth sitting with: nothing about Power Peg's code had a bug in the conventional sense. It did exactly what it was written to do. The failure wasn't a broken function — it was a function nobody remembered was still loaded, waiting for a condition that everyone assumed could never occur again. "It's not called anymore" is a claim about the current call graph. It is not a claim about what happens if a stale binary and a repurposed signal ever line up again, and codebases that live long enough eventually test that distinction whether anyone intends them to or not.

## Eight servers, one truth, and no way to tell

A single misconfigured machine is usually a contained problem. A fleet of eight machines where seven agree and one disagrees is a much stranger kind of failure, because the system as a whole has no single, coherent behavior to describe. Depending on which server happened to route a given order, Knight's infrastructure was simultaneously running two entirely different trading strategies against the same market, under the same firm name, at the same moment. There was no dashboard built to ask "do all eight of these machines currently agree on what code they're running," because the deployment process was assumed to make that true by construction, and nobody built a check for the case where the assumption failed.

Partial rollouts are usually framed as a safety feature — canary a change on a subset of a fleet, watch it, then finish the rollout. That framing only holds when the two populations are doing distinguishable, monitored things and someone is positioned to compare them before real damage accrues. Knight's partial rollout was accidental rather than intentional, unmonitored rather than observed, and left running for forty-plus minutes before anyone connected the dashboard's alarming numbers to a code discrepancy on one specific box. An intentional canary with a five-minute health check would have caught this in the time it takes to notice a graph move. An accidental one, left unwatched, became the mechanism of the disaster instead of the safeguard against it.

## The missing kill switch

Even after engineers suspected something was wrong, stopping it took precious time, because there was no single, well-rehearsed action that would immediately halt all order flow from the misbehaving system. Engineers ended up trying several fixes in sequence — some of which, according to later accounts, briefly made things worse by shifting load in unpredictable ways — while the erroneous orders kept executing in the market. A kill switch sounds like a low-tech, almost embarrassingly simple thing to want. It is also one of the most reliably absent pieces of infrastructure in systems built by people who spent all their design effort making the system do things, and comparatively little making it stop.

## The generalizable lesson

Knight Capital's failure is a specific, gruesome instance of a very general pattern: systems accumulate code and configuration that outlives its intended lifetime, and the presence of that code costs nothing right up until some later, unrelated change gives it a reason to run again. Deleting dead code is not housekeeping — it's removing a liability that has a nonzero probability of reactivating under conditions nobody currently working on the system will think to check for. Flags, feature toggles, and server-local state are especially dangerous here, because they're cheap to add, rarely audited, and often reused across unrelated features under time pressure, exactly the conditions where a name collision between "new feature" and "old, forgotten feature" goes unnoticed.

The other half of the lesson is about what a fleet is for. A deployment across many machines is not safe because the machines are redundant; redundancy only helps when the machines are guaranteed to agree, or when disagreement is instantly detectable and actionable. A fleet running inconsistent code is not eight times safer than one machine — it is a machine whose actual behavior is undefined, because it depends on which of eight different programs happens to answer a given request. Build the check for that state before you need it, and build the switch that turns everything off in one motion, because by the time you're reaching for either, you'll have far less time than you think.


## Linked from

- [1_Tech & Engineering](index.md)
