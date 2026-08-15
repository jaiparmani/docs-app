---
tags: [reads, tech, engineering-history, incidents, safety-critical-systems]
---

# The Bug That Killed People

<small>6 min read</small>

Between 1985 and 1987, a computer-controlled radiation therapy machine called the Therac-25 delivered massive overdoses of radiation to at least six patients in the United States and Canada. Some received more than a hundred times the intended dose in a fraction of a second. Several died from the injuries. The machine, built by Atomic Energy of Canada Limited, was used in cancer clinics to deliver two kinds of treatment: a low-power electron beam for shallow tumors, and a much higher-power beam passed through a metal target and spreading filter to produce X-rays for deeper ones. The two modes needed wildly different hardware configurations, because the raw electron beam used for X-ray production was, unfiltered, thousands of times more intense than anything that should ever touch a patient directly.

The machine sometimes delivered exactly that: the high-power beam, unspread, aimed at a patient as if it were the gentle low-power mode. Operators described the machine flashing a terse error — "Malfunction 54" — and appearing to abort, giving no indication that anything harmful had occurred. Patients reported a burning sensation and left the room to later discover their skin had been catastrophically burned and their internal tissue destroyed. The engineering investigation that followed is now a standard case study in software safety, not because the bug was exotic, but because it sat at the intersection of two very ordinary failures: a race condition, and the decision to trust software with a job that hardware used to do.

## What was actually racing

The Therac-25's control software ran the treatment console as a set of concurrent tasks — one handling the operator's keyboard input as they entered treatment parameters, another managing the physical setup of the machine (which mode, what beam energy, whether the spreading target was in position), and a third that actually fired the beam once everything checked out. These tasks shared data in memory, and correctness depended on that shared data being consistent at the moment the beam-firing task read it.

The specific flaw: an experienced operator, typing quickly and correcting a data-entry mistake within the several seconds the software allowed for edits, could change the treatment mode on-screen after the setup task had already begun configuring the machine's hardware for the original mode. The keyboard-handling task updated the software's record of "what mode is selected" essentially instantly. The setup task, which was physically moving a turntable to position (or not position) the beam-spreading hardware, took longer, because it was moving something. If the operator's edit landed in that window, the software would proceed to fire the beam believing the correction had been applied, while the physical machine was still mid-transition — sometimes with no spreader in place at all. The beam fired in raw, high-power form.

This is the essential shape of a race condition: two sequences of operations, each individually correct, whose result depends on which one finishes first, when nothing in the code enforces an order. It is not a typo or a miscalculated formula. The code that handles each case in isolation can pass every test that exercises it alone. The bug only exists in the gap between two things happening concurrently, and it only manifests when the timing lines up in exactly the wrong way — which, for the Therac-25, meant a specific typing speed and a specific sequence of correction keystrokes that most operators, most of the time, simply didn't produce. Investigators later found the failure took roughly eight seconds of a very particular editing pattern to trigger, which is exactly the kind of condition that survives functional testing and shows up only in the field, worn in gradually by real operators developing real habits.

## Why hardware used to catch this

Here is the detail that turns a software bug into an indictment of the whole design: earlier machines in the same product line, the Therac-6 and Therac-20, ran similar control software but had hardware interlocks — mechanical and electromechanical safety mechanisms independent of the software — that would physically prevent the beam from firing if the spreader wasn't correctly positioned. Those machines likely had the same underlying software race condition. It just never mattered, because a hardware lockout caught the inconsistent state before it could cause harm.

The Therac-25 was designed to be lighter and more compact, and its manufacturer removed most of these hardware interlocks, moving that responsibility into software. The reasoning was not unusual for the era: software checks are cheaper, more flexible, and were assumed to be at least as reliable as a mechanical switch. But this quietly converted a latent bug — one that had been safely masked by hardware for years, across earlier machines, without anyone knowing it was there — into a live one. The software had never actually been proven safe. It had been sitting behind a safety net that made its own correctness irrelevant, and when the net was removed, the software's true state was exposed for the first time, on real patients.

Compounding this, the error messages the machine produced gave operators no way to distinguish "the machine noticed a trivial deviation and stopped as a precaution" from "the machine may have just delivered an unsafe dose." Operators who had seen the same cryptic error dozens of times with no consequence learned, reasonably, to treat it as routine and simply proceed. A warning that doesn't communicate severity trains people to stop listening to it, and by the time the pattern was understood, several patients had already been harmed.

## The lesson that outlives the machine

The Therac-25 is taught in software engineering courses as a concurrency bug, and it is one, but the more durable lesson is about layered safety and where you're allowed to place your trust. A single mechanism, however carefully written, is a single point of failure — and software is uniquely bad at being that single point, because its failure modes are invisible until triggered, don't degrade gracefully, and can be reintroduced without anyone noticing when a system gets refactored, ported, or simplified. Hardware interlocks fail loudly and predictably: a switch is open or it isn't. Software can be subtly wrong in a state space too large to fully test, and still pass every test anyone thought to write.

The generalizable practice this produced — defense in depth, where a safety-critical system needs independent layers that don't share a failure mode, so that a bug in one layer is caught by a different mechanism entirely rather than a second copy of the same kind of check — now shows up everywhere from aviation software to industrial control systems to the deployment pipelines that gate production changes at ordinary tech companies. The specific instinct worth keeping is this: when a system removes a safeguard because "the software already handles that," ask what the safeguard was actually catching, and whether anyone has ever verified that the software genuinely handles it — or whether it has simply never been asked to, yet.


## Linked from

- [1_Tech & Engineering](index.md)
