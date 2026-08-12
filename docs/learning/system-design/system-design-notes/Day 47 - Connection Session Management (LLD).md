# Day 47 — Connection & Session Management at Scale (LLD)

## What we're learning today
Day 46 identified statefulness as the hard problem. Today builds the actual mechanism — the presence registry and reconnection handling — that makes routing to a stateful, specific connection server actually work, the concrete version of [07-design-chat-system](../Claude Notes/07-design-chat-system.md)'s architecture.

## Core concept
A **presence registry** is a fast, shared key-value mapping `user_id → connection_server_id` (and often `→ socket/session_id` too), kept current via registration on connect, deregistration on disconnect, and a **TTL as a safety net** for ungraceful disconnects the server never got a clean signal for.

## Visual diagram
```
User A connects to Connection Server 3:
  Registry: SET presence:userA -> {server: cs-3, session: sess-abc}  TTL 60s
  Server 3: heartbeats renew the TTL every ~20s while connection is alive

Network drops ungracefully (no clean disconnect signal):
  Server 3 never sends a deregister -> TTL simply expires after 60s of no renewal
  Registry entry auto-removed -> system correctly treats user A as offline

User A reconnects (possibly to a different Server, e.g. cs-7):
  Registry: SET presence:userA -> {server: cs-7, session: sess-xyz}  (overwrites stale entry if any)
```

## Explanation
- **Registration must happen on connect, deregistration on disconnect — but graceful disconnect isn't guaranteed.** A clean logout, tab close (with a beacon), or explicit close frame lets the server deregister immediately. A crashed client, killed process, or dropped network never sends anything — the server has no signal at all. This is exactly why the registry entry needs a **TTL**, the same lease-expiry pattern as [Day 30](Day 30 - Redis Distributed Lock Implementation (LLD).md)'s lock TTL and [05-design-job-scheduler](../Claude Notes/05-design-job-scheduler.md)'s job lease: absence of a heartbeat renewal is what ultimately reclaims stale state, since you can't rely on an explicit signal that might never arrive.
- **Heartbeats serve two purposes simultaneously**: they keep the TTL alive (so the registry doesn't prematurely mark an active user as offline), and they let the *client* detect a dead connection quickly (if the server stops acknowledging heartbeats, the client knows to reconnect rather than assuming its silent connection is still good).
- **Reconnection must handle "connect to a different server than before."** Since connection servers are interchangeable from the client's perspective (any healthy one can accept a new connection), a reconnecting client after a drop very likely lands on a different instance — the registry entry simply gets overwritten with the new server/session, and any in-flight delivery attempts to the old (stale) server need to fail gracefully and not be treated as permanent delivery failures, just "try the registry again."
- **A stale registry entry (server crashed, never deregistered, TTL hasn't expired yet) causes a real, bounded failure window**: a message routed to that entry will fail to deliver (the target server is gone) until the TTL expires and the routing layer either falls back to "user is offline, trigger [04-design-notification-system](../Claude Notes/04-design-notification-system.md) instead" or the registry entry gets corrected. This bounded staleness is the direct, concrete instance of Day 46's "presence is AP" framing — a brief routing failure here is an acceptable, self-healing cost, not a correctness bug requiring a stronger consistency model.
- **Session data belongs in the registry entry too, not just the server mapping** — enough to resume context on reconnect (e.g. last-acknowledged message ID per open conversation) so a reconnecting client can immediately request "what did I miss," directly connecting to [07-design-chat-system](../Claude Notes/07-design-chat-system.md)'s cursor-based offline-catch-up mechanism.

```
pseudocode:
function onConnect(user_id, server_id, session_id):
    registry.set(f"presence:{user_id}", {server: server_id, session: session_id}, ttl=60)
    startHeartbeatLoop(user_id, interval=20)  # renews TTL periodically

function onHeartbeat(user_id):
    registry.renewTTL(f"presence:{user_id}", ttl=60)

function onDisconnect(user_id):  # graceful path only
    registry.delete(f"presence:{user_id}")
    # ungraceful path: nothing to do here — TTL expiry handles it

function routeMessage(user_id, message):
    entry = registry.get(f"presence:{user_id}")
    if entry is None:
        triggerOfflineNotification(user_id, message)   # hands off to notification system
    else:
        deliverToServer(entry.server, entry.session, message)
        # if delivery fails (server actually gone, entry stale): treat as offline, retry via notification path
```

## Real-world examples
- **Socket.IO's Redis adapter:** implements essentially this presence-registry pattern to let a Socket.IO cluster route events across multiple Node.js instances holding different clients' connections — a widely-used, real implementation of exactly this mechanism.
- **Slack's connection architecture:** documented publicly as using a gateway layer that tracks which "Flannel"/connection server holds each client's WebSocket, with Redis-backed presence tracking conceptually matching this pattern.
- **Mobile app "online" indicators generally:** almost every app showing a green "online now" dot is reading from a TTL-backed presence store exactly like this one — the dot going gray after the user closes the app without a clean disconnect is the TTL expiring, working as designed, not a bug.

## Interview perspective
The signal is explaining *why* a TTL is necessary rather than relying purely on explicit disconnect events — candidates who design registration/deregistration as if disconnects are always clean miss the single most common real-world failure mode (a phone losing signal, an app being force-killed) and end up with a design where offline users are incorrectly shown as online indefinitely.

## Trade-offs
| | Explicit deregister only | TTL + heartbeat (this design) |
|---|---|---|
| Handles graceful disconnect | Yes | Yes |
| Handles crash/network drop | No — entry never cleaned up | Yes — self-heals via TTL expiry |
| Cost | Lower (no periodic heartbeat traffic) | Heartbeat traffic overhead, worth it for correctness |

## Interview question
"A message is routed to a user's registered connection server, but delivery fails because that server actually crashed 10 seconds ago and the TTL (60s) hasn't expired yet. What should happen?"

> [!question]- Think it through, then expand
> The registry currently disagrees with reality — what's the safe way to handle that disagreement?

> [!success]- Answer
> Treat the delivery failure itself as a signal, don't just wait passively for the TTL: on a failed delivery attempt to a specific server, proactively delete that stale registry entry (rather than trusting it until natural expiry) and fall back to the offline path — hand the message to [04-design-notification-system](../Claude Notes/04-design-notification-system.md) for push delivery instead. This bounds the failure window to "one failed delivery attempt" rather than "up to 60 seconds of silently failed deliveries" — a good instance of not passively trusting a lease's TTL when you already have direct evidence (a failed delivery) that the underlying state is stale.

## Key design principle
**Presence state must be reclaimable without relying on a clean signal from the client — a TTL-based lease, actively corrected on any evidence of staleness (like a failed delivery), is what makes a connection-routing system self-healing instead of silently accumulating incorrect state.**

## Next
Block D continues: Video Streaming Fundamentals (Day 48) — a different large-payload, async-processing problem than chat's small real-time messages, reusing CDN edge caching (Day 17) for a new content type, and the direct prerequisite [08-design-youtube](../Claude Notes/08-design-youtube.md) referenced ahead of time.
