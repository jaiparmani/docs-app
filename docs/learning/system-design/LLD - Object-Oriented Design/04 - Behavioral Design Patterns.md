---
tags: [system-design, lld, ood, design-patterns]
---

# Behavioral Design Patterns: Strategy, Observer, State, Command

<small>7 min read</small>

## What we're learning today
The last pattern group, and the one you'll reach for most in Machine Coding Problems/01 - Design a Parking Lot through Machine Coding Problems/04 - Design Splitwise (Expense Sharing). Behavioral patterns answer how objects communicate, delegate, and change behavior at runtime — this is where most machine-coding interviews are actually won or lost, because "which behavioral pattern fits this requirement" is the recurring question underneath almost every applied problem.

## Core concept
Four patterns, four communication/behavior problems:
- **Strategy** — swap an algorithm/behavior at runtime, interchangeably.
- **Observer** — notify multiple dependents automatically when one object's state changes.
- **State** — let an object change its behavior when its internal state changes, as if it changed class.
- **Command** — encapsulate a request as an object, enabling queuing, undo, and logging.

## Strategy
```java
interface PricingStrategy { double calculate(long durationMinutes); }
class HourlyPricing implements PricingStrategy {
    public double calculate(long durationMinutes) { return Math.ceil(durationMinutes / 60.0) * 5.0; }
}
class FlatRatePricing implements PricingStrategy {
    public double calculate(long durationMinutes) { return 20.0; }
}

class ParkingLot {
    private PricingStrategy pricing;
    ParkingLot(PricingStrategy pricing) { this.pricing = pricing; } // DIP
    void setPricingStrategy(PricingStrategy p) { this.pricing = p; } // swappable at runtime
    double getFee(long minutes) { return pricing.calculate(minutes); }
}
```
This is [01 - SOLID Principles](01 - SOLID Principles.md)'s DIP example from that note, now named as the pattern it is. **The tell for Strategy in a prompt**: any requirement phrased as "the algorithm for X can vary" or "support multiple ways of doing Y, selectable at runtime" — pricing, sorting, spot-assignment, discount calculation, route-finding.

## Observer
```java
interface Observer { void update(String event); }

class ParkingSpotAvailability {
    private final List<Observer> observers = new ArrayList<>();
    void subscribe(Observer o) { observers.add(o); }
    void notifySpotFreed(String spotId) {
        for (Observer o : observers) o.update("Spot freed: " + spotId);
    }
}

class DisplayBoard implements Observer {
    public void update(String event) { System.out.println("Display updated: " + event); }
}
class MobileAppNotifier implements Observer {
    public void update(String event) { System.out.println("Push notification: " + event); }
}
// Both DisplayBoard and MobileAppNotifier react automatically, without ParkingSpotAvailability
// needing to know they exist as concrete types:
ParkingSpotAvailability availability = new ParkingSpotAvailability();
availability.subscribe(new DisplayBoard());
availability.subscribe(new MobileAppNotifier());
availability.notifySpotFreed("A-12");
```
**The tell for Observer**: "when X happens, multiple things need to react" — availability changes, price changes, order status changes. The subject (`ParkingSpotAvailability`) stays decoupled from exactly what reacts and how many things react — adding a third observer never touches the subject's code, same OCP benefit as every pattern so far.

## State
```java
interface VendingMachineState {
    void insertCoin(VendingMachine machine);
    void selectItem(VendingMachine machine);
    void dispense(VendingMachine machine);
}

class IdleState implements VendingMachineState {
    public void insertCoin(VendingMachine m) { m.setState(new HasCoinState()); }
    public void selectItem(VendingMachine m) { System.out.println("Insert coin first"); }
    public void dispense(VendingMachine m) { System.out.println("Insert coin first"); }
}
class HasCoinState implements VendingMachineState {
    public void insertCoin(VendingMachine m) { System.out.println("Coin already inserted"); }
    public void selectItem(VendingMachine m) { m.setState(new DispensingState()); }
    public void dispense(VendingMachine m) { System.out.println("Select an item first"); }
}
class DispensingState implements VendingMachineState {
    public void insertCoin(VendingMachine m) { System.out.println("Please wait, dispensing"); }
    public void selectItem(VendingMachine m) { System.out.println("Already dispensing"); }
    public void dispense(VendingMachine m) { /* dispense item */ m.setState(new IdleState()); }
}

class VendingMachine {
    private VendingMachineState state = new IdleState();
    void setState(VendingMachineState s) { this.state = s; }
    void insertCoin() { state.insertCoin(this); }
    void selectItem() { state.selectItem(this); }
    void dispense() { state.dispense(this); }
}
```
- **Why not just an `enum State` field checked with `if/switch` everywhere?** Every method (`insertCoin`, `selectItem`, `dispense`) would need its own switch over every state, and adding a new state means editing every one of those switches — the same OCP violation SOLID warns about, now specifically in the shape of a state machine.
- **State vs. Strategy — they look identical in code shape and are frequently confused.** Strategy is chosen by the *caller* and doesn't change itself based on internal events. State is chosen by the *object itself*, transitioning automatically in response to its own method calls (`insertCoin()` transitions the state without the caller explicitly picking a new state). If the object drives its own transitions, it's State; if the caller picks and it stays fixed, it's Strategy.

