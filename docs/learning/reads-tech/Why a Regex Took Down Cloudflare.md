---
tags: [reads, tech, engineering-history, incidents, security]
---

# Why a Regex Took Down Cloudflare

On July 2, 2019, a large fraction of the internet returned 502 errors for about half an hour. Cloudflare sits in front of an enormous number of websites as a reverse proxy, so when Cloudflare's HTTP serving path stops serving HTTP, the failure is not localized to one company's users — it is localized to "the web," approximately. Traffic across their global network dropped sharply and stayed down until engineers found the cause and hit a kill switch.

The cause was a deploy to their Web Application Firewall. Specifically, a new managed rule intended to catch inline JavaScript in requests, and specifically, one regular expression inside it. The regex was not malicious, not obviously wrong, and was not caught by the review and testing the change went through. When it hit production it drove CPU utilization to 100% on every machine running the WAF, worldwide, essentially at once. There was no capacity left to serve requests, so requests were not served.

Cloudflare published a detailed public postmortem afterward, and it remains one of the better incident writeups in the industry — not because the failure was exotic, but because they explained the mechanism rather than the narrative.

## What a backtracking engine is actually doing

Most people carry a mental model of regex as pattern matching, which is true but hides the important part: how the match is computed. The regex engines built into Perl, Python, Java, JavaScript, Ruby, .NET, and PCRE (which Cloudflare's Lua-based WAF used) are **backtracking** engines. They work by exploring possibilities depth-first and undoing choices that don't pan out.

Take `a+` matching against `aaaa`. The `+` is greedy, so the engine consumes all four `a`s. If whatever comes next in the pattern fails to match, the engine doesn't give up — it backs off one character, hands three `a`s to the `+`, and tries again. Fail again, back off to two. This is normally fine. There are only five ways to split a run of four characters, and the engine walks them in order.

Now nest it. Consider `^(a+)+$` matched against a string of twenty `a`s followed by a single `b`.

The inner `a+` can grab any number of `a`s. The outer `+` can repeat the group any number of times. So the engine is no longer choosing one split point — it is enumerating every way to partition the run of `a`s into an ordered sequence of non-empty groups. For a run of length n, the number of such partitions is 2^(n-1). Every one of them matches the `a` portion perfectly. Every one of them then hits the trailing `b`, fails against `$`, and forces the engine to back up and try the next arrangement.

This is the crucial asymmetry: **the input has to almost match.** If the string were all `a`s, the first attempt would succeed instantly. If it started with `b`, the engine would bail immediately. The pathological case is a long valid prefix followed by a single character that invalidates everything — because that's what forces the engine to prove exhaustively that no arrangement works. Twenty characters is microseconds. Forty is about a million times worse than twenty. Sixty is about a million times worse than forty, which is a roundabout way of saying you will never see the answer.

You don't need literal `(a+)+` for this. Any pattern where two quantified constructs can match the same characters produces the same ambiguity — `(a|a)*`, `(\s*\w+)*`, `(.*)*`, and, in the Cloudflare case, an expression containing the fragment `.*(?:.*=.*)`. Read that carefully: a greedy `.*` followed by a group that itself contains greedy `.*` on both sides of an `=`. Any given position in the input can be attributed to several of those wildcards. The engine has no way to know which assignment is correct without trying them, and on request bodies of realistic size, "trying them" does not terminate on any useful timescale.

Cloudflare's postmortem also noted something that turns a bad rule into an outage: a protection that limited CPU consumption by WAF rules had been removed some weeks earlier, during work to reduce the WAF's CPU usage. The guardrail against exactly this class of failure was gone before the failure arrived. That is not a coincidence so much as a pattern — safety mechanisms get removed during efficiency work precisely because, having never fired, they look like overhead.

## Two ways to match a string

Backtracking is not the only design. Thompson-style engines — RE2 (Google), the Rust `regex` crate, Go's standard library — compile the pattern into a finite automaton and simulate it, tracking the set of all states the machine could currently be in and advancing that set one input character at a time.

Because the engine carries all possibilities forward simultaneously rather than trying them one at a time, there is nothing to backtrack. The number of states is bounded by the size of the pattern, not the input, so matching runs in time linear in the input length regardless of what the pattern looks like. Feed `(a+)+` to RE2 and it is boring. There is no input that makes it explode.

The tradeoff is real: these engines drop backreferences and lookaround assertions, because those features are not regular in the formal sense and cannot be expressed as a finite automaton. For a WAF — or any system evaluating patterns against untrusted, attacker-chosen input at high volume — that is an easy trade. Cloudflare's own remediation discussion pointed toward exactly this class of engine.

## ReDoS is a real vulnerability class

Reframe the mechanism as an attack and you get ReDoS: regular expression denial of service. Find any place where user-controlled input is matched against a backtracking regex with ambiguous quantifiers — an email validator, a log parser, a Markdown renderer, a User-Agent sniffer, a URL router, a dependency's input sanitizer — and you have a request that costs the attacker nothing to send and costs the server a CPU core indefinitely. No volume required. One request, one pinned core. A handful of requests, one dead process.

This shows up regularly in npm and PyPI advisories, and it is almost always in exactly the kind of code nobody audits: a well-meaning validation regex, written years ago, in a library three levels deep in the dependency tree. Cloudflare's version is unusual only in that the "attacker" was their own deploy pipeline, and the blast radius was global.

## The part that made it an outage instead of an incident

Every organization running a large fleet knows to stage deploys. Cloudflare knew. But WAF rules were treated as a different category from code — rules are data, rules are urgent, a rule that blocks a live exploit is worth pushing everywhere in seconds. So they went everywhere in seconds.

That reasoning is sound in isolation and wrong in aggregate, because it quietly reclassifies something as low-risk based on what it *is* rather than what it *can do*. A WAF rule is a small text change. It is also a program executed on every request in the critical path of the entire network. The first framing earns fast global rollout; the second framing would never get it.

This is the generalizable lesson, and it applies well beyond regex. Config, feature flags, ML models, DNS records, IAM policies, routing tables — the categories of change that teams exempt from staged rollout are almost never exempted because they are provably safe. They are exempted because they don't look like code, and the deploy safety culture attaches itself to things that look like code. The failure domain doesn't care about that distinction. If a change can take down every machine, it needs a canary, an automatic health check, and a fast rollback path, no matter how small the diff is or how obviously correct it looks in review.

The regex was the bug. The reason a bug became a global outage was a taxonomy — an implicit belief that some changes are too small to need a blast radius.
