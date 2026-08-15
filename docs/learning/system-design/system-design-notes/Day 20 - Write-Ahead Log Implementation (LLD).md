# Day 20 — Write-Ahead Log (LLD)

<small>3 min read</small>

## What we're learning today
The mechanism underneath yesterday's replication and every DB's crash recovery: log the intent before you touch the actual data.

## Core concept
**Write-Ahead Logging (WAL):** before mutating in-memory/on-disk data structures, append the operation to a sequential log file first. On crash, replay the log to reconstruct state. This is also literally what gets shipped to followers in replication.

## Visual diagram
```
Write request
     |
     v
[Append to WAL file] --(fsync, durable)--> ACK to client
     |
     v
[Apply to in-memory state / B+Tree]  (can happen after ack)

Crash recovery:
  Read WAL from last checkpoint --> replay each entry --> state restored
```

## Explanation
```java
class WriteAheadLog {
    private final FileOutputStream logFile;

    void append(String operation, String key, String value) throws IOException {
        String entry = String.format("%d|%s|%s|%s%n",
            System.currentTimeMillis(), operation, key, value);
        logFile.write(entry.getBytes());
        logFile.flush();
        logFile.getFD().sync(); // fsync: force to physical disk, not just OS buffer
    }
}

class RecoveryManager {
    Map<String, String> replay(File logFile) throws IOException {
        Map<String, String> state = new HashMap<>();
        for (String line : Files.readAllLines(logFile.toPath())) {
            String[] parts = line.split("\\|");
            String op = parts[1], key = parts[2], value = parts[3];
            if (op.equals("PUT")) state.put(key, value);
            else if (op.equals("DELETE")) state.remove(key);
        }
        return state;
    }
}
```
The critical detail: **fsync**. Writing to a file stream isn't durable until the OS actually flushes it to physical disk — `logFile.flush()` alone isn't enough (it only clears the app-level buffer; the OS can still lose it on power failure). This single line is the difference between "durable" and "looks durable until the data center loses power."

## Real-world examples
- **PostgreSQL's WAL** is exactly this pattern — and it's also what streaming replication ships to followers (the follower literally replays the leader's WAL).
- **Kafka's log segments** are conceptually a WAL — append-only, sequential, replayable — which is why Kafka can double as both a message queue and an event-sourcing log.
- **Redis AOF** (Day 13) is this same pattern applied to an in-memory store.

## Interview perspective
This question tests whether you understand durability at the *systems* level, not just "the database saves it." Interviewers probe: "what if the process crashes between the WAL write and applying it to the in-memory structure?" Correct answer: that's exactly why recovery replays the log — the in-memory structure being briefly behind the WAL is fine, because the log is the source of truth on restart.

## Trade-offs
| | With WAL | Without WAL (direct writes) |
|---|---|---|
| Crash recovery | Full — replay log | Data corruption/loss likely |
| Write latency | Extra fsync cost | Faster, but unsafe |
| Sequential vs random I/O | Sequential (fast on disk) | Often random (slower) |

## Interview question
"Your WAL file grows unbounded over a year of writes. How do you prevent replay-on-restart from taking hours?"

> [!question]- Think it through, then expand
> You don't need the whole log to reconstruct current state if you already have a recent snapshot of it — what does that suggest?

> [!success]- Answer
> Periodic checkpointing: snapshot the current in-memory/on-disk state to a durable checkpoint file, then truncate or archive the WAL entries before that checkpoint (they're no longer needed for recovery, since the checkpoint already captures their effect). On restart, recovery loads the latest checkpoint and only replays entries logged *after* it — bounding replay time to "since the last checkpoint," not "since the beginning of time," the exact same snapshot-bounds-replay trade-off Day 41's event-store snapshots use for the same reason.

## Key design principle
**Durability comes from ordering, not intention — write the log entry before the mutation, always, and fsync before acknowledging.**

## 30-second challenge
Why is sequential disk I/O (appending to a WAL) dramatically faster than random writes (updating scattered B+Tree pages directly), even on modern SSDs?

## Tomorrow
Day 21 (HLD) — Database sharding & partitioning: splitting data across machines when one node's disk isn't enough.
