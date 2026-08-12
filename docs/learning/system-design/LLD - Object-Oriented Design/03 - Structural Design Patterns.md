---
tags: [system-design, lld, ood, design-patterns]
---

# Structural Design Patterns: Adapter, Decorator, Facade, Composite

## What we're learning today
[02 - Creational Design Patterns](02 - Creational Design Patterns.md) answered how objects get created. Structural patterns answer how existing objects get **composed** into larger structures — without inheritance explosion, and without forcing incompatible interfaces to pretend they're compatible.

## Core concept
Four patterns, four composition problems:
- **Adapter** — make an incompatible interface compatible, without modifying either side.
- **Decorator** — add behavior to an individual object dynamically, without subclassing.
- **Facade** — provide a simple interface over a complex subsystem.
- **Composite** — treat a group of objects and a single object through the same interface (tree structures).

## Adapter
```java
// Existing third-party class you can't modify:
class LegacyPaymentGateway {
    void makePayment(String amountInCents) { /* ... */ }
}

// Your application's expected interface:
interface PaymentProcessor { void pay(double amountInDollars); }

// Adapter bridges the gap:
class LegacyPaymentAdapter implements PaymentProcessor {
    private final LegacyPaymentGateway legacy;
    LegacyPaymentAdapter(LegacyPaymentGateway legacy) { this.legacy = legacy; }

    public void pay(double amountInDollars) {
        String cents = String.valueOf((int)(amountInDollars * 100));
        legacy.makePayment(cents); // translates the call
    }
}
```
**When this comes up in interviews:** "integrate with an existing/legacy system that has a different interface than the rest of your design" — Adapter is the direct answer, and naming it by name (not just describing a wrapper) is the signal.

## Decorator
```java
interface Coffee { double cost(); String description(); }
class SimpleCoffee implements Coffee {
    public double cost() { return 2.0; }
    public String description() { return "Coffee"; }
}

abstract class CoffeeDecorator implements Coffee {
    protected final Coffee wrapped;
    CoffeeDecorator(Coffee c) { this.wrapped = c; }
}
class MilkDecorator extends CoffeeDecorator {
    MilkDecorator(Coffee c) { super(c); }
    public double cost() { return wrapped.cost() + 0.5; }
    public String description() { return wrapped.description() + " + Milk"; }
}
class SugarDecorator extends CoffeeDecorator {
    SugarDecorator(Coffee c) { super(c); }
    public double cost() { return wrapped.cost() + 0.2; }
    public String description() { return wrapped.description() + " + Sugar"; }
}
// Compose dynamically, at runtime, in any combination:
Coffee order = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
```
- **Why not just subclass `MilkCoffee extends SimpleCoffee`, `SugarCoffee extends SimpleCoffee`, `MilkSugarCoffee extends SimpleCoffee`?** Combinatorial explosion — N optional add-ons means up to 2^N subclasses to cover every combination. Decorator wraps at runtime, so any combination is just a different nesting order, no new classes needed per combination.
- **This is a direct, practical instance of OCP** ([01 - SOLID Principles](01 - SOLID Principles.md)) — adding `CaramelDecorator` later never touches `SimpleCoffee`, `MilkDecorator`, or `SugarDecorator`.

## Facade
```java
// Complex subsystem with several interacting classes:
class InventorySystem { boolean checkStock(String item) { /* ... */ return true; } }
class PaymentSystem { boolean charge(String card, double amt) { /* ... */ return true; } }
class ShippingSystem { void scheduleDelivery(String address) { /* ... */ } }

// Facade hides the orchestration complexity behind one simple call:
class OrderFacade {
    private final InventorySystem inventory = new InventorySystem();
    private final PaymentSystem payment = new PaymentSystem();
    private final ShippingSystem shipping = new ShippingSystem();

    boolean placeOrder(String item, String card, double amt, String address) {
        if (!inventory.checkStock(item)) return false;
        if (!payment.charge(card, amt)) return false;
        shipping.scheduleDelivery(address);
        return true;
    }
}
// Caller: one method call instead of orchestrating three subsystems.
OrderFacade facade = new OrderFacade();
facade.placeOrder("Widget", "1234-5678", 29.99, "123 Main St");
```
**Facade doesn't add new capability** — every subsystem was already callable directly. It exists purely to reduce the caller's cognitive load and coupling to subsystem internals, so a later change to how `InventorySystem` and `PaymentSystem` interact only touches the Facade, not every caller.

