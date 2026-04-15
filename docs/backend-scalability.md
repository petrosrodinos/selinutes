# Real-time multiplayer backend scalability (NestJS + Socket.IO on Railway)

## Scope and definitions

- **Concurrent users**: distinct WebSocket connections (each player = one connection).
- **Concurrent game sessions**: pairs of players in an active match → **sessions ≈ users / 2** when everyone is in a 2-player game (ignoring lobby-only connections).
- **Single Railway service**: one Node process unless you run clustering or multiple replicas (see Horizontal scaling).

---

## Assumptions (typical 2-player board game)

| Parameter | Conservative | Aggressive | Notes |
|-----------|--------------|------------|--------|
| **Average message rate (per player)** | 0.1–0.3 evt/s | 0.5–1.5 evt/s | Includes moves, acks, light sync; excludes large bursts (reconnect full state). |
| **Payload size (application)** | 150–400 B | 800–2500 B | JSON move + metadata; larger on full-state snapshots. |
| **Framing overhead** | +~14–64 B WebSocket per frame; +TCP/IP ~40–60 B | Same | TLS adds CPU, not huge per-message size on wire. |
| **Socket.IO overhead** | Namespaces/acks, optional binary; **plan +15–40%** CPU vs raw WS if features used | | Heartbeats (`pingInterval`/`pingTimeout`) add steady traffic. |
| **Average session duration** | 10–20 min | 3–45 min | Drives churn and peak “steady” concurrency, not instantaneous CPU unless reconnect storms. |
| **Memory per connection (Node + Socket.IO)** | ~80–120 KB | ~120–200 KB | Buffers, TLS session, per-socket state; spikes on large `maxHttpBufferSize`. |
| **Memory per game room (server state)** | 5–30 KB | 20–100 KB | Small if state is compact; avoid duplicating full history in RAM. |
| **Process baseline RAM** | ~150–400 MB | ~300–800 MB | Nest + deps + heap headroom before connections. |

**Network overhead (orders of magnitude):** for the assumed rates and small JSON, **egress/ingress is usually not the first bottleneck** on Railway compared to **RAM (connections)** and **CPU (JSON + Socket.IO + TLS)**.

---

## Bottleneck analysis

### CPU (event handling, serialization)

- Node’s **JavaScript work is largely single-threaded** per process; more vCPUs help **TLS**, **libuv I/O**, and **GC**, but **hot-path JSON parse/stringify and game logic** scale with **effective single-thread throughput** unless you shard work (workers, multiple processes).
- **Cost drivers:** JSON size, validation (`class-validator`/Zod), logging volume, synchronous work in handlers, per-event DB hits.
- **Rule of thumb:** measure **p95/p99 handler time** (e.g. 0.05–2 ms/event). Multiply by **inbound events/s** to get CPU demand.

### Memory (connections + state)

- Dominant term is often **`connections × memory_per_connection`**, not the board state, if state stays small.
- **GC pressure** rises with churn (short sessions, reconnect spam) and large buffers.

### WebSocket / OS limits

- **Practical limits** are usually **RAM and CPU**, then **file descriptor / ephemeral port** tuning (`ulimit`, connection tracking), not a hard “WebSocket cap” in the protocol.
- Railway/Linux defaults are typically **fine until very large** connection counts; verify under load.

### Socket.IO-specific

- **Redis adapter** fixes **broadcast across nodes**; it adds **Redis CPU/latency** and **serialization** for multi-node fan-out—still often worth it for horizontal scale.

---

## Capacity model (rough)

Let:

- \(C\) = concurrent connections (≈ concurrent users).
- \(G \approx C/2\) = concurrent 2-player games (if all users are in-match).
- \(E\) = aggregate **inbound + outbound** application events per second (count both directions if you bill CPU that way).
- \(m\) = average **CPU milliseconds per event** on the hot path (measure in prod-like load).
- \(M_{\mathrm{conn}}\) = memory per connection (bytes).
- \(M_{\mathrm{base}}\) = baseline process memory (bytes).
- \(U_{\mathrm{cpu}}\) = target CPU utilization cap (e.g. 0.5 conservative, 0.7 aggressive for sustained).

**CPU-bound approximate steady-state (single main-thread limited process):**

\[
E_{\max}^{\mathrm{cpu}} \approx \frac{U_{\mathrm{cpu}} \times 1000}{m}
\quad\text{(events/s, single-thread JS budget)}
\]

If each of \(C\) players emits \(r\) evt/s and you also process fan-out to opponent (order ~2× traffic for 2-player relay):

\[
E \approx 2 \times C \times r
\quad\text{(order of magnitude; depends on echo patterns)}
\]

