# AI Bounded Context (Shinod AI)

## Overview

Shinod AI is the AI cognition microservice within the Pulse music streaming platform. It is a single deployable NestJS service containing three internal modules that handle acoustic fingerprinting, transcription, and AI-based track approval.

Shinod AI does NOT transcode audio, persist HLS, serve playback, or own user profiles. Those responsibilities belong to Mockingbird, Hybrid Storage, and other services.

## Modules

### Petrified — Acoustic Fingerprinting

Generates acoustic fingerprints for uploaded tracks using Chromaprint/fpcalc.

Ports: PetrifiedGeneratorPort, AudioHashPort, IdempotencyPort, PetrifiedEventBusPort

Adapters: ChromaprintAdapter, RedisAudioHashAdapter, RedisIdempotencyAdapter

Consumes: `track.uploaded`

Emits:
- `track.petrified.generated` — fingerprint successfully created
- `track.petrified.song.unknown` — fingerprint generated but no match found in database
- `track.duplicate.detected` — audio hash matches an existing track
- `track.petrified.failed` — fingerprinting failed

### Fort Minor — Audio Transcription

Transcribes audio content to text using OpenAI Whisper via the Vercel AI SDK.

Ports: TranscriberPort, IdempotencyPort, FortMinorEventBusPort

Adapters: AiSdkTranscriberAdapter, RedisIdempotencyAdapter

Consumes: `track.petrified.generated` (queue: `{NATS_QUEUE_GROUP}-fort-minor-petrified`)

Emits:
- `track.fort-minor.started` — transcription begun
- `track.fort-minor.completed` — transcription finished with output
- `track.fort-minor.failed` — transcription failed

### Stereo — AI Reasoning

Aggregates fingerprint and transcription signals, then runs AI reasoning to approve or reject tracks.

Ports: StereoPort, TrackStatePort, IdempotencyPort, StereoEventBusPort

Adapters: AiSdkStereoAdapter, MongoTrackStateAdapter, MongoIdempotencyAdapter

Consumes:
- `track.petrified.generated` (queue: `{NATS_QUEUE_GROUP}-stereo-petrified`)
- `track.fort-minor.completed`

Emits:
- `track.stereo.started` — reasoning begun
- `track.approved` — track approved for transcoding (includes `sourceStorage` for Mockingbird)
- `track.rejected` — track rejected
- `track.stereo.failed` — reasoning failed

## Infrastructure Dependencies

- **MongoDB**: Track processing state (dual-signal aggregation in `track_processing_states`), idempotency records
- **Redis**: Audio hash cache for duplicate detection, idempotency for Fort Minor
- **MinIO**: Audio file storage (source files, fingerprint artifacts)
- **NATS**: Event-driven communication between all stages

## Architecture

- Clean Architecture with Ports and Adapters
- Each module has: `domain/`, `application/`, `infra/`, `interface/` layers
- Shared core module provides MongoDB, MinIO, NATS, and Redis connections
- All inter-module communication goes through NATS events (no direct imports between modules)

## Known Hazards

1. **Shared deployable boundary**: All three modules ship in one service. Operational independence is limited until the planned microservice split.
2. **Storage contract drift**: Upload/storage refs can drift due to mixed bucket conventions (`tracks` vs `uploads`). This can cause downstream artifact lookup failures.

## Contract Minimums

Every AI stage handoff event must include:
- `trackId`
- Timestamp (`occurredAt` or `*At`)
- Prior-stage artifact references needed by next stage
- Deterministic contract fields (avoid optional critical fields)