## Command
```java
interface Command { void execute(); void undo(); }

class ParkVehicleCommand implements Command {
    private final ParkingLot lot; private final Vehicle vehicle; private ParkingSpot assignedSpot;
    ParkVehicleCommand(ParkingLot lot, Vehicle v) { this.lot = lot; this.vehicle = v; }
    public void execute() { assignedSpot = lot.parkVehicle(vehicle); }
    public void undo() { lot.removeVehicle(assignedSpot); }
}

class CommandInvoker {
    private final Deque<Command> history = new ArrayDeque<>();
    void run(Command c) { c.execute(); history.push(c); }
    void undoLast() { if (!history.isEmpty()) history.pop().undo(); }
}
```
**The tell for Command**: any requirement mentioning undo, redo, request queuing/logging, or "schedule this action for later." Encapsulating "an action to perform" as an object (rather than just calling a method directly) is what makes undo/redo/queuing possible at all — you can't undo a method call that already returned and left no trace, but you can undo a `Command` object that remembers what it did.

## Real-world examples
- **Strategy:** `Comparator` passed to `Collections.sort()` — the sort algorithm is fixed, the *comparison strategy* is swappable.
- **Observer:** every pub/sub system conceptually (Kafka consumers, DOM event listeners), Java's own (deprecated but illustrative) `Observable`/`Observer` classes.
- **State:** TCP connection state machines (LISTEN, SYN_SENT, ESTABLISHED...), a video player (Playing/Paused/Stopped, each interpreting "press play" differently).
- **Command:** undo/redo in any text editor, a job queue where each job is a `Command` object, GUI button click handlers (each is arguably a Command wrapping an action).

## Interview perspective
State vs. Strategy is the single most common point of confusion interviewers probe on purpose — be ready to articulate the distinction (who decides the transition, the object itself vs. an external caller) without hesitation. Observer is the most likely pattern to be *needed but not asked for explicitly* — a prompt like "the display board should update when a spot's status changes" is describing Observer without using the word, and naming it unprompted is a strong signal.

## Trade-offs
| | Strategy | Observer | State | Command |
|---|---|---|---|---|
| Who initiates the behavior/transition | Caller picks the strategy | The subject notifies, observers just react | The object itself, based on its own method calls | Caller constructs and invokes the command |
| Adds capability | Swappable algorithms | Decoupled multi-way notification | Self-managing state machine | Undo/redo/queuing/logging |
| Risk if overused | Trivial variation not worth an interface (a single `if` might be simpler) | Notification storms if too many observers subscribe to a high-frequency event | Explosion of tiny state classes for a system with very few real states | Wrapping every single method call in a Command object even when undo/queuing is never needed |

## Interview question
"In your Vending Machine design, a reviewer asks: 'why is this State and not just Strategy — the machine still has a `pricing` field that could vary too, right?' How do you answer, distinguishing the two uses in the same system?"

> [!question]- Think it through, then expand
> The vending machine likely needs *both* patterns simultaneously, for two different things.

> [!success]- Answer
> Both patterns are correctly present in the same system for different responsibilities. The machine's *behavioral mode* (Idle → HasCoin → Dispensing) is State, because the machine transitions itself automatically as a consequence of its own method calls (`insertCoin()` causes the transition) — no external caller decides "now become HasCoinState." The *pricing logic* (if prices vary by item category, or a promotional discount can be toggled) is Strategy, because an external caller/configuration decides which `PricingStrategy` to inject, and the machine doesn't autonomously switch pricing strategies as a side effect of its own operations. Recognizing that a single system legitimately uses multiple patterns for different concerns — rather than forcing one pattern to cover everything — is itself a signal of real understanding versus pattern-matching from memory.

## Key design principle
**Strategy is chosen externally and stays fixed; State is chosen internally and transitions on its own; Observer decouples "something changed" from "who cares"; Command turns an action into a rememberable, undoable object — confusing these is the most common machine-coding interview mistake.**

## Next
Machine Coding Problems/01 - Design a Parking Lot — the first applied problem, combining Strategy (pricing) and Factory ([02 - Creational Design Patterns](02 - Creational Design Patterns.md)) in one design.
