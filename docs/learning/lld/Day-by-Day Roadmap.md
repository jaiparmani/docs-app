---
tags: [lld, ood]
---

# LLD — Day-by-Day Roadmap

A separate track from system-design-notes's distributed-systems LLD (shard routers, distributed locks — "how does this mechanism behave under concurrency/failure"). This track is classic **OOD machine coding** — the "design a Parking Lot in 45 minutes" interview round, testing SOLID principles and design-pattern recognition through class diagrams and working code. There's already an older [LLD - Object-Oriented Design](../system-design/LLD - Object-Oriented Design/README - Roadmap.md) set of notes; this track covers the same ground from scratch in the Day-N format, with a built-in interview question + collapsible answer on every topic, so it's active recall, not re-reading.

## Sequence

**Foundations:**
1. [Day 1 - SOLID Principles (LLD)](Day 1 - SOLID Principles (LLD).md) — the five principles every pattern and every "what if we need to add X" follow-up is actually testing.
2. [Day 2 - Strategy Pattern (LLD)](Day 2 - Strategy Pattern (LLD).md) — swapping an algorithm's behavior without touching the code that uses it.
3. [Day 3 - State Pattern (LLD)](Day 3 - State Pattern (LLD).md) — turning "what can this object legally do right now" into an explicit, extensible class hierarchy instead of a status flag.

**Not yet written — next in sequence:**
4. Factory & Builder — patterns about *how objects get created*.
5. Observer — patterns about *how objects react to change without tight coupling*.
6. Adapter, Decorator, Facade, Composite — patterns about *how objects are composed*.
7. Applied: Design a Parking Lot (Strategy + Factory).
8. Applied: Design an Elevator System (State + Strategy).
9. Applied: Design a Vending Machine (State, in a smaller cleaner example).
10. Applied: Design Splitwise (Strategy + graph simplification).

## How to use this

Each day's "Interview question" has a collapsed answer — write your own answer before expanding it. The point isn't reading the pattern's definition, it's noticing *when* a piece of code is asking for that pattern before being told which one applies.

## Related

[Syllabus](../system-design/Syllabus.md) · system-design-notes · [README - Roadmap](../system-design/LLD - Object-Oriented Design/README - Roadmap.md)
