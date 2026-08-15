# Day 46 — WebSockets, Long Polling & SSE: Connection Scaling (HLD)

<small>7 min read</small>

## What we're learning today
Starts Block D. Every design through Day 45 was request/response: client asks, server answers, connection closes. [07-design-chat-system](../Claude Notes/07-design-chat-system.md) needed something structurally different — the server pushing to a client without being asked first. Today derives that primitive properly.

## Core concept
**Real-time server push** requires a connection the server can write to whenever it wants, not just in response to a request. **WebSockets** provide a persistent, full-duplex connection; **long polling** and **Server-Sent Events (SSE)** are older/lighter-weight approximations built on top of plain HTTP. The hard systems problem isn't picking a protocol — it's that a persistent connection means a server now holds **real per-client state in memory**, which changes how you scale and deploy.

## Visual diagram
```
Plain HTTP (request/response):
  Client -> request -> Server -> response -> [connection closes]
  Server can NEVER initiate — client must ask again to get new data

Long polling:
  Client -> request -> Server holds it open until data exists (or timeout) -> response -> client immediately re-requests
  (approximates push by never really "closing the loop")

WebSocket:
  Client -> HTTP upgrade handshake -> connection stays open, both directions
  Server: push(data) -> arrives at client immediately, no new request needed
  Client: send(data) -> arrives at server immediately
```

## Explanation
- **Long polling is push emulated on top of pull** — the client makes a request that the server intentionally delays answering until there's something to say (or a timeout passes), then the client immediately issues a new request. It works everywhere plain HTTP works, but costs a full HTTP request/response cycle's overhead per message, and connection churn (constantly opening new requests) scales worse than one connection held open.
- **SSE is a real, standard, one-directional push channel** (server → client only, over a single long-lived HTTP connection, with automatic browser-side reconnection built in) — simpler than WebSockets when you only need server-to-client push (e.g. live scores, notifications feed) and don't need the client to send data over the same channel.
- **WebSockets are genuinely bidirectional and lowest overhead per message** — one handshake, then both sides can write at any time with minimal per-message framing cost. This is the right choice specifically when the client also needs to send frequently (chat messages, collaborative editing) rather than just receive.
- **The actual hard problem: statefulness.** Every prior applied design's app servers were stateless — any instance could handle any request, which is *why* [round-robin load balancing](Day 25 - Load Balancing and Reverse Proxy (HLD).md) just works. A WebSocket connection lives on **one specific server instance** for its entire duration — that server now holds real state (the open socket) that can't just be handled by "any available instance" the way a stateless HTTP request can.
- **This statefulness is exactly what [07-design-chat-system](../Claude Notes/07-design-chat-system.md)'s presence registry solves**: since a connection is pinned to one server, any other server needing to deliver a message to that user must know *which* server currently holds their socket — a routing problem that simply doesn't exist for stateless request/response designs, because there, "which server" was never a meaningful question.
- **Deployments become a real, visible event.** Restarting a stateless app server mid-request just means the load balancer retries elsewhere, invisible to the user. Restarting a WebSocket connection server drops every connection it's currently holding — clients must detect the drop and reconnect (possibly to a different server), a user-visible blip that stateless HTTP services simply don't have to account for.

## Real-world examples
- **Slack, Discord:** WebSocket-based, exactly for the low-latency bidirectional messaging need — a message send and a message receive both need to be near-instant, in both directions.
- **Stock ticker / live sports score widgets:** classic SSE use case — purely server-to-client push, no need for the client to send anything back over the same channel, so the simpler one-directional primitive is the better fit, not just "the older one."
- **Older chat/notification systems before WebSocket support was universal:** long polling was the standard workaround, and some systems still fall back to it specifically for compatibility with restrictive proxies/networks that don't reliably support WebSocket upgrades — worth knowing this fallback exists, not just that it's "the old way."

