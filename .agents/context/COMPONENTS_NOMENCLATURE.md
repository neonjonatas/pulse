---
alwaysApply: true
---

# COMPONENTS NOMENCLATURE

This document defines the naming conventions and semantic structure used across the Pulse platform.

The goal is to ensure:

- Consistent naming across workspaces
- Clear domain boundaries
- Predictable folder structures
- A balance between business clarity and music-inspired references

Pulse is a Spotify-like music streaming platform built using a microservice architecture and agent-based AI cognition layer.

## Workspace Structure

The monorepo is organized into four primary workspaces.

```
apps/
agents/
packages/
domain/
```

Each workspace has different naming rules and philosophy.

---

## 1. Apps Workspace

```
apps/
 └── pulse/
```

**Naming Philosophy**

Applications use product-facing names, not internal references.

**Current Applications**

| App   | Description                                                      |
| ----- | ---------------------------------------------------------------- |
| pulse | Frontend Next.js project; Player UI for the streaming platform   |

---

## 2. Agents Workspace

```
agents/
 └── shinoda/
```

**Naming Philosophy**

Agents are named after musicians or musical figures, inspired by the Linkin Park ecosystem.

**Current Agents**

| Agent   | Description                                                                                     |
| ------- | ----------------------------------------------------------------------------------------------- |
| shinoda | AI operations agent responsible for health monitoring, pipeline diagnostics, and observability  |

---

## 3. Packages Workspace

```
packages/
 ├── kernel
 ├── event-inventory
 ├── env-orchestration
 ├── nats-broker-messaging
 ├── cache
 ├── patterns
 └── neon-tokens
```

**Naming Philosophy**

Packages are shared libraries and abstractions. They must not use musical references because they are infrastructure-level utilities used across multiple contexts.

**Current Packages**

| Package | Scope | Description |
| --- | --- | --- |
| `@pack/kernel` | All microservices, agents | DDD primitives: DomainEntity, ValueObject, EventBus, UseCase, AggregateRoot, EventMap. Framework-agnostic domain abstractions. |
| `@pack/event-inventory` | All microservices, agents | Centralised NATS event subject enums: AuthorityEvent, UserEvent, TrackEvent. |
| `@pack/env-orchestration` | All microservices | Environment variable helpers (requireStringEnv, etc.) and Docker Compose topology. |
| `@pack/nats-broker-messaging` | Microservices | NATS transport layer: NatsPublisher, NatsConsumer, NestJS integration, error hierarchy. |
| `@pack/cache` | Microservices | Redis cache abstraction: CachePort + RedisCacheAdapter. |
| `@pack/patterns` | Microservices (e.g. Authority) | Resilience patterns: CircuitBreaker, UniqueEntityId. |
| `@pack/neon-tokens` | Frontend (pulse app) | OKLCH-based neon design tokens for UI theming. |

---

## 4. Domain Workspace

```
domain/
```

This workspace contains the bounded contexts of the platform.

Two naming layers exist:

| Layer           | Naming Style          |
| --------------- | --------------------- |
| Bounded Context | Business terminology  |
| Microservice    | Music reference       |

### Bounded Contexts

```
domain/
 ├── identity/
 ├── ai/
 ├── streaming/
 └── realtime/
```

### Domain Folder Structure

```
domain/
 ├── identity/
 │   ├── authority
 │   └── slim-shady
 ├── ai/
 │   ├── petrified
 │   ├── fort-minor
 │   └── stereo
 ├── streaming/
 │   ├── soundgarden
 │   ├── mockingbird
 │   └── hybrid-storage
 └── realtime/
     └── backstage
```

### Microservices Overview

| Microservice | Path | Responsibility | Platform Role |
| --- | --- | --- | --- |
| Authority | domain/identity/authority | Authentication, signup, login, OAuth, token/session management | Identity and access control |
| Slim Shady | domain/identity/slim-shady | User profile CRUD, preferences, onboarding | User profile management |
| Soundgarden | domain/streaming/soundgarden | Accept uploads, validate files, store in MinIO, emit ingestion events | Pipeline entry point |
| Petrified | domain/ai/petrified | Audio fingerprinting, Chromaprint hash generation, duplicate detection | AI stage 1: fingerprint |
| Fort Minor | domain/ai/fort-minor | Whisper-based audio transcription | AI stage 2: transcription |
| Stereo | domain/ai/stereo | AI reasoning combining fingerprint + transcription, approve/reject | AI stage 3: decision |
| Mockingbird | domain/streaming/mockingbird | FFmpeg HLS transcoding, multi-bitrate output | Transcoding worker |
| Hybrid Storage | domain/streaming/hybrid-storage | HLS package persistence in MinIO | Storage sink |
| Backstage | domain/realtime/backstage | Pipeline event subscription, state projection, WebSocket broadcast | Observability service |

---

## Naming References (Easter Eggs)

Microservices and AI modules use music-inspired names. This section explains the references.

| Name | Reference | Why it fits |
| --- | --- | --- |
| **Mockingbird** | Eminem song; bird that mimics sounds | Transcoding mimics and transforms audio into different formats. The service "re-sings" the original in new formats. |
| **Slim Shady** | Eminem's alter ego | User profile service. References the artist's persona -- the identity behind the identity. |
| **Soundgarden** | Band name; literal: garden of sounds | A place where you can deposit audio files -- an ingestion garden for uploaded tracks. |
| **Petrified** | Fort Minor song | Audio fingerprinting module. Name references freezing audio identity for comparison ("petrified" = turned to stone). |
| **Fort Minor** | Mike Shinoda's side project | Audio transcription service. References the artist's solo work; transcription extracts the "voice" from audio. |
| **Stereo** | Fort Minor song | AI reasoning service. References dual-channel thinking: combining fingerprint and transcription to decide. |
| **Shinoda** | Mike Shinoda (Linkin Park) | AI operations agent. Beyond vocals, Shinoda orchestrates LP's production. The agent orchestrates reasoning and health monitoring across the platform. |
| **Backstage** | Concert backstage area | Pipeline observability. Like being backstage at a concert -- you see everything happening behind the scenes. |

---

## AI Architecture

The AI cognition pipeline is split into three independent microservices, each with its own infrastructure:

```
track.uploaded
      │
      ▼
Petrified (petrified-redis, petrified-minio)
      │
      ▼
track.petrified.generated
      │
      ├── Fort Minor (fort-minor-redis, fort-minor-minio)
      │
      └── Stereo (stereo-mongo)
              │
              ▼
      Fort Minor completes
              │
              ▼
      Stereo reasoning
              │
      ┌───────┴────────┐
      ▼                ▼
track.approved     track.rejected
      │
      ▼
Mockingbird (transcoding)
```

---

## Naming Philosophy Summary

| Workspace        | Naming Style            |
| ---------------- | ----------------------- |
| apps             | Product names           |
| agents           | Music artist references |
| packages         | Functional/descriptive names |
| domain contexts  | Business terminology    |
| microservices    | Music references        |

This separation ensures:

- Clarity for developers
- Expressive domain storytelling
- Consistent architecture
