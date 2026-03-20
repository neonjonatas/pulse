# Event Schemas

This directory contains JSON Schema documents describing all NATS event subjects in the Pulse platform. Each schema file covers a bounded context and documents every event subject, its producer, consumers, and expected payload shape.

## Schema Files

| File | Domain | Events | Source Enum |
|------|--------|--------|-------------|
| `track-lifecycle.event.schema.json` | Streaming / AI | 24 subjects | `TrackEvent` |
| `identity-lifecycle.event.schema.json` | Identity | 7 subjects | `AuthorityEvent`, `UserEvent` |
| `agent-lifecycle.event.schema.json` | Agent | 9 subjects | `ChesterEvent`, `EmilyEvent` |
| `pipeline-observation.event.schema.json` | Realtime | 1 broadcast contract | `PipelineEventPayload` |

## How Events Map to the Envelope

Every domain event published to NATS follows the envelope structure defined in `.agents/context/EVENT_ARCHITECTURE.md` (section 3):

```json
{
  "event": "<NATS subject>",
  "version": 1,
  "producer": "<service-name>",
  "timestamp": "ISO 8601",
  "correlationId": "pipeline-uuid",
  "data": { }
}
```

The `event` field matches the NATS subject string exactly as defined in the `@pack/event-inventory` enums. The `data` field contains the event-specific payload documented in each schema file.

See `.agents/schemas/shared/metadata.schema.json` for the formal JSON Schema of this envelope.

## Event Flow

The full track processing pipeline flows through events in this order:

```
Upload (Soundgarden)
  → track.upload.received → track.upload.validated → track.upload.stored → track.uploaded

Fingerprint (Petrified)
  → track.petrified.generated | track.petrified.song.found | track.petrified.song.unknown
  | track.petrified.detected | track.petrified.failed | track.duplicate.detected

Transcription (Fort Minor)
  → track.fort-minor.started → track.fort-minor.completed | track.fort-minor.failed

AI Reasoning (Stereo)
  → track.stereo.started → track.approved | track.rejected | track.stereo.failed

Transcoding (Mockingbird)
  → track.transcoding.started → track.transcoding.completed | track.transcoding.failed

HLS Storage (Hybrid Storage)
  → track.hls.generated → track.hls.stored | track.hls.failed
```

Backstage subscribes to all track events and broadcasts them as `PipelineEventPayload` to connected frontend clients via SSE or Socket.IO.

## Naming Convention

All event subjects follow the dot-delimited, past-tense convention defined in `.agents/standards/EVENT_NAMING_STANDARD.md`:

```
<domain>.<entity>.<state>
```

The terminal segment is always past tense (e.g., `received`, `completed`, `failed`, `generated`, `stored`).

## Source of Truth

The canonical event subject definitions live in code at `repos/packages/event-inventory/src/domain/`. These schema files document the contracts for LLM consumption and should be updated whenever the inventory enums change.
