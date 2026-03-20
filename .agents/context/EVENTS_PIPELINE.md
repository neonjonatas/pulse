# Pulse Event Pipeline Context

## Goal

Define the canonical event-driven workflow used by Pulse microservices, including:

- NATS subjects
- producer/consumer ownership
- payload contract expectations
- known pipeline breaks and migration targets

This file is the source-of-truth for re-alignment planning across microservices.

---

## Event Naming Pattern

## Current Rule

- lowercase dot-delimited subjects
- pipeline events mostly follow `track.<stage>.<state>`
- identity events follow `authority.user.*` and `user.profile.*`
- all subjects are defined as enums in `@pack/event-inventory`

## Known Inconsistencies

- underscore tokens in identity subjects:
  - `authority.user.signed_up`
  - `authority.user.logged_in`
- hyphenated stage names:
  - `track.fort-minor.completed`
- mock-only subjects in Backstage not produced in runtime flow

## Payload Minimums (Required)

Every workflow event should include:

- aggregate identifier (`trackId`, `userId`, `profileId`)
- timestamp (`occurredAt` or stage-specific `*At`)
- artifact reference whenever downstream stages need file/object access

---

## Identity Event Pipeline

### Signup/Profile Link Flow

1. Authority emits `authority.user.signed_up`
2. Slim Shady consumes and creates profile
3. Slim Shady emits `user.profile.created`
4. Authority consumes and persists `profileId`

### Subjects

| Subject | Producer | Consumers | Notes |
| --- | --- | --- | --- |
| `authority.user.signed_up` | Authority | Slim Shady | auth identity created |
| `user.profile.created` | Slim Shady | Authority | profile linkage feedback |
| `authority.user.logged_in` | Authority | observability only | session created |
| `authority.token.refreshed` | Authority | observability only | token lifecycle |
| `authority.user.logged_out` | Authority | observability only | session closed |

---

## Streaming + AI Event Pipeline

### End-to-End Sequence

1. Soundgarden emits upload lifecycle events
2. `track.uploaded` starts AI flow in Petrified
3. Petrified emits fingerprint/hash event
4. Fort Minor transcribes and emits completion
5. Stereo waits for both signals, emits approved/rejected
6. Approved tracks move to Mockingbird transcoding
7. HLS persistence completes the pipeline

### Subjects by Stage

| Stage | Subject | Producer | Consumers |
| --- | --- | --- | --- |
| Upload | `track.upload.received` | Soundgarden | Backstage |
| Upload | `track.upload.validated` | Soundgarden | Backstage |
| Upload | `track.upload.stored` | Soundgarden | Backstage |
| Upload | `track.uploaded` | Soundgarden | Petrified, Backstage |
| Upload | `track.upload.failed` | Soundgarden | Backstage |
| Fingerprint | `track.petrified.generated` | Petrified | Fort Minor, Stereo, Backstage |
| Fingerprint | `track.petrified.song.unknown` | Petrified | Backstage |
| Duplicate | `track.duplicate.detected` | Petrified | Backstage |
| Fingerprint | `track.petrified.failed` | Petrified | Backstage |
| Transcription | `track.fort-minor.started` | Fort Minor | Backstage |
| Transcription | `track.fort-minor.completed` | Fort Minor | Stereo, Backstage |
| Transcription | `track.fort-minor.failed` | Fort Minor | Backstage |
| Reasoning | `track.stereo.started` | Stereo | Backstage |
| Reasoning | `track.approved` | Stereo | Mockingbird, Backstage |
| Reasoning | `track.rejected` | Stereo | Backstage |
| Reasoning | `track.stereo.failed` | Stereo | Backstage |
| Transcode | `track.transcoding.started` | Mockingbird | Backstage |
| Transcode | `track.transcoding.completed` | Mockingbird | Backstage |
| Transcode | `track.transcoding.failed` | Mockingbird | Backstage |
| HLS | `track.hls.generated` | Mockingbird | Hybrid Storage, Backstage |
| HLS | `track.hls.stored` | Hybrid Storage | Backstage |

---

## Pipeline Flow Diagram

```
Soundgarden (track.uploaded)
    │
    ▼
Petrified (track.petrified.generated)
    │
    ├──▶ Fort Minor (track.fort-minor.completed)
    │
    └──▶ Stereo (waits for both signals)
              │
         ┌────┴────┐
         ▼         ▼
    track.approved  track.rejected
         │
         ▼
    Mockingbird (track.hls.generated)
         │
         ▼
    Hybrid Storage (track.hls.stored) ── pipeline complete ✓
```

Backstage subscribes to `track.>` and observes the entire pipeline.

---

## Storage Artifact Contract (Current/Target)

| Stage | Artifact | Current State | Target Contract |
| --- | --- | --- | --- |
| Soundgarden upload | original audio object | `soundgarden-minio:uploads` | canonical upload bucket + key schema |
| Petrified output | fingerprint/audio hash + refs | `petrified-minio:fingerprints` | explicit normalized storage refs |
| Fort Minor output | transcription data | `fort-minor-minio:transcripts` | transcription + segment refs |
| Mockingbird output | HLS segments + playlists | `mockingbird-minio:transcoded` | variant keys must equal durable object keys |
| Hybrid Storage | HLS package persistence | `hybrid-storage-minio:transcoded` | producer emits `track.hls.generated` with complete package contract |

---

## Realtime Observation Flow

Backstage consumes `track.>` and projects events to:

- Mongo pipeline read-model
- Socket.IO `pipeline.event`

Backstage is an observer/projection service and should not become workflow owner.

---

## Agent Health Monitoring

Shinoda agent monitors all services via `GET /health` and provides:

- **Health Pipeline**: parallel health checks → `SERVICE_UNHEALTHY` signals
- **Debug Pipeline**: diagnose stuck tracks → `DIAGNOSIS_READY` signals
- Optional MCP forwarding to external observability sinks

---

## Alignment Checklist (for micro-plans)

- [ ] Subject naming follows repository pattern
- [ ] Producer/consumer links are complete
- [ ] Payload includes aggregate key + timestamp + required artifact refs
- [ ] Stage outputs are consumable by next stage without implicit assumptions
- [ ] Mock-only subjects are clearly separated from runtime subjects
