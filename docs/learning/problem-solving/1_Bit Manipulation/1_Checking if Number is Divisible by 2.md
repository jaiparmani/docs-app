# Checking if a Number is Divisible by 2

The low bit of an integer is the 1s place, so it is set exactly when the number is odd. Masking everything else off answers the question directly:

```python
is_div_by_2 = lambda i: i & 1 == 0
```

## The neighbouring trick, which answers a different question

`i & (i - 1)` clears the lowest set bit. Comparing the result to zero therefore tests whether there was only *one* set bit to begin with — which is a **power-of-two** check, not a divisibility check:

```python
is_power_of_two = lambda i: i > 0 and i & (i - 1) == 0
```

The `i > 0` guard is load-bearing. Without it, 0 reports as a power of two: `0 - 1` is `-1`, and `0 & -1` is `0`.

The two are easy to conflate because they look alike and agree on some inputs — 8 is both even and a power of two — but they diverge immediately on anything like 12, which is even and not a power of two.

## A precedence note that depends on the language

In Python, bitwise `&` binds *tighter* than `==`, so `i & (i - 1) == 0` groups as `(i & (i - 1)) == 0` and behaves as intended.

C and its descendants invert that: there, equality binds tighter than bitwise AND, so `x & MASK == 0` silently means `x & (MASK == 0)`. Porting one of these expressions across languages without adding explicit parentheses is a classic way to introduce a bug that compiles cleanly.


## Linked from

- [2_Problem Solving](../index.md)