Combine: solve for \(C\) given \(r\) and \(m\), or solve for max \(r\) given \(C\).

**Memory-bound:**

\[
C_{\max}^{\mathrm{mem}} \approx \frac{ \mathrm{RAM}_{\mathrm{avail}} - M_{\mathrm{base}} }{ M_{\mathrm{conn}} }
\]

Use **60–70% of RAM** as `RAM_avail` for the Node heap + connection overhead in production planning.

**Recalculate anytime:** the tightest bound is  
\(\min(C_{\max}^{\mathrm{mem}},\, C_{\max}^{\mathrm{cpu}})\) **per process**, then multiply by **replicas** if stateless routing + shared adapter is correct for your game.

---

## Scaling estimates by Railway tier

Numbers below assume **one Node/Nest process per Railway instance**, **typical small JSON**, **no huge broadcasts**, and **no accidental DB sync on every tick**. Treat **users** as WebSocket connections; **sessions** = users / 2.

### Interpretation

- **Conservative:** sustained load with headroom for spikes, GC, deploys, Redis latency, and noisy neighbors; **CPU ~50–60%**, **RAM ~60%** of available.
- **Aggressive:** upper bound before **latency growth**, **GC pauses**, or **OOM risk**; short bursts may exceed this.

### Table A — Conservative (recommended planning)

| Instance | Concurrent users (connections) | Concurrent 2p sessions (≈ users/2) | Notes |
|---------|-------------------------------|-------------------------------------|--------|
| **4 vCPU / 4 GB** | **~4k–8k** | **~2k–4k** | Usually **memory-first** bound; CPU OK at low–moderate evt/s. |
| **6 vCPU / 6 GB** | **~8k–12k** | **~4k–6k** | More RAM lifts connection ceiling more than extra CPU for one process. |
| **8 vCPU / 8 GB** | **~12k–18k** | **~6k–9k** | Same: **don’t assume 8× throughput** on one JS thread—plan horizontal scaling for CPU-heavy workloads. |

### Table B — Aggressive (upper bound before degradation)

| Instance | Concurrent users | Concurrent 2p sessions | Notes |
|---------|------------------|------------------------|--------|
| **4 / 4** | **~10k–14k** | **~5k–7k** | Requires lean deps, tight buffers, excellent profiling; tail latency suffers first. |
| **6 / 6** | **~16k–22k** | **~8k–11k** | |
| **8 / 8** | **~22k–32k** | **~11k–16k** | Often hits **operational risk** (OOM, FD, noisy GC) before raw CPU “max”. |

**Sensitivity:** if **average** player rate rises to **~1 evt/s** with **~0.5–1.0 ms** JS per event end-to-end, **CPU can fall below memory** and cut these user counts **roughly 2–5×** unless you optimize or scale out.

---

## Optimization strategies

### Horizontal scaling (Railway)

- Run **multiple instances** behind Railway’s load balancer with **sticky sessions** (or session affinity) **or** design **stateless connection routing** if possible (often hard for games).
- Use **Socket.IO Redis adapter** (or Redis Streams / dedicated messaging) for **cross-node rooms** and broadcasts.
- Ensure **single source of truth** for match/room membership in **Redis** to avoid split-brain.

### Efficient event handling

- Keep handlers **non-blocking**; **no sync DB** on every move—batch, pipeline, or write-behind where rules allow.
- Prefer **binary schemas** (MessagePack/flatbuffers) or **minimal DTOs** if JSON cost shows in profiles.
- Rate-limit noisy clients; validate with **cheap** checks first.

### State management

- Store **compact** game state; avoid storing full move history in RAM if not required.
- Use **immutable patches** or **versioned state** to reduce accidental large diffs.
- On reconnect, send **snapshots** rarely; use **incremental** sync when possible.

### Operational hardening

- Tune **Socket.IO** ping settings vs mobile backgrounding.
- Set explicit **maxHttpBufferSize** to prevent memory bombs.
- Load test with **production-like** TLS, **Redis**, and **logging levels** (info vs debug changes CPU a lot).

---

## Bottom line

Under **typical** 2-player board-game traffic (roughly **sub‑1 evt/s average per player**, **hundreds of bytes** payloads), a **single well-tuned Nest + Socket.IO** process on **4 GB** often plateaus in the **single-digit thousands to low tens of thousands of concurrent connections** depending on buffer sizes and dependencies—**RAM and per-connection overhead usually dominate**, while **higher message rates or fat JSON** flip the bottleneck to **CPU on the JS thread**. Treat multi-vCPU on **one** Node process as **partial** headroom unless you measure and/or add **workers / multiple processes / horizontal replicas**.
