---
tags: [reads, tech, fundamentals, numbers, correctness]
---

# Why 0.1 Plus 0.2 Does Not Equal 0.3

<small>6 min read</small>

Open a Python REPL, a Node shell, a Java `jshell`, a Ruby console, or a browser's dev tools, and type `0.1 + 0.2`. Every one of them will tell you `0.30000000000000004`. This is not a bug in any of those languages. It is the same answer, from the same hardware, for the same reason, and it has been the same answer since the mid-1980s. The interesting question is not "why is it wrong" — it isn't wrong — but "what exactly did I ask for that I did not realize I was asking for."

## The fraction that never ends

Start with something familiar. Write out one third in decimal: 0.3333… and the threes never stop. This isn't a failure of arithmetic, it's a consequence of base ten. A fraction terminates in base ten only when its denominator's prime factors come from the primes dividing ten, which are 2 and 5. One third has a 3 downstairs, so it repeats forever.

Computers store numbers in binary, so the relevant base is two, and the only prime that divides two is two. **A fraction has a finite binary representation only when its denominator is a power of two.** One half is fine. One quarter is fine. Three eighths is fine. One tenth is not, because ten is 2 × 5, and that 5 is fatal. Written in binary, 0.1 is 0.0001100110011001100110011… with `0011` repeating without end, exactly the way 1/3 repeats in decimal.

So when you write `0.1` in source code, the machine cannot store 0.1. It stores the nearest number it *can* represent, and in a 64-bit double that number is:

```
0.1000000000000000055511151231257827021181583404541015625
```

That is genuinely what the bits mean, printed out in full. Similarly `0.2` becomes 0.200000000000000011102230246251565404236316680908203125. Both are so close to the value you wanted that the printing routine shortens them back to "0.1" and "0.2" — because those are the shortest decimal strings that round-trip to the same bits.

Now add them. The exact mathematical sum of those two stored values is 0.3000000000000000166533…, and that result also has to be squeezed back into 64 bits. The available doubles in that neighbourhood are spaced about 5.55 × 10⁻¹⁷ apart, and the two nearest candidates are 0.29999999999999998889… and 0.30000000000000004440…. Rounding lands on the second. Its shortest round-tripping decimal form is `0.30000000000000004`, so that is what gets printed. Meanwhile `0.3` written directly in source becomes the *first* candidate. Two different bit patterns, so `0.1 + 0.2 == 0.3` is false. The error was already there before you added anything; addition just moved it across the boundary where the printer stops hiding it.

## Trading exactness for range

The format doing all this is IEEE 754, and its design is worth understanding as an engineering compromise rather than a spec. A double takes 64 bits and spends them as one sign bit, eleven exponent bits, and fifty-two fraction bits. The value is essentially a binary significand multiplied by two raised to the exponent — scientific notation in base two.

The exponent is the reason you can hold both 10⁻³⁰⁰ and 10³⁰⁰ in the same eight bytes. But the significand is fixed at roughly 53 bits of precision (52 stored, one implied), which means you always get about 15 to 17 significant decimal digits — **and no more, regardless of scale**. Precision is relative, not absolute. Near 1.0 the gap between adjacent doubles is about 2 × 10⁻¹⁶. Near 10¹⁶ the gap is 2. Near 10¹⁸ the gap is in the hundreds.

That has a very concrete consequence: integers are exact in a double only up to 2⁵³, which is 9007199254740992. Beyond that, some integers simply do not exist in the format, and `9007199254740992.0 + 1 == 9007199254740992.0` evaluates to true. This is why 64-bit IDs — Twitter-style snowflake IDs, database bigints, order numbers — get silently corrupted when they pass through JSON into JavaScript, where every number is a double. The fix in practice is to serialize such IDs as strings, and it is the reason many APIs do exactly that.

## Never compare, never store money

Two rules fall out of this, and both are load-bearing.

The first: `==` on floats is a latent bug. Any computation that has gone through a few operations has accumulated rounding, and asking whether two accumulated errors are bit-identical is not the question you meant. What you meant is "are these close enough," which is `abs(a - b) < epsilon`. Choosing epsilon takes a moment of thought: a fixed absolute tolerance like `1e-9` is fine for values near 1, and useless for values near 10¹², where the spacing between representable doubles is already larger than your tolerance. For a wide range of magnitudes, scale the tolerance to the operands — compare against `epsilon * max(abs(a), abs(b))` — or work in units where an absolute tolerance is meaningful.

The second, and the one that actually costs money: **never store currency in a float or a double**. A payment of ₹0.10 is not representable. Accumulate a million of them and the drift is real, auditable, and impossible to explain to a finance team. Worse, the errors are not symmetric or self-cancelling in any way you can reason about, and comparisons like "does the ledger balance to zero" become unanswerable.

The two correct approaches are both boring. Store integer minor units — paise, cents, satoshis — so ₹123.45 is the integer 12345 and every operation is exact integer arithmetic, with rounding happening only where you explicitly decide it should (tax, interest, currency conversion). Or use a real decimal type, which stores a decimal significand and a decimal exponent so that 0.1 is exact by construction: Java's `BigDecimal`, Python's `decimal.Decimal`, C#'s `decimal`, and the `NUMERIC` / `DECIMAL` column types in PostgreSQL and MySQL all exist for precisely this reason. Note the contrast: PostgreSQL's `real` and `double precision` are IEEE 754 and will happily lose your paise, while `NUMERIC` will not. Choosing the wrong column type is a schema decision that becomes very expensive to reverse once there are rows in the table.

## The cost was chosen deliberately

It is tempting to file all this under "computers are janky." It isn't jank. The people who designed IEEE 754 knew perfectly well that binary fractions cannot represent tenths, and they chose it anyway, because the alternative — exact decimal arithmetic everywhere — is dramatically slower and cannot span sixteen orders of magnitude in eight bytes. Floating point is a bargain: you surrender exactness on a specific, well-defined class of values, and in exchange you get enormous dynamic range and arithmetic that a CPU can do billions of times per second in dedicated silicon.

That bargain is excellent for physics, graphics, machine learning, and statistics, where the inputs were approximate to begin with and a relative error of 10⁻¹⁶ is far below the noise floor. It is a catastrophically bad bargain for money, where the inputs are exact by definition and a discrepancy of one paise is a defect. The floating point unit is not making a mistake when it hands you `0.30000000000000004`. It is telling you, precisely and honestly, what it agreed to compute — and the engineering skill is knowing which of your numbers were ever approximate in the first place.


## Linked from

- [1_Tech & Engineering](index.md)
