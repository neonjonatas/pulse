# Reliability Plan — Full Environment Green Light (Pre-SSE Rollout)

## Role

You are **Claude Opus 4.6 acting as a Staff+ Reliability Engineer and Release Owner** for this system.

You are responsible for:

- bringing the **entire system to a "green" state**
- identifying and eliminating **all blockers**
- ensuring the system is **ready to validate SSE-based real-time delivery**
- coordinating infra, services, agents, and frontend readiness

You are NOT brainstorming.

You are producing a **concrete, executable reliability plan**.

---

## System Context (CRITICAL)

This is a **distributed system composed of:**

### Microservices
- 9 event-driven NestJS services (authority, slim-shady, soundgarden, backstage, petrified, fort-minor, stereo, mockingbird, hybrid-storage)
- publish/subscribe via NATS

### Backstage
- aggregates events from microservices
- transforms into **UI-facing reasoning events**
- SSE implementation is **complete and feature-flagged** (`USE_SSE=true`)
- Dual-run: Socket.IO gateway and SSE controller can run simultaneously

### Agents
- `chester` (Spotify search orchestrator), `emily` (transformation adapter), `shinoda` (health monitoring + orchestration)
- communicate via MCP
- Shinoda has a `health-pipeline.workflow.ts` that checks all 9 services via `GET /health`

### Frontend
- NextJS App Router with parallel routes (`@gallery`, `@now-playing`, `@uploader`, `@user-menu`)
- **reasoning component** already uses `EventSource` (SSE) with deduplication — no Socket.IO
- HLS player exists in `app/lib/hls/` but is currently **commented out / not rendered**

### Infrastructure
- Docker-based environment orchestrated via `@pack/env-orchestration`
- `docker-compose.yml` at `repos/packages/env-orchestration/docker-compose.yml`
- Infra services: NATS, MongoDB (x4), Redis (x2), MinIO (x5 + init jobs)
- App services: all 9 microservices + pulse (frontend) + shinoda

---

## Current State (VERIFIED)

### What is working
- SSE migration: complete behind `USE_SSE` feature flag in Backstage
- `SseStreamRegistry`, `SseEventStreamAdapter`, `SsePipelineController` all implemented
- `PipelineEventConsumer` implements `OnModuleDestroy` (drains NATS subscription)
- `PipelineEventPayload` has `id: string` field for Last-Event-ID
- Frontend uses native `EventSource` with dedup via `Set<string>` tracking `lastEventId`
- All 9 microservices expose `GET /health` returning `{ status: 'ok' }`
- Infra services (NATS, MongoDB, Redis, MinIO) have Docker healthchecks
- Shinoda has `health-pipeline.workflow.ts` checking all 9 services
- Chester and Emily implemented with Dockerfiles

### What is broken or missing

| Category | Gap | Impact |
|----------|-----|--------|
| **Infra** | App services have **no Docker healthcheck** in compose | `depends_on: service_healthy` cannot be used for app-to-app ordering |
| **Infra** | `docker-up.sh --bootstrap` calls `pnpm dx:env:template` but `package.json` defines `dx:template` | Bootstrap fails silently |
| **Agent** | Chester and Emily have Dockerfiles but are **not in docker-compose** | Cannot validate full agent topology locally |
| **Frontend** | Pulse Next.js app has **no `/health` endpoint** | Shinoda cannot monitor frontend health |
| **Agent** | Shinoda checks 9 microservices but **not itself or Pulse** | Blind spots in health monitoring |
| **SSE** | Replay events use `crypto.randomUUID()` instead of stored IDs | `Last-Event-ID` replay semantics are broken — reconnection replays may re-deliver or miss events |
| **SSE** | `USE_SSE=true` is not set in any `.env.template` | Default environment boots with Socket.IO, not SSE |

---

## Objective

Achieve a **fully operational local/staging environment** where:

- all services boot successfully
- all dependencies are wired correctly
- all services expose **health endpoints**
- Shinoda can verify system health
- events flow end-to-end
- SSE pipeline can be safely tested

---

## Definition of GREEN

The system is considered **GREEN** only if:

### Infrastructure
- all containers start successfully
- no crash loops
- no missing env vars
- networking between services works

### Services
- every microservice:
  - responds to health check
  - connects to broker (NATS)
  - subscribes/publishes correctly

### Backstage
- receives events from at least one service
- transforms them correctly
- SSE endpoint responds at `GET /pipelines/:trackId/events`
- heartbeat works (15s interval)

### Agents
- MCP connections work:
  - chester ↔ emily
  - both ↔ shinoda
- Shinoda can:
  - ping all services
  - detect failures

### Frontend
- loads successfully
- can connect to Backstage SSE stream
- deduplication works on reconnect

### Observability
- logs are readable and useful
- errors are visible
- no silent failures

---

## Your Task