## Interview perspective
The signal isn't "which protocol" (WebSockets is almost always the expected answer for genuine bidirectional real-time needs) — it's recognizing, unprompted, that persistent connections make your app tier **stateful** for the first time in this whole roadmap, and that this has concrete downstream consequences: connection-aware routing (presence registry), different deployment/rolling-restart behavior, and different load-balancing needs (can't just round-robin a *new message* the way you round-robin a *new request*, since it has to reach the specific server holding the target connection).

## Trade-offs
| | Long polling | SSE | WebSocket |
|---|---|---|---|
| Direction | Approximated push (via repeated pull) | Server → client only | Full bidirectional |
| Overhead per message | High (full HTTP cycle) | Low (single held-open connection) | Lowest |
| Works through restrictive proxies/older infra | Best compatibility | Good | Occasionally blocked/degraded |
| Server statefulness | Less severe (connections are short-lived, reopen often) | Persistent connection, same statefulness concern | Persistent connection, same statefulness concern |

## Interview question
"Why can't you just round-robin-load-balance a 'push this message to user X' request the same way you load-balance a normal API request?"

> [!question]- Think it through, then expand
> What does "which server" mean for a stateless HTTP request, versus for this?

> [!success]- Answer
> A normal stateless HTTP request can be handled by *any* available server instance — there's no meaningful difference between them for that purpose, so round-robin (or any load-balancing strategy) works fine. But "push this message to user X" isn't a request that any server can fulfill — only the **specific server instance currently holding user X's open WebSocket connection** can actually deliver it; every other instance has no way to reach that socket. Round-robining this request to an arbitrary server would fail most of the time, since most servers don't hold that connection. This is exactly why a routing layer (the presence registry from [07-design-chat-system](../Claude Notes/07-design-chat-system.md)) has to exist specifically for connection-oriented systems — it answers "which specific server" instead of "any available server."

## Key design principle
**A persistent connection makes the server holding it stateful for the first time in this roadmap — every downstream design decision (routing, deployment, load balancing) has to account for "which specific instance," not just "any healthy instance," once that's true.**

## 30-second challenge
If a WebSocket connection server needs to restart for a deploy, what would a "graceful drain" look like here, compared to how a stateless HTTP server drains connections before a rolling restart?

## Scenario Practice

**Scenario 1:** A chat service scales its WebSocket-handling tier from 1 instance to 10 behind a standard round-robin load balancer. Two users in the same chat room, connected to different instances, stop seeing each other's messages. Why?

> [!question]- Think it through, then expand
> This day's key design principle says a persistent connection makes the server stateful — what does that imply about a message that needs to reach a specific connection?

> [!success]- Answer
> Each WebSocket connection is pinned to the specific instance that accepted it — a message arriving at instance A has no way to reach a client connected to instance B unless something explicitly bridges them, which a plain round-robin load balancer doesn't do; it only routes *new* connections, it doesn't route *messages between* already-established connections on different instances. The fix is a pub/sub layer between instances (commonly Redis pub/sub, per [Day 13](Day 13 - Redis Internals (HLD).md)) so that when instance A receives a message for the room, it publishes it, and every instance (including B) subscribed to that room's channel picks it up and forwards it to its own locally-connected clients. This is exactly the "which specific instance, not just any healthy instance" problem this day's principle names.

**Scenario 2:** A mobile client's WebSocket connection drops when it goes through a tunnel, then reconnects 30 seconds later. What messages, if any, has it missed, and whose job is it to make sure the client catches up?

> [!question]- Think it through, then expand
> Is a WebSocket connection itself responsible for remembering what was sent while a client was disconnected?

> [!success]- Answer
> The connection itself remembers nothing — once dropped, any messages published during that 30-second gap are simply gone from the WebSocket's perspective; a WebSocket is a live pipe, not a durable log. Catching the client up on missed messages is the application's responsibility, typically by having the client send its last-known message ID (or timestamp) on reconnect, and the server replaying anything newer from a durable store — which means the "real-time" delivery via WebSocket and the "durable" delivery guarantee are actually two separate mechanisms working together, not one mechanism doing both jobs, echoing the same durable-log-plus-live-transport split covered in [this day's](Day 46 - WebSockets Long Polling and SSE (HLD).md) own explanation of why messages are typically persisted separately from the live connection.

## Tomorrow

Day 47 (LLD) — Connection/session management at scale: the presence-registry mechanics and reconnection handling that make today's statefulness actually workable across many servers.
