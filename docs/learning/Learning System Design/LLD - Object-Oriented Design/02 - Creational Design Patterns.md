---
tags: [system-design, lld, ood, design-patterns]
---

# Creational Design Patterns: Singleton, Factory, Builder

## What we're learning today
Creational patterns answer one question: **how does an object get created without the calling code knowing (or caring) about the concrete class or the construction complexity?** This is DIP ([[01 - SOLID Principles]]) turned into concrete, reusable recipes.

## Core concept
Three patterns, three different creation problems:
- **Singleton** — ensure exactly one instance exists, globally accessible.
- **Factory** — decide *which* concrete class to instantiate at runtime, hiding the decision from the caller.
- **Builder** — construct a complex object step by step, when a constructor with 8 parameters would be unreadable and error-prone.

## Singleton
```java
class ParkingLotManager {
    private static volatile ParkingLotManager instance;
    private ParkingLotManager() {} // private constructor — can't be instantiated externally

    public static ParkingLotManager getInstance() {
        if (instance == null) {
            synchronized (ParkingLotManager.class) {
                if (instance == null) { // double-checked locking
                    instance = new ParkingLotManager();
                }
            }
        }
        return instance;
    }
}
```
- **Why double-checked locking:** the first `null` check avoids synchronization overhead on every call once the instance exists; the second check (inside the synchronized block) prevents two threads that both passed the first check from both creating an instance.
- **`volatile` matters**: without it, a thread could see a partially-constructed instance due to instruction reordering — a classic, exam-relevant concurrency subtlety.
- **When to actually use it in an interview**: a `ParkingLotManager` or `ElevatorController` that must be globally unique (there's only one physical lot) is a legitimate Singleton. Reaching for Singleton as a lazy substitute for proper dependency injection everywhere is a smell interviewers will push back on — it's a specific answer to "exactly one of this must exist," not a default.

## Factory Method
```java
interface Vehicle { String getType(); }
class Car implements Vehicle { public String getType() { return "CAR"; } }
class Motorcycle implements Vehicle { public String getType() { return "MOTORCYCLE"; } }

class VehicleFactory {
    static Vehicle createVehicle(String type) {
        return switch (type) {
            case "CAR" -> new Car();
            case "MOTORCYCLE" -> new Motorcycle();
            default -> throw new IllegalArgumentException("Unknown vehicle type: " + type);
        };
    }
}
// Caller code never does `new Car()` directly:
Vehicle v = VehicleFactory.createVehicle("CAR");
```
- **The point isn't hiding a `switch` statement** — it's that the switch lives in exactly one place, and every caller depends on the `Vehicle` interface, not concrete classes (DIP). Adding `Truck` means editing the factory once, not every call site.
- **This is the resolution to [[01 - SOLID Principles]]'s OCP tension**: creating a new concrete type still requires *a* code change (inside the factory), but callers are fully insulated from it — the factory is the one deliberately-accepted point of change, not scattered `if (type == ...)` checks throughout the codebase.

## Builder
```java
class Pizza {
    private final String size;      // required
    private final boolean cheese;   // optional
    private final boolean pepperoni; // optional
    private final boolean mushrooms; // optional

    private Pizza(Builder b) {
        this.size = b.size; this.cheese = b.cheese;
        this.pepperoni = b.pepperoni; this.mushrooms = b.mushrooms;
    }

    static class Builder {
        private final String size; // required, set in constructor
        private boolean cheese, pepperoni, mushrooms; // optional, default false

        Builder(String size) { this.size = size; }
        Builder addCheese() { this.cheese = true; return this; }
        Builder addPepperoni() { this.pepperoni = true; return this; }
        Builder addMushrooms() { this.mushrooms = true; return this; }
        Pizza build() { return new Pizza(this); }
    }
}
// Usage — reads like a sentence, no ambiguous positional parameters:
Pizza p = new Pizza.Builder("LARGE").addCheese().addPepperoni().build();
```
- **The problem this solves**: a constructor `Pizza(String size, boolean cheese, boolean pepperoni, boolean mushrooms, boolean olives, ...)` is unreadable at the call site (`new Pizza("LARGE", true, false, true, false)` — which boolean is which?) and every optional-parameter combination needs its own overload without Builder.
- **Builder vs. Factory**: Factory decides *which class*; Builder assembles *one complex object's* many optional pieces. They solve different problems and are often used together (a Factory might internally use a Builder).

## Real-world examples
- **Singleton:** `java.lang.Runtime.getRuntime()`, Spring's default bean scope (singleton unless configured otherwise), a database connection pool manager.
- **Factory:** `Calendar.getInstance()` in Java returns different concrete subclasses depending on locale — the caller never picks the subclass directly. Shape/document factories in most GUI frameworks.
- **Builder:** `StringBuilder` (despite the name, arguably closer to a mutable accumulator, but the naming convention stuck), `okhttp3.Request.Builder`, Lombok's `@Builder` annotation generating this exact pattern automatically.

## Interview perspective
The signal isn't "can you write a Singleton from memory" — it's whether you reach for the *right one of the three* given the actual problem. A common trap: using Builder when the object only has 2-3 parameters (overkill, adds needless ceremony) or skipping Builder when a class has 5+ optional constructor parameters (the resulting constructor call becomes unreadable and error-prone — positional booleans are a classic bug source). For Singleton specifically, be ready to explain thread-safety (double-checked locking or an enum-based singleton) unprompted — a non-thread-safe Singleton in a systems-level interview is an immediate flag.

## Trade-offs
| | Singleton | Factory | Builder |
|---|---|---|---|
| Solves | "Exactly one instance" | "Which concrete class" | "Complex object construction" |
| Risk if overused | Hidden global state, hard to test/mock | An ever-growing switch statement if not paired with registration/reflection for many types | Unnecessary ceremony for simple objects |
| Testability | Harder (global state is a testing anti-pattern) | Easy — swap the factory's implementation | Easy — no impact on testability either way |

## Interview question
"You're designing a `ParkingSpotFactory` that creates `CompactSpot`, `LargeSpot`, and `HandicappedSpot` objects. A new requirement adds `ElectricVehicleSpot` with charging-station metadata that other spot types don't have. Does the existing Factory pattern still fit cleanly?"

> [!question]- Think it through, then expand
> Consider what "charging-station metadata" implies about the constructor Builder-vs-Factory question, not just the type-selection question.

> [!success]- Answer
> The Factory pattern for *selecting which concrete class to instantiate* still fits cleanly — add an `ElectricVehicleSpot` implementing the same `ParkingSpot` interface, and add one more case to the factory's switch. But if `ElectricVehicleSpot` needs several optional charging-related parameters (charger type, max wattage, connector type) that other spot types don't have, that's a second, separate problem — object *construction* complexity, not type *selection* — and might warrant a Builder specifically for `ElectricVehicleSpot`'s own constructor, used internally by the factory. This is a good example of Factory and Builder solving genuinely different problems that can coexist in the same design.

## Key design principle
**Singleton controls instance count, Factory controls type selection, Builder controls construction complexity — confusing which problem you actually have leads to reaching for the wrong pattern.**

## Next
[[03 - Structural Design Patterns]] — once objects are created, structural patterns answer how they're composed together into larger structures.
