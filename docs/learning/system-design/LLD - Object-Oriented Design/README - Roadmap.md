---
tags: [system-design, lld, ood]
---

# LLD / Object-Oriented Design — Roadmap

<small>3 min read</small>

Everything in system-design-notes and Claude Notes so far has been **distributed-systems LLD** — implementing a mechanism like a shard router or a Redis lock. This track is different: **classic OOD machine-coding** — the "design a Parking Lot / Elevator / Vending Machine in 45 minutes" round, testing SOLID principles and design patterns through class diagrams and working code, not distributed-systems trade-offs. Common at product companies as a distinct interview stage from HLD system design.

The two tracks share almost nothing except vocabulary overlap ("LLD"). Distributed LLD asks "how does this mechanism behave under concurrency/failure." OOD machine coding asks "is this class hierarchy extensible without modification, and did you reach for the right pattern instead of an if/else ladder."

## Sequence

**Foundations (do these before any applied problem):**
1. [01 - SOLID Principles](01 - SOLID Principles.md) — the five principles every pattern and every interviewer's follow-up question ("what if we need to add X") is actually testing.
2. [02 - Creational Design Patterns](02 - Creational Design Patterns.md) — Singleton, Factory, Builder: patterns about *how objects get created*.
3. [03 - Structural Design Patterns](03 - Structural Design Patterns.md) — Adapter, Decorator, Facade, Composite: patterns about *how objects are composed*.
4. [04 - Behavioral Design Patterns](04 - Behavioral Design Patterns.md) — Strategy, Observer, State, Command: patterns about *how objects communicate and change behavior*.

**Applied (each one deliberately forces you to combine 2-3 patterns, not use one in isolation):**
5. Machine Coding Problems/01 - Design a Parking Lot — Strategy (pricing/spot-assignment) + Factory (vehicle/spot creation).
6. Machine Coding Problems/02 - Design an Elevator System — State (elevator states) + Strategy (scheduling algorithm) — the classic "state machine as a first-class object" problem.
7. Machine Coding Problems/03 - Design a Vending Machine — State (machine states: idle/selecting/dispensing) — the canonical State pattern problem, deliberately right after Elevator so you see the same pattern reused in a smaller, cleaner example.
8. Machine Coding Problems/04 - Design Splitwise (Expense Sharing) — Strategy (split types: equal/exact/percentage) + a graph-simplification algorithm — the one problem in this set with real algorithmic content, not just OOD structure.

## How this differs from the applied HLD track
| | [Applied HLD (Claude Notes)](../Claude Notes/03-design-twitter.md) | Applied OOD (this track) |
|---|---|---|
| Core question | How does this scale / stay available / stay consistent | Is this extensible / does it violate SOLID / which pattern fits |
| Deliverable | Architecture diagram, service boundaries | Class diagram, interfaces, working code sketch |
| "Gaps to close" section tests | Trade-off articulation under scale | Correct pattern recognition, SOLID violations you'd otherwise miss |
| Typical interview length | 45-60 min, no code | 45 min, actual code expected |

## How to use this
- Don't skip straight to the applied problems — half the point of Parking Lot/Elevator/Vending Machine is recognizing *which* pattern from notes 1-4 fits, and that recognition only works if the patterns are already familiar going in.
- Each applied note's "Deep dive: pattern choice" section is the highest-signal part — it's not enough to produce a working class diagram, you need to be able to say *why* Strategy and not a switch statement, unprompted.
- After these four applied problems, good next additions (not yet built): Design a Library Management System, Design a Chess Game, Design a Movie Ticket Booking System (BookMyShow-style), Design an LRU Cache using OOD patterns explicitly (contrast with [Day 14 - LRU Cache Implementation (LLD)](../system-design-notes/Day 14 - LRU Cache Implementation (LLD).md)'s data-structure-only framing).

## Related
[Syllabus](../Syllabus.md) · system-design-notes · Claude Notes