## Composite
```java
interface FileSystemComponent { long getSize(); }

class File implements FileSystemComponent {
    private final long size;
    File(long size) { this.size = size; }
    public long getSize() { return size; }
}

class Directory implements FileSystemComponent {
    private final List<FileSystemComponent> children = new ArrayList<>();
    void add(FileSystemComponent c) { children.add(c); }
    public long getSize() {
        return children.stream().mapToLong(FileSystemComponent::getSize).sum();
    }
}
// A Directory containing Files AND other Directories — caller treats both uniformly:
Directory root = new Directory();
root.add(new File(100));
Directory sub = new Directory();
sub.add(new File(50));
root.add(sub); // a Directory added just like a File — same interface
root.getSize(); // 150 — recurses transparently through the tree
```
**The pattern's whole value is treating a leaf (`File`) and a branch (`Directory`) through the identical interface** — calling code never needs `if (component instanceof Directory)` special-casing; recursion falls out naturally from the shared interface.

## Real-world examples
- **Adapter:** `Arrays.asList()` adapts an array to the `List` interface. Every payment gateway SDK wrapper in a real e-commerce backend.
- **Decorator:** Java I/O streams (`new BufferedReader(new InputStreamReader(new FileInputStream(...)))`) are Decorator, layered exactly like the coffee example. Spring's `@Transactional` conceptually decorates method behavior.
- **Facade:** any SDK's top-level client class (e.g. an AWS SDK client) is a Facade over dozens of underlying API operations and connection-handling details.
- **Composite:** any file system, any UI framework's view hierarchy (a `ViewGroup` containing `View`s and other `ViewGroup`s), an org chart.

## Interview perspective
The differentiator across all four: can you say *which specific problem* each one solves without conflating them. A common confusion is Decorator vs. Facade — both "wrap" something, but Decorator adds behavior to one object polymorphically (same interface, enhanced), while Facade simplifies access to multiple different subsystems (often a different, simpler interface than any individual subsystem exposes). Composite is usually recognizable immediately by the phrase "tree structure" or "part-whole hierarchy" in the prompt — if a problem describes nested groups of the same conceptual thing, Composite is very likely the answer.

## Trade-offs
| | Adapter | Decorator | Facade | Composite |
|---|---|---|---|---|
| Changes existing code? | No — wraps incompatible interface | No — wraps to add behavior | No — wraps for simplicity | Requires leaf/branch to share an interface from the start |
| Adds new capability? | No — translates existing capability | Yes — adds behavior | No — simplifies access to existing capability | No — enables uniform traversal |
| Risk if overused | Adapter chains stacking up, hiding real integration debt | Deeply nested decorators becoming hard to reason about (which decorators are active?) | A Facade that grows to expose everything, becoming just as complex as what it hid | Forcing leaf/branch into one interface when they genuinely have different capabilities |

## Interview question
"You're designing a notification system where a base notification can optionally be enhanced with logging, retry-on-failure, and rate-limiting — in any combination, decided at runtime per notification type. Which structural pattern fits, and why not just make three boolean flags on the `Notification` class?"

> [!question]- Think it through, then expand
> Think about what happens to the `Notification` class as more optional behaviors get added over time.

> [!success]- Answer
> Decorator. Each optional behavior (logging, retry, rate-limiting) wraps a `Notification` (or a `NotificationSender` interface) and adds its behavior before/after delegating to the wrapped instance — any combination is just a different nesting order, and adding a fourth optional behavior later (e.g. encryption) means adding one new decorator class, not touching `Notification` itself. Boolean flags on `Notification` would violate OCP directly: every new optional behavior means editing `Notification`'s core logic to check a new flag, and the flag-checking logic itself grows more tangled with each addition — the exact combinatorial-complexity problem Decorator exists to avoid.

## Key design principle
**Adapter translates, Decorator enhances, Facade simplifies, Composite unifies — each solves a distinct composition problem, and picking the wrong one usually still "works" but reintroduces the exact complexity the right pattern would have avoided.**

## Next
[04 - Behavioral Design Patterns](04 - Behavioral Design Patterns.md) — the last pattern group, covering how objects communicate and change behavior at runtime (Strategy, Observer, State, Command) — the patterns you'll reach for most in the applied problems that follow.
