---
tags: [reads, tech, databases, data-structures, storage-engines]
---

# Why Databases Argue About B-Trees vs LSM-Trees

<small>6 min read</small>

Most engineers who use Postgres and Cassandra in the same career never ask how either one actually gets a byte onto disk, and the mental model that fills the gap — "it's some kind of tree, they're all roughly the same" — is wrong in a way that quietly explains why one of them is a bad fit for a high-ingest logging pipeline and the other is a bad fit for an analytics-heavy application. The two dominant storage engine designs in modern databases, B-Trees and LSM-Trees, aren't different implementations of the same idea. They optimize for opposite things, and the argument between them is really an argument about which cost you're willing to defer and for how long.

## The B-Tree answer: pay on write, so reads stay cheap

A B-Tree — more precisely, the B+Tree variant used by Postgres and MySQL's InnoDB engine — is a balanced, sorted tree structure where each node corresponds to a fixed-size page on disk, typically a few kilobytes. To find a row, you walk from the root down to a leaf, and because the tree stays balanced and each node fans out to many children, that walk is short: three or four levels deep even for tables with hundreds of millions of rows. That's the entire appeal. A read costs a small, predictable number of page fetches, full stop, regardless of the shape of the data.

The cost shows up on the write side. Updating a row means finding its exact page — again, a root-to-leaf walk — and modifying that page in place, on disk, right where it already lives. If the page overflows, the tree has to split it and rebalance, touching neighboring pages too. Crucially, that modified page could be anywhere in the file: row 4 you just updated might be miles away, physically, from row 5 you update next. Each write is a random-access operation, not a sequential one. On a spinning disk this used to mean an actual seek; on an SSD it's cheaper but still means a read-modify-write cycle and, over time, write amplification from page splits and internal fragmentation as pages end up partially full. B-Trees make this trade deliberately: they front-load cost onto every write so that every read stays flat and fast. That's exactly right for the workload Postgres and InnoDB are usually asked to run — systems where reads vastly outnumber writes, and where read latency needs to be predictable because a user is often waiting on it.

## The LSM-Tree answer: pay later, in the background

Log-structured merge trees — the engine behind Cassandra, RocksDB, and LevelDB — start from the opposite premise: writes should never touch disk in a random-access pattern, ever. A write first goes to an in-memory sorted structure (commonly a skip list, called a memtable) and a write-ahead log for durability, and both of those are pure sequential appends. No seeking to find the right spot, no reading the old value first. This is about as fast as a write can be.

When the memtable fills up, it gets flushed to disk as an immutable, sorted file — an SSTable. It's never modified again. Over time, the engine accumulates many of these files, and a later write to the same key doesn't overwrite anything; it just gets recorded as a newer entry that will shadow the older one. This is where the bill comes due. A read now potentially has to check the memtable and then several SSTables, from newest to oldest, until it finds the key or exhausts the files — bloom filters help skip files that provably don't contain the key, but the cost is still real and grows with the number of files. To keep that cost bounded, LSM engines run compaction: a background process that merges SSTables together, discards entries that have been overwritten or deleted, and produces fewer, larger, still-sorted files. Compaction is the entire mechanism that makes the deferred cost payable at all — without it, read latency would degrade without bound as files piled up.

## What amplification actually means, concretely

The tradeoff between these two designs is usually summarized with three kinds of amplification, and they're worth being precise about rather than treating as vague vocabulary. Write amplification is the ratio between the logical bytes you asked the database to write and the physical bytes actually written to disk over that data's lifetime; LSM-Trees can have write amplification in the range of ten to thirty times, because the same row gets rewritten every time it's involved in a compaction pass, potentially several times as it moves through compaction levels. B-Trees have much lower write amplification per logical write, but pay in seek cost and page-split overhead instead. Read amplification is how many physical reads a single logical read requires; a B-Tree read is close to one page fetch per tree level, while an LSM read may need to consult multiple SSTables before it's done, unless bloom filters and caching absorb most of that. Space amplification is how much extra disk the engine uses beyond the logical size of the data; LSM-Trees temporarily hold stale and duplicate versions of rows until compaction clears them out, so disk usage can run well above the logical dataset size between compaction passes, while B-Trees mostly lose space to partially-full pages left behind by deletes and splits.

None of these numbers are fixed — they depend heavily on compaction strategy, page fill factor, and workload shape — but the direction is structural, not tunable away. An LSM-Tree makes writes cheap by making reads and space usage variable and by scheduling a large chunk of the real cost for later. A B-Tree makes reads cheap and predictable by paying real cost, in place, on every single write.

## The general shape: every storage engine is a bet on when you pay

There is no configuration of either design that gives you optimal reads, optimal writes, and minimal space simultaneously — improving one of the three necessarily worsens at least one of the others, which is why the argument between B-Trees and LSM-Trees never actually resolves in either direction. Cassandra didn't choose LSM-Trees because they're a better data structure than a B-Tree in some absolute sense; it chose them because its target workload — high-volume, append-heavy writes, often with reads that can tolerate a bit more latency or land on recent data that's still in cache — makes "cheap writes, deferred read cost" the right bet. Postgres chose the opposite bet because its target workload usually looks the other way around.

The pattern here — do the expensive work later, off the critical path, in the background, in bulk, where it's cheaper per unit — shows up constantly outside of storage engines: garbage collection defers memory reclamation instead of doing it inline with every allocation; write-behind caches defer persistence; log-based event systems defer processing until a consumer is ready. Compaction is just the storage-engine instance of a much more general move: never pay a cost synchronously on the hot path if you can defer it to a moment when you control the batching, the timing, and the resources available to absorb it. Picking a storage engine isn't picking whether you'll pay for your writes. It's picking when, and choosing wrong for your workload means paying the wrong bill at the wrong time, on the path a user is actually waiting on.


## Linked from

- [1_Tech & Engineering](index.md)
