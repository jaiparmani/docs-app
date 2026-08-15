---
tags: [system-design, interview, framework]
---

# Data Model and Storage Choice

<small>5 min read</small>

Continues [03 - High-Level Design and API Definition](03 - High-Level Design and API Definition.md).

## This is a numbers decision, not a taste decision

"SQL or NoSQL" asked as an abstract preference is a question with no good answer, which is exactly why it's the wrong question. The right question is narrower: given *this* entity's access pattern, consistency needs, and volume — all of which you already derived in [02 - Back-of-the-Envelope Estimation](02 - Back-of-the-Envelope Estimation.md) — which storage model fits? A single system frequently uses both: a relational store for the entities that need transactional integrity, and a wide-column or key-value store for the ones that are pure high-volume write-and-lookup. Picking one database for the entire system is itself often a mistake worth naming out loud.

## The actual decision tree

**Does this entity need multi-row transactions or joins across related data?** A payment ledger, an order-with-line-items, an account balance — these need real ACID guarantees, and a relational database is the right default. Forcing this kind of data into a key-value store means reimplementing transactional integrity yourself, badly, in application code.

**Is the access pattern a single-key lookup at very high volume, with no relational structure needed?** A tweet-by-ID, a session token, a rate-limiter counter, a vote record — these want a key-value or wide-column store precisely because that model doesn't pay the cost of joins and relational integrity it doesn't need. [Sharding](../system-design-notes/Day 21 - Database Sharding and Partitioning (HLD).md) this kind of data is also far more natural, because there's no cross-shard join to worry about.

**Is write volume the dominant constraint, far exceeding reads?** Append-only, write-optimized stores (wide-column databases, or a raw event log per Day 41) are built for exactly this shape and will outperform a relational database tuned for read flexibility.

**Does the data need full-text or fuzzy search?** Neither relational nor key-value stores do this well — that's a job for a dedicated search index, [Day 31](../system-design-notes/Day 31 - Search Systems and Elasticsearch (HLD).md), sitting alongside the primary store, not replacing it.

**Is this a fixed-size, hot, ephemeral value that's read constantly and can be regenerated if lost?** That's not really a database question at all — it's a cache question, [Day 13](../system-design-notes/Day 13 - Redis Internals (HLD).md), and belongs in front of whichever primary store you picked.

## The trap: choosing based on scale alone

"We have a lot of users, so we need NoSQL" is a non-sequitur that shows up constantly in interviews and is worth naming as a trap explicitly, because it sounds reasonable and isn't. Relational databases scale to enormous volumes with proper indexing, read replicas ([Day 19](../system-design-notes/Day 19 - Database Replication (HLD).md)), and sharding ([Day 21](../system-design-notes/Day 21 - Database Sharding and Partitioning (HLD).md)) — scale alone doesn't decide the model. What decides it is whether the *access pattern* needs relational guarantees. A banking system at modest scale still wants strong relational integrity; a social media like-counter at enormous scale still doesn't need joins. Size and shape are different axes.

## Schema comes after the model, not before

Once the storage model is picked, sketch the entities and their relationships — but keep this step brief in an interview; a full normalized ERD is not what's being asked for. Name the core entities, their key fields, and the one or two relationships that actually matter for the problem. For a hotel booking system: `Room(id, hotel_id, type)`, `Booking(id, room_id, user_id, start_date, end_date, status)` — and the one design-relevant detail worth surfacing explicitly is that `(room_id, start_date, end_date)` needs a mechanism preventing overlapping bookings, which is a concurrency problem more than a schema problem (this is exactly the double-booking issue raised in the hotel prompt in [01 - Requirement Gathering](01 - Requirement Gathering.md)).

## Practice

---

**Given:** a notification system storing "has user X been notified about event Y" flags, at a volume of billions of records, purely for point lookups by (user_id, event_id) — no queries by any other field, no joins.

> [!question]- Which storage model, and why?
> Walk the decision tree above in order.

> [!success]- Model answer
> Key-value store, keyed on `(user_id, event_id)`. No relational structure is needed — there's no join in the requirements — and the access pattern is a pure single-key lookup at high volume, which is exactly the profile a key-value store is built for. Reaching for a relational database here would mean paying for transactional guarantees and index flexibility this entity never uses. This is the LLD detail underneath [Day 34](../system-design-notes/Day 34 - Delivery Semantics (HLD).md)'s idempotency discussion for notification delivery — the flag store is precisely this kind of table.

---

**Given:** an expense-splitting app (like Splitwise) where a single expense must atomically update multiple users' balances, and balances must never be allowed to go inconsistent even under concurrent writes.

> [!question]- Which storage model, and why?
> What's the giveaway phrase in the prompt?

> [!success]- Model answer
> Relational, and the giveaway is "atomically update multiple users' balances" — that's a multi-row transaction by definition, exactly the case the decision tree flags first. A key-value store would force you to hand-roll transactional integrity across multiple keys in application code, which is both harder and more failure-prone than using the guarantee a relational database already gives you for free.

---

## Where this hands off

Storage is chosen and the schema is sketched. Now pick the one part of this design that's actually risky and reason through it fully — that's [05 - Deep Dive and Bottleneck Identification](05 - Deep Dive and Bottleneck Identification.md).


## Linked from

- [Back-of-the-Envelope Estimation](02%20-%20Back-of-the-Envelope%20Estimation.md)
- [Deep Dive and Bottleneck Identification](05%20-%20Deep%20Dive%20and%20Bottleneck%20Identification.md)
- [High-Level Design and API Definition](03%20-%20High-Level%20Design%20and%20API%20Definition.md)
- [Trade-offs and Wrapping Up](06%20-%20Trade-offs%20and%20Wrapping%20Up.md)
