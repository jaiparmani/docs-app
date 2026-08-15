---
tags: [reads, tech, engineering-history, incidents, aerospace, software-bugs]
---

# The Integer Overflow That Blew Up a Rocket

<small>6 min read</small>

On June 4, 1996, the European Space Agency launched Ariane 5, its new heavy-lift rocket, on its maiden flight from French Guiana. Thirty-seven seconds after liftoff, the rocket veered sharply off its flight path, began to break apart under aerodynamic forces, and was destroyed by its own self-destruct system as a safety measure. The payload — four uninsured scientific satellites meant to study how the Earth's magnetosphere interacts with the solar wind — was lost along with roughly $370 million of hardware and a decade of development work. The rocket itself worked fine, mechanically. Every engine, every structural component, every piece of hardware did exactly what it was supposed to do. The rocket destroyed itself because of a single unhandled software exception in a system whose only job was to tell the rocket which way was up.

## What actually overflowed

Ariane 5's guidance came from an inertial reference system that calculated the rocket's orientation and trajectory by continuously integrating data from onboard sensors. That software was not written from scratch for Ariane 5. It was carried over, largely unchanged, from Ariane 4, an earlier and considerably less powerful rocket in the same family, on the reasonable-sounding assumption that flight control logic which had flown successfully for years didn't need to be rebuilt.

Deep inside that software was a routine that converted a 64-bit floating-point value representing horizontal velocity into a 16-bit signed integer, for use in a later calculation. A 16-bit signed integer can represent values only up to 32,767. On Ariane 4, the rocket's trajectory and acceleration profile meant this horizontal velocity value could never realistically approach that ceiling — the engineers who wrote and validated the conversion had checked the numbers for Ariane 4's flight envelope and concluded it was safe, and for Ariane 4, it was.

Ariane 5 was a physically different rocket. It was more powerful, and its early flight trajectory produced a much higher horizontal velocity, much sooner after launch, than anything Ariane 4 ever generated. Thirty-seven seconds in, that velocity value exceeded 32,767, and the conversion from the 64-bit float to the 16-bit integer overflowed. The software had no path for handling that condition — it wasn't that the overflow was handled incorrectly, it was that the code never anticipated it could happen at all, because on the platform it was written for, it couldn't. The routine raised an exception. The exception was not caught. The processor running it halted.

## Why the backup didn't save it

Ariane 5's inertial reference system, like most flight-critical avionics, was built with redundancy: a primary unit and a backup unit, running in parallel, so that if one failed, the other would take over instantly. This is a completely standard and generally sound engineering practice against hardware failure — a chip degrading, a solder joint cracking, a cosmic ray flipping a bit. Redundant hardware genuinely does protect against those.

But the primary and backup units in Ariane 5 were running the identical software, processing the identical sensor inputs, in near-perfect synchrony. When the primary unit hit the overflow and halted, the backup unit was executing the same code against the same flight data a few milliseconds behind it — and hit the exact same overflow, for the exact same reason, and halted too. Redundancy protects against a component that fails independently and unpredictably. It does nothing at all against a defect in the logic itself, because a software bug isn't random — given the same inputs, it happens every single time, on every unit running it. Two computers running one flawed program is not two chances at success. It's one bug, guaranteed twice, with no fallback.

Both units down, the rocket's onboard computer was left receiving garbage diagnostic data from the now-failed inertial reference system, which it misinterpreted as legitimate flight information calling for an extreme correction. The rocket's actual guidance computer, doing exactly what it was told, swiveled the engines hard in response to a problem that didn't exist, and the resulting aerodynamic stress tore the vehicle apart.

## Code doesn't know it changed vehicles

The specific engineering failure that made this possible wasn't really the missing overflow check, though that's the detail every retelling fixates on. It was the decision to treat previously validated code as validated for a new context without re-deriving the assumptions it depended on. The Ariane 4 team had done real engineering work to determine that horizontal velocity would stay under a safe bound — that conclusion was correct, rigorous, and true, for Ariane 4. Nobody re-ran that analysis for Ariane 5's very different trajectory, in part because the module in question wasn't even needed after liftoff on Ariane 5 at all — it was only still running because of another carried-over assumption from Ariane 4's flight profile, and it kept executing well past the point where its output mattered, simply because nobody had gone back and asked whether it should still be running under the new rocket's timeline.

Validated code carries an invisible footnote: valid under these conditions. Move the code — a new platform, a new load profile, a new deployment environment, a new class of user input — and the footnote comes along whether or not anyone rereads it. The code itself gives no signal that its assumptions have quietly stopped applying; it will simply keep computing, confidently, right up until an input arrives that the original validation never covered.

## The generalizable lesson

Two lessons sit inside this incident, and both outlast the specifics of rockets and 16-bit integers. The first is narrowly technical: any conversion between numeric types with different ranges is a place where a value from the real world can exceed what your representation can hold, and "this has never happened in practice" is a statement about the inputs you've seen, not a guarantee about the inputs that exist. Bound the input, check the conversion, or use a type that can't overflow under any input the system could plausibly produce — but don't inherit a range assumption from a different context without checking whether it still holds.

The second is broader and less comfortable: redundancy defends against failures that are independent, and most catastrophic software failures aren't. A second server, a second data center, a second reviewer, a second identical system running the same logic — none of it helps against a bug in the logic itself, because the second copy will fail in lockstep with the first, at the same moment, for the same reason, every time. Real resilience against a software defect requires actual diversity — different code paths, different implementations, or at minimum a fallback that doesn't share the same blind spot — not more copies of the same trust.


## Linked from

- [1_Tech & Engineering](index.md)
