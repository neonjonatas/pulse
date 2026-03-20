# Track Processing Pipeline

## End-to-End Flow

The complete track lifecycle flows through these stages:

```
Soundgarden (upload)
  │
  ▼
track.uploaded
  │
  ▼
Petrified (fingerprint)
  │
  ▼
track.petrified.generated
  │
  ├──────────────────────────┐
  │                          │
  ▼                          ▼
Fort Minor (transcription)   Stereo (aggregate fingerprint)
  │                          │
  ▼                          │
track.fort-minor.completed   │
  │                          │
  └──────────────────────────┘
  │
  ▼
Stereo (AI reasoning)
  │
  ▼
track.approved | track.rejected
  │
  ▼
Mockingbird (transcoding)
  │
  ▼
track.hls.generated
  │
  ▼
Hybrid Storage (persistence)
  │
  ▼
track.hls.stored
```

## Expected Event Sequence (Happy Path)

1. `track.uploaded` — Soundgarden accepts and stores the audio file
2. `track.petrified.generated` — Petrified creates acoustic fingerprint
3. `track.fort-minor.started` — Fort Minor begins transcription (parallel with Stereo fingerprint aggregation)
4. `track.fort-minor.completed` — Transcription finished
5. `track.stereo.started` — Stereo has both signals, begins AI reasoning
6. `track.approved` — Track passes AI review
7. `track.hls.generated` — Mockingbird completes FFmpeg transcoding
8. `track.hls.stored` — Hybrid Storage persists HLS package to MinIO

## Fan-Out at track.petrified.generated

Both Fort Minor and Stereo consume `track.petrified.generated` simultaneously using distinct NATS queue groups:
- Fort Minor: `{NATS_QUEUE_GROUP}-fort-minor-petrified`
- Stereo: `{NATS_QUEUE_GROUP}-stereo-petrified`

This is fan-out semantics — both modules receive every event, rather than competing for the same message.

## Stereo Aggregation Pattern

Stereo uses a dual-signal aggregation pattern stored in MongoDB `track_processing_states`:
1. Receives `track.petrified.generated` — stores fingerprint data
2. Receives `track.fort-minor.completed` — stores transcription data
3. When both signals are present for the same trackId, triggers AI reasoning

The order of arrival does not matter. Stereo checks for completeness on each event.

## Terminal States

A track can reach these terminal states:
- `track.approved` → continues to Mockingbird
- `track.rejected` → pipeline stops, observable in Backstage
- `track.duplicate.detected` → pipeline stops, duplicate identified
- Any `*.failed` event → pipeline stops at that stage

## Event Inventory

| Event | Producer | Consumer(s) | Terminal? |
|-------|----------|-------------|-----------|
| track.uploaded | Soundgarden | Petrified | No |
| track.petrified.generated | Petrified | Fort Minor, Stereo | No |
| track.petrified.song.unknown | Petrified | Backstage | No |
| track.petrified.failed | Petrified | Backstage | Yes |
| track.duplicate.detected | Petrified | Backstage | Yes |
| track.fort-minor.started | Fort Minor | Backstage | No |
| track.fort-minor.completed | Fort Minor | Stereo | No |
| track.fort-minor.failed | Fort Minor | Backstage | Yes |
| track.stereo.started | Stereo | Backstage | No |
| track.approved | Stereo | Mockingbird | No |
| track.rejected | Stereo | Backstage | Yes |
| track.stereo.failed | Stereo | Backstage | Yes |
| track.hls.generated | Mockingbird | Hybrid Storage | No |
| track.hls.stored | Hybrid Storage | Backstage | Yes (success) |

## Backstage Projection

Backstage subscribes to `track.>` (wildcard) and projects all pipeline events into MongoDB. It provides:
- HTTP API: GET /pipelines, /pipelines/active, /pipelines/failed, /pipelines/:trackId
- Socket.IO: /pipeline namespace emitting `pipeline.event` for real-time observation