Produce a **step-by-step reliability plan** to reach GREEN.

You must:

1. identify all missing pieces
2. define validation steps
3. define failure detection points
4. propose fixes for common failure modes
5. ensure Shinoda can act as system observer

---

## Output Format (STRICT)

---

### 1. Current State Assumptions

List what you assume is currently broken or incomplete.

Be explicit:
- missing health checks?
- unstable containers?
- partial MCP wiring?
- no SSE yet?

---

### 2. Critical Gaps to GREEN

List ONLY high-impact gaps.

For each:

- **Category** (infra / service / agent / frontend / orchestration)
- **Problem**
- **Impact**
- **Required Fix**

---

### 3. Environment Boot Plan (Docker + Orchestration)

Using `@pack/env-orchestration`, define:

- container startup order (if needed)
- required env variables
- dependency readiness (e.g., wait for NATS)
- health-based startup vs blind startup

Include:

- how to detect failed containers
- how to retry or fail fast

---

### 4. Service Health Standard (MANDATORY)

Define a **standard health check contract** for ALL microservices.

Current state: all 9 services return `{ status: 'ok' }` from `GET /health`.

Target contract:

```json
{
  "status": "ok | degraded | down",
  "service": "string",
  "dependencies": {
    "nats": "ok | down",
    "db": "ok | down"
  },
  "timestamp": "number"
}
```

Then define:

- how Shinoda will use this
- timeout rules
- failure classification

---

### 5. Shinoda Health Orchestration

Define how Shinoda:

- discovers services (currently uses `SERVICE_HEALTH_URLS` in `health-pipeline.workflow.ts`)
- calls health endpoints
- aggregates status
- detects:
  - partial failures
  - cascading failures
- reports system state

Also define:

- polling interval
- failure thresholds
- recovery detection

---

### 6. Event Flow Validation

Define how to verify: microservice → NATS → Backstage → SSE → frontend

Include:

- test event injection (Backstage has `MockEventGeneratorService` for this)
- expected logs
- validation checkpoints
- how to detect broken links in the chain

---

### 7. MCP Connectivity Validation

Validate:

- chester ↔ emily (via `MCPConfiguration`)
- agents ↔ shinoda

For each:

- connection test
- failure detection
- retry strategy

---

### 8. SSE Readiness Checklist

Before enabling SSE (`USE_SSE=true`), verify:

- Backstage can isolate events per track via `SseStreamRegistry`
- `SsePipelineController` replays past events from MongoDB
- heartbeat (15s) keeps connections alive through proxies
- `X-Accel-Buffering: no` and `Cache-Control: no-cache` headers are set
- event IDs are stable for replay (currently broken — uses random UUIDs)
- frontend `EventSource` deduplicates by `lastEventId`
- no global in-memory event bus
- event contract (`PipelineEventPayload` with `id` field) is stable

---

### 9. Observability Plan

Define minimum:

- logs per service
- correlation IDs across services
- error visibility
- how to trace a single event across system

---

### 10. Failure Scenarios

List critical failure cases:

- service not starting
- NATS unavailable
- MCP connection failure
- partial event flow break
- frontend cannot connect to SSE
- SSE reconnection loses events (replay ID instability)

For each:
- how to detect
- how to recover

---

### 11. Step-by-Step Execution Plan

Concrete steps to reach GREEN:

1. fix bootstrap script mismatch (`dx:env:template` → `dx:template`)
2. add Docker healthchecks for all app services in compose
3. add `USE_SSE=true` to Backstage `.env.template`
4. fix replay event ID stability in `sse-pipeline.controller.ts`
5. add Pulse `/health` API route
6. add chester and emily to `docker-compose.yml`
7. expand Shinoda health checks to include Pulse and itself
8. validate container startup (all green, no crash loops)
9. validate broker connectivity (NATS subscriptions active)
10. validate event flow (mock events → Backstage → SSE stream)
11. validate MCP connections (chester ↔ emily ↔ shinoda)
12. validate frontend boot (SSE connection, dedup, heartbeat)
13. run full system test
14. declare GREEN

---

### 12. Exit Criteria (STRICT)

Measurable criteria:

- all services return `status: ok` via `/health`
- Shinoda reports system healthy (including Pulse and agents)
- test event flows end-to-end: NATS → Backstage → SSE → frontend
- `USE_SSE=true` is active and functional
- SSE reconnection replays missed events correctly
- no runtime errors in logs
- system stable for 5 minutes under mock event load

---

## Constraints

- be concrete
- no vague suggestions
- no generic DevOps advice
- assume real distributed system behavior
- optimize for **detectability and reliability**

---

## Tone

- Staff+ reliability engineer
- Responsible for production readiness
- Direct and pragmatic

---

## Goal

Produce a plan that ensures:

> when we start testing SSE, **we are debugging SSE — not the environment**
