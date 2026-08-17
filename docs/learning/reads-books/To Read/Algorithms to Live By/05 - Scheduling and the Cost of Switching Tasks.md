---
tags: [reads, books, to-read, productivity, computer-science]
---

# 05 — Scheduling and the Cost of Switching Tasks

<small>3 min read</small>

## Core idea
Scheduling theory studies how to order a set of tasks with different durations, deadlines, and priorities to optimize some overall goal — finish everything as early as possible, minimize how late the latest task is, or minimize how many tasks end up late at all. Different goals turn out to call for different, specific rules: minimizing the maximum lateness of any task calls for handling tasks in order of their deadlines (Earliest Due Date), while minimizing the number of tasks that end up late at all calls for a more involved rule that isn't simply "do the most urgent thing first." Christian and Griffiths use this to make a broader point: "prioritize by urgency" is not one rule, it's several different rules depending on what you're actually trying to optimize, and picking the wrong one for your actual goal produces a schedule that's confidently wrong.

## Why it matters
The chapter also imports a specific, concrete idea from operating-system design: thrashing, the state where a computer system spends so much time switching between tasks — swapping data in and out of memory to accommodate each context switch — that it does almost no actual productive work despite appearing constantly busy. The authors apply this directly to human multitasking, and the underlying point matters because it reframes "I'm too busy to focus on any one thing" not as a time-shortage problem but as a scheduling-policy problem: the busyness itself, if it's coming from constant switching, may be actively destroying throughput rather than just feeling inefficient.

## Example from the book
The authors describe how computer systems under heavy load can enter a state where the overhead of managing many competing processes — saving one task's state, loading another's, repeating dozens of times a second — consumes more resources than the tasks themselves, so that a system juggling many things at once can accomplish less real work than one doing fewer things with fewer interruptions. They draw the human parallel explicitly: someone rapidly switching between email, messages, and a primary task pays a real, measurable "context-switch" cost each time, separate from the time the tasks themselves require, and past a certain amount of switching that overhead itself becomes the dominant cost rather than a minor tax on it.

## Practical application
When your to-do list feels overwhelming, first identify which scheduling goal you're actually optimizing for — do you need to avoid ever being late on anything (favor earliest deadlines first), or do you need to complete the largest number of tasks (favor short tasks first to clear volume) — because those two goals genuinely call for opposite orderings, and defaulting to "most urgent-feeling first" without checking which goal you're serving will often produce the wrong schedule for your actual situation. Separately, if your day feels constantly busy but little gets finished, audit how often you're switching contexts rather than how much time you have; batching similar tasks and protecting longer uninterrupted blocks reduces the thrashing overhead directly, independent of how much total work is on the list.

## Something to sit with
> [!question]- A question to think about
> Look at how you ordered your task list today. Was it actually built around the goal you care about most — avoiding lateness, or finishing the most items — or did you just work through it in order of whatever felt loudest?


## Linked from

- [Algorithms to Live By](index.md)
