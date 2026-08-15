---
tags: [reads, tech, fundamentals, unicode, text]
---

# The Mess Underneath Every String You Have Ever Handled

<small>6 min read</small>

A string looks like the simplest type in your language. It is a sequence of characters. You can measure it, slice it, uppercase it, reverse it, compare it. Every one of those operations is more complicated than it appears, and the complexity is not incidental — it is the accumulated weight of every writing system humans have invented, compressed into a type that pretends to be a list.

## Seven bits and a lot of leftover room

The story starts with ASCII, standardised in the 1960s for teleprinters. Seven bits, 128 slots. A block of those went to control codes — carriage return, line feed, bell, the null byte — and the rest covered the English alphabet in both cases, the digits, and common punctuation. Enough for American English and nothing else.

Machines settled on eight-bit bytes, which left 128 slots spare above ASCII, and that is where the trouble started. Everyone filled those slots differently. Western Europe used Latin-1 for accented vowels, and Windows shipped a variant of it. Russian text used KOI8-R or one of several competing Cyrillic pages. Greek, Hebrew, Thai, and Turkish each had their own. Byte 0xE9 meant "é" in one and something entirely different in another, with nothing in the bytes to say which — the origin of mojibake, text that displays as garbage because the reader guessed a different codepage than the writer used. East Asian scripts did not fit in 128 slots at all, and needed multi-byte schemes like Shift_JIS and Big5, each with its own incompatibilities.

Unicode was the response, and its central move is one that engineers routinely miss: **Unicode is a numbering, not an encoding.** It assigns every character a code point — an integer, conventionally written `U+0041` for "A" or `U+20AC` for the euro sign — across a space running from U+0000 to U+10FFFF. That is over a million slots, of which a large but far from complete fraction are assigned. Unicode says what the numbers are. It says nothing about how to put those numbers into bytes.

## Turning numbers into bytes

That second question has several answers. UTF-32 gives every code point a fixed four bytes, making indexing trivial and quadrupling the size of English text. UTF-16 uses two bytes for the common cases and four for the rest, via surrogate pairs — a reserved block of code points used in pairs as an escape hatch. UTF-8 uses one byte for ASCII, and two, three, or four for everything else.

UTF-8 won the internet decisively, for reasons that are worth naming because they are a small lesson in protocol design. Any pure-ASCII file is already valid UTF-8, byte for byte, so decades of existing text and existing tooling kept working unchanged. It has no byte-order ambiguity: multi-byte sequences have a defined order, so there is no need for the byte-order mark that UTF-16 requires and no chance of a file being read backwards. And it is self-synchronising — the leading byte of a sequence is distinguishable from continuation bytes, so if you land in the middle of a stream you can find the next character boundary by scanning a byte or two, rather than resynchronising the whole file.

Both fixed-width formats also failed at the thing that made them attractive. UTF-16's promise was constant-time indexing, and it stopped being true the moment Unicode grew past 65,536 characters and surrogate pairs appeared. Java, JavaScript, C#, and the Windows API all use UTF-16 internally and all inherit that leaky abstraction. A useful trap in the same family: MySQL's encoding historically named `utf8` stores at most three bytes per character, which silently excludes every four-byte character — including all emoji. The one you want is `utf8mb4`.

## What "length" means, exactly

Here is where daily engineering work starts to hurt. Ask for the length of a string and you have asked an ambiguous question, because there are at least three defensible answers.

Take the family emoji 👨‍👩‍👧‍👦. It is one thing on screen. It is 25 bytes in UTF-8. It is 11 units in UTF-16, which is what JavaScript's `.length` reports. It is 7 code points, which is what Python's `len()` reports — four human figures joined by three invisible zero-width joiners, U+200D, whose entire job is to tell the renderer "combine these." A thumbs-up with a skin tone modifier is 2 code points and 8 bytes for one visible glyph.

The unit users actually mean is the **grapheme cluster**: one perceived character, however many code points it took. Almost no language gives you that in the standard library by default; you generally need an ICU-backed library or a language whose string type takes segmentation seriously. So when your API contract says "bio must be under 160 characters," you have to decide which of these you meant, and your validator and your database column limit had better agree — or a user will paste an emoji and get a 500 from a truncated multi-byte sequence.

Then there is normalization. The character "é" can be a single code point, U+00E9, or two — a plain "e" followed by U+0301, a combining acute accent. They render identically. They compare unequal under every byte comparison your language does by default. That is a real authentication bug: a username typed on macOS and a username typed on Windows can look the same and hash differently. Unicode's answer is normalization forms, of which NFC (compose into single code points where possible) is the sensible default for storage and comparison, with NFD (decompose) useful when you want to strip accents. **Normalize on input, once, at the boundary** — the same discipline you apply to trimming whitespace and lowercasing emails.

Combining characters also break the naive `s[::-1]` reversal you learned as an interview answer, because reversing the code points detaches the accent from its letter and reattaches it to the previous one. And case conversion turns out to be locale-dependent rather than character-dependent: German ß uppercases to "SS", so the result is longer than the input, and Turkish has a dotted and a dotless "i" with different case mappings from English, which is why an unqualified `toLowerCase()` can silently corrupt Turkish data. Case conversion is not a per-character table lookup, and treating it as one is how "I" becomes wrong.

## There is no such thing as plain text

The phrase "it's just plain text" is doing a lot of concealing. A byte sequence carries no information about its own encoding; the encoding is metadata you have to know from a header, a declaration, a convention, or a guess. Once decoded, the code points do not map one-to-one onto anything a user would call a character. Once you have characters, comparison requires normalization, ordering requires locale-specific collation rules, and case requires knowing the language.

None of this is over-engineering. It is what it costs to represent Devanagari conjuncts, Arabic contextual forms, Korean Hangul composition, and right-to-left text in the same system as English — while an old ASCII file still opens correctly. The remarkable thing is not that string handling is complicated. It is that a standard exists at all which lets a message typed in Mumbai render correctly on a phone in Helsinki, and that most days you write `str` and never think about any of it. The abstraction is extraordinarily good. It is worth knowing where its seams are, because you will eventually be standing on one.
