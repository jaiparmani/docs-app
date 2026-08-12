---
tags: [system-design, lld, ood, solid]
---

# SOLID Principles

## What we're learning today
Every design pattern in [02 - Creational Design Patterns](02 - Creational Design Patterns.md), [03 - Structural Design Patterns](03 - Structural Design Patterns.md), and [04 - Behavioral Design Patterns](04 - Behavioral Design Patterns.md) exists to satisfy one or more of these five principles. Learn these first, deeply, and patterns stop looking like a memorization list — they start looking like the *obvious* answer to "how do I keep this SOLID."

## Core concept
SOLID is five principles for writing class hierarchies that survive requirements changing — which, in a machine-coding interview, means surviving the interviewer's follow-up question ("now add feature X"). A design that violates SOLID doesn't crash on day one; it makes day-two changes expensive, risky, or both. That's the entire test.

## The five, with the failure they prevent

**S — Single Responsibility Principle:** a class should have exactly one reason to change.
```java
// Violates SRP: this class changes if pricing logic changes, if the DB schema
// changes, or if the receipt format changes — three unrelated reasons.
class Order {
    void calculateTotal() { /* pricing logic */ }
    void saveToDatabase() { /* persistence logic */ }
    void printReceipt() { /* formatting logic */ }
}

// Fixed: each class has one reason to change.
class Order { /* just holds order data + calculateTotal() */ }
class OrderRepository { void save(Order o) { /* persistence */ } }
class ReceiptPrinter { void print(Order o) { /* formatting */ } }
```
**Failure prevented:** a change to receipt formatting accidentally breaking persistence logic, because they lived in the same class and someone touched the wrong method.

**O — Open/Closed Principle:** open for extension, closed for modification — adding new behavior shouldn't require editing existing, already-tested code.
```java
// Violates OCP: adding a new shape means editing this method's if/else chain.
class AreaCalculator {
    double calculate(Object shape) {
        if (shape instanceof Circle c) return Math.PI * c.radius * c.radius;
        if (shape instanceof Square s) return s.side * s.side;
        // adding Triangle means editing this method again
    }
}

// Fixed: new shapes extend, they don't modify.
interface Shape { double area(); }
class Circle implements Shape { public double area() { return Math.PI * radius * radius; } }
class Square implements Shape { public double area() { return side * side; } }
// Triangle just implements Shape — AreaCalculator never changes.
```
**Failure prevented:** every new shape type risking a regression in the already-working circle/square logic, because they all lived in one edited method.

**L — Liskov Substitution Principle:** a subclass must be usable anywhere its parent class is expected, without breaking correctness.
```java
// Violates LSP: Square "is-a" Rectangle mathematically, but not behaviorally here.
class Rectangle {
    void setWidth(int w) { this.width = w; }
    void setHeight(int h) { this.height = h; }
}
class Square extends Rectangle {
    void setWidth(int w) { this.width = w; this.height = w; } // surprises callers
    void setHeight(int h) { this.width = h; this.height = h; }
}
// Code that does rect.setWidth(5); rect.setHeight(10); expects area 50.
// If rect is actually a Square, area is 100 — silent correctness bug.
```
**Failure prevented:** code that works correctly with the base type silently breaking when a subclass is substituted in — the classic Square-extends-Rectangle trap every interviewer expects you to know.

**I — Interface Segregation Principle:** don't force a class to implement methods it doesn't need.
```java
// Violates ISP: a basic printer is forced to implement scan/fax it doesn't support.
interface Machine {
    void print(); void scan(); void fax();
}
class BasicPrinter implements Machine {
    public void print() { /* ok */ }
    public void scan() { throw new UnsupportedOperationException(); }
    public void fax() { throw new UnsupportedOperationException(); }
}

// Fixed: split into focused interfaces, implement only what applies.
interface Printer { void print(); }
interface Scanner { void scan(); }
class BasicPrinter implements Printer { public void print() { /* ok */ } }
```
**Failure prevented:** a caller holding a `Machine` reference calling `.scan()` on what's actually a `BasicPrinter`, only discovering the `UnsupportedOperationException` at runtime instead of it being structurally impossible to call.

