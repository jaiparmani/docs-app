# Day 28 — Kafka Producer/Consumer Design (LLD)

## What we're learning today
Turning yesterday's Kafka concepts into a concrete producer/consumer design — partition key selection and delivery guarantees.

## Core concept
Two design decisions define correctness: **(1) what key you partition by**, and **(2) what delivery guarantee you configure** (at-most-once, at-least-once, exactly-once).

## Visual diagram
```
Producer.send(key=userId, event)
       |
   hash(userId) % numPartitions --> Partition 2
       |
Partition 2: [...][...][new event]
       |
Consumer Group "notification-workers"
   Worker A reads Partition 0,1   Worker B reads Partition 2,3
   (Kafka auto-assigns partitions across group members)
```

## Explanation
```java
class EventProducer {
    private final KafkaProducer<String, String> producer;

    void publish(String userId, String eventJson) {
        // Partitioning by userId guarantees all of this user's events
        // land in the same partition -> preserves per-user ordering
        ProducerRecord<String, String> record =
            new ProducerRecord<>("user-events", userId, eventJson);

        producer.send(record, (metadata, exception) -> {
            if (exception != null) {
                // log + retry with backoff, same abstraction as Day 8's RetryHandler
                retryHandler.scheduleRetry(record);
            }
        });
    }
}

class EventConsumer {
    void poll() {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));
        for (ConsumerRecord<String, String> record : records) {
            processIdempotently(record); // Day 24's idempotency key pattern applies here too
        }
        consumer.commitSync(); // commit offset only AFTER successful processing
    }
}
```
**The offset-commit ordering is the whole ballgame:**
- Commit *before* processing → if the worker crashes mid-processing, that message is lost forever (**at-most-once**).
- Commit *after* processing (shown above) → if the worker crashes after processing but before committing, the message gets redelivered on restart (**at-least-once** — requires idempotent processing, tying directly back to Day 24).
- **Exactly-once** requires transactional writes tying the offset commit and the downstream write into one atomic operation (Kafka's transactional producer API) — expensive, and most systems achieve the same practical safety with at-least-once + idempotency instead.

## Real-world examples
- **LinkedIn (Kafka's birthplace):** partitions activity events by user ID for the same per-user-ordering reason shown above — feeds and notifications need to process a user's actions in the order they happened.
- **Your Feed Ranking Engine (Day 9-10):** a "like" and its subsequent "unlike" must be processed in order — partitioning by post ID or user ID (whichever the ranking logic depends on) prevents an out-of-order race.

## Interview perspective
This tests whether you understand that "exactly-once" is usually a **marketing term**, not a free guarantee — real systems achieve equivalent safety via at-least-once + idempotency (Day 24), which is cheaper and simpler. Claiming you'll "just use exactly-once semantics" without understanding the transactional cost is a flag for interviewers that you haven't operated these systems.

## Trade-offs
| | At-most-once | At-least-once | Exactly-once |
|---|---|---|---|
| Data loss risk | Possible | None | None |
| Duplicate risk | None | Possible (needs idempotency) | None (transactional) |
| Performance cost | Lowest | Low | Highest |
| Complexity | Low | Medium (needs Day 24) | High |

## Interview question
"Two events for the same user arrive in different Kafka partitions due to a partition-key bug. What breaks downstream, and how do you detect this class of bug before it ships?"

> [!question]- Think it through, then expand
> Kafka's ordering guarantee is scoped to one thing specifically — what happens the moment two related events fall outside that scope?

> [!success]- Answer
> What breaks: Kafka only guarantees ordering *within* a single partition, so two events for the same user landing in different partitions can be consumed out of order relative to each other — e.g. an "unlike" processed before its corresponding "like" if they raced across partitions, corrupting any downstream logic that assumes causal order per user. Detection before shipping: a test that asserts every event for a fixed set of sample keys always hashes to the same partition number across multiple calls (catching a bug where the partition key was accidentally derived from something other than the intended field, like including a timestamp that changes per event), plus a production metric tracking "events per user seen out of expected sequence" as an early warning if it ever slips through.

## Key design principle
**At-least-once delivery plus idempotent processing (Day 24) is almost always the pragmatic choice over exactly-once — cheaper, simpler, and equally safe.**

## 30-second challenge
If you increase `numPartitions` on an existing topic from 4 to 8, what happens to the partition assignment for existing keys — does per-user ordering still hold for users with prior events?

*(Hint: this is the resharding problem from Day 21, applied to Kafka — existing key-to-partition mapping isn't stable across a partition count change.)*

## Tomorrow
Day 29 (HLD) — Distributed Locks: coordinating access to shared resources across multiple machines (ZooKeeper, etcd, Redis Redlock).
