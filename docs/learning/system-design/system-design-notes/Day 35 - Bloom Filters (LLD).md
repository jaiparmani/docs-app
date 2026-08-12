# Day 35 — Bloom Filters (LLD)

## What we're learning today
Closes Block A. Day 34 ended on "how do you cheaply check if you've seen this key before" — a Bloom filter is the concrete data structure that answers exactly that, when the set of "seen" keys is too large to store and look up directly.

## Core concept
A **Bloom filter** is a probabilistic set-membership structure: it can tell you "definitely not in the set" or "probably in the set" (never "definitely in the set") using far less memory than storing the actual elements — at the cost of a tunable false-positive rate and no way to remove elements.

## Visual diagram
```
Bit array (size m), initially all 0:  [0 0 0 0 0 0 0 0 0 0]

Add "user_123": hash1("user_123")=2, hash2("user_123")=5, hash3("user_123")=8
                -> set bits 2, 5, 8 to 1
                [0 0 1 0 0 1 0 0 1 0]

Check "user_123": are bits 2, 5, 8 all 1? Yes -> "probably in the set"
Check "user_999": hash to bits 2, 5, 9. Bit 9 is 0 -> "definitely NOT in the set"
```

## Explanation
- **Why not just use a hash set:** a hash set storing millions/billions of actual keys costs real memory proportional to key count and size. A Bloom filter uses a fixed-size bit array regardless of how many keys are inserted (memory only grows with the *false-positive-rate target*, not linearly with element count) — a massive space saving when you only need approximate membership.
- **No false negatives, but false positives are possible:** if the filter says "not in the set," that's always correct — no bits could be 1 for an element never inserted, in a way that produces a false "definitely not." If it says "probably in the set," it might be wrong — another element's hashes could have coincidentally set the same bits (a **collision** across multiple elements' hash outputs).
- **Can't remove elements:** clearing a bit to remove one element could un-set a bit another element also depends on, silently corrupting the filter for that other element. (A variant, **Counting Bloom Filters**, uses counters instead of bits specifically to support removal — worth knowing exists, not required to derive.)
- **Tuning the false-positive rate:** more bits (bigger `m`) or more hash functions (`k`) relative to the number of elements inserted lowers the false-positive rate — a direct memory-vs-accuracy trade-off, tuned based on how costly a false positive actually is for your use case.
- **The key pattern: use it as a cheap pre-filter in front of an expensive check, never as the sole source of truth.** "Definitely not in the set" lets you skip the expensive check entirely (cache miss, DB lookup, dedup lookup); "probably in the set" means you still do the expensive check to confirm — the Bloom filter just filters out the definite-nos cheaply.

## Real-world examples
- **Chrome's Safe Browsing:** checks URLs against a Bloom filter of known-malicious sites *before* making a network call to the full server-side database — most URLs are safe, hit "definitely not in the set," and skip the network call entirely; only the rare "probably malicious" URLs trigger the expensive check.
- **Cassandra / HBase:** each SSTable (on-disk file) has a Bloom filter of the keys it contains — a read for a key that's "definitely not" in a given SSTable skips reading that file from disk entirely, avoiding wasted disk I/O across files that don't have the key.
- **Your idempotency-key dedup check ([Day 24](Day 24 - Idempotency Keys (LLD).md) / [Day 34](Day 34 - Delivery Semantics (HLD).md)):** at billions of processed keys, a Bloom filter as a first-pass check ("have we possibly processed this key?") avoids hitting the real dedup store (Redis/DB) for the vast majority of genuinely-new keys, which the filter correctly identifies as "definitely not seen" — the real store is only consulted for the fraction that come back "probably seen."

## Interview perspective
The check here is whether you can state the two guarantees precisely: **no false negatives, possible false positives** — candidates who get this backwards (or vague) haven't internalized the structure. The second check is recognizing the "pre-filter in front of an expensive operation" *usage pattern* — a Bloom filter is rarely the final answer to a design question, it's a cost-reduction layer in front of the real answer.

## Trade-offs
| | Hash set (exact) | Bloom filter |
|---|---|---|
| Memory | O(n), grows with element count and size | Fixed-ish, tuned by target false-positive rate |
| False positives | None | Possible (tunable rate) |
| False negatives | None | None |
| Supports removal | Yes | No (without a counting variant) |
| Gives exact membership | Yes | No — "definitely not" or "probably" only |

## Interview question
"You're building a dedup check for a stream processing billions of events. Why would you put a Bloom filter in front of your Redis-based dedup store instead of just querying Redis directly for every event?"

> [!question]- Think it through, then expand
> Think about what fraction of events are actually duplicates in a typical stream.

> [!success]- Answer
> In most real streams, the overwhelming majority of events are genuinely new, not duplicates — so most dedup checks should resolve to "not seen before." Querying Redis for every single event means paying a network round-trip for every one of those, even though most will come back "not found." A Bloom filter held in local memory answers "definitely not seen" for most of those events instantly, with no network call at all — Redis is only queried for the smaller fraction that the Bloom filter says "probably seen" (which then get a real, exact check). The Bloom filter doesn't replace Redis; it removes the majority of traffic that would otherwise hit it.

## Key design principle
**A Bloom filter's job is to cheaply eliminate the "definitely no" cases before an expensive exact check runs on what's left — it is a cost-reduction layer, not a replacement for the source of truth.**

## 30-second challenge
If you sized a Bloom filter's bit array too small relative to the number of elements you actually insert, what happens to its usefulness as a pre-filter — and why?

## Next
[04-design-notification-system](../Claude Notes/04-design-notification-system.md) and [05-design-job-scheduler](../Claude Notes/05-design-job-scheduler.md) both leaned on ideas from this block (delivery semantics, idempotency) before this block existed as notes — worth a quick re-read now that the vocabulary is formalized. Block B starts next: Leader Election & Consensus (Day 36), the direct extension of [Distributed Locks](Day 29 - Distributed Locks (HLD).md) into "how do you get a coordinator without a single point of failure."