**D — Dependency Inversion Principle:** depend on abstractions, not concrete implementations.
```java
// Violates DIP: ParkingLot is tightly coupled to one specific pricing implementation.
class ParkingLot {
    private HourlyPricing pricing = new HourlyPricing(); // concrete class
}

// Fixed: depend on an interface, inject the implementation.
interface PricingStrategy { double calculate(long durationMinutes); }
class ParkingLot {
    private final PricingStrategy pricing;
    ParkingLot(PricingStrategy pricing) { this.pricing = pricing; } // injected
}
```
**Failure prevented:** swapping pricing logic (hourly → flat-rate → dynamic) requiring an edit to `ParkingLot` itself, instead of just passing in a different `PricingStrategy` implementation — this is the principle that makes [02 - Creational Design Patterns](02 - Creational Design Patterns.md)'s Factory and [04 - Behavioral Design Patterns](04 - Behavioral Design Patterns.md)'s Strategy patterns actually work.

## Real-world examples
- **SRP:** Java's `Collectors` class does formatting/aggregation, never persistence — a well-factored standard library is SRP applied consistently.
- **OCP:** plugin architectures (browser extensions, IDE plugins) — the host application never edits its own code to support a new plugin, it just exposes an extension point.
- **LSP:** any ORM's `Repository<T>` interface — a `UserRepository` and `OrderRepository` must both honor the same contract (`save`, `findById`) without surprising callers, regardless of what `T` is.
- **ISP:** Java's own `Comparator` vs. `Comparable` split — you're never forced to implement ordering logic you don't need just to get some other interface's functionality.
- **DIP:** Spring's dependency injection is DIP as a framework feature — beans depend on interfaces, the container decides which implementation to inject.

## Interview perspective
Interviewers rarely ask "explain SOLID" directly at this level — they ask a design question, then follow up with "now we need to support X" and watch whether your existing classes need editing (OCP violation, red flag) or just extension (pass). LSP violations are the single most commonly *planted* trap in machine-coding prompts (a "Square extends Rectangle"-shaped trap dressed up as some other domain) — watch for any "is-a" relationship where the subtype's behavior doesn't actually honor every promise the parent type makes.

## Trade-offs
| | Strict SOLID adherence | Pragmatic/loose adherence |
|---|---|---|
| Extensibility | High — new features rarely touch existing code | Lower — features often require edits |
| Upfront complexity | Higher — more interfaces/classes for a simple problem | Lower — fewer moving parts for something that'll never change |
| Right for | Anything the interviewer will ask you to extend (assume yes, in an interview) | A genuinely one-off script with no future requirements |

## Interview question
"You're designing a `NotificationService` that currently only sends emails. The interviewer says 'now add SMS support.' Walk through what changes and why, in SOLID terms."

> [!question]- Think it through, then expand
> If your first instinct is "add an `if (type == SMS)` branch somewhere," that's the answer the question is designed to catch.

> [!success]- Answer
> If `NotificationService` currently has a method like `sendEmail(String msg)`, adding SMS by adding a parallel `sendSms(String msg)` method (or worse, an `if/else` inside one `send` method checking a type flag) violates OCP — you're modifying existing, tested code to add new behavior. The SOLID-correct fix: introduce a `NotificationChannel` interface with a `send(String msg)` method, implement `EmailChannel` and `SmsChannel` separately, and have `NotificationService` depend on `NotificationChannel` (DIP) rather than concrete channel types. Adding SMS becomes "add a new class implementing the interface," with zero edits to `NotificationService` itself — this is also exactly the Strategy pattern from [04 - Behavioral Design Patterns](04 - Behavioral Design Patterns.md), which is why SOLID and patterns aren't two separate things to memorize.

## Key design principle
**Every "now add X" follow-up question in a machine-coding interview is testing whether your existing classes need to change — if they do, you've found (and can now name) which SOLID principle your design violated.**

## 30-second challenge
A `PaymentProcessor` class has a method `process(Payment p)` that checks `if (p.type == "CREDIT_CARD") {...} else if (p.type == "PAYPAL") {...}`. Name the violated principle and sketch the one-line fix direction — don't write full code, just name the pattern you'd reach for.

## Next
[02 - Creational Design Patterns](02 - Creational Design Patterns.md) — the first pattern group, and the direct DIP-in-practice answer to "how do you actually construct the right implementation without the caller knowing the concrete class."
