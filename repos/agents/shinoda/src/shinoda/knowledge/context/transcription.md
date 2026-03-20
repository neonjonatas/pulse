# Transcription (Fort Minor Module)

## Technology

- **Vercel AI SDK** (`ai` package): Provides the transcription interface
- **OpenAI Whisper**: Speech-to-text model accessed through the AI SDK
- **Redis**: Idempotency tracking to prevent duplicate transcription work

## Process Flow

1. Fort Minor consumes `track.petrified.generated` via NATS (queue group: `{NATS_QUEUE_GROUP}-fort-minor-petrified`)
2. Emits `track.fort-minor.started` to signal transcription has begun
3. Downloads the audio file from MinIO using storage references from the event payload
4. Sends audio to OpenAI Whisper via the Vercel AI SDK for transcription
5. On success: emits `track.fort-minor.completed` with transcription output
6. On failure: emits `track.fort-minor.failed` with error details

## Idempotency

Fort Minor uses Redis-backed idempotency to ensure each trackId is transcribed at most once. If a duplicate `track.petrified.generated` event arrives for the same trackId, it is skipped.

## track.fort-minor.completed Payload Contract

```typescript
{
  trackId: string
  transcription: {
    text: string
    language: string
    duration: number
  }
  storage: {
    bucket: string
    key: string
  }
  occurredAt: string
}
```

The transcription text is the raw output from Whisper. The `storage` field references where the transcription artifact is persisted.

## Failure Modes

- Whisper API timeout → `track.fort-minor.failed`
- Audio file not found in MinIO → `track.fort-minor.failed`
- Whisper returns empty or invalid response → `track.fort-minor.failed`
- Redis idempotency check fails → `track.fort-minor.failed`

## Timeout Handling

Transcription has a configurable timeout (default varies by audio duration). If Whisper does not respond within the timeout window, the transcription is marked as failed and `track.fort-minor.failed` is emitted.

## Ports

- `TranscriberPort`: Interface for audio-to-text transcription
- `IdempotencyPort`: Interface for at-most-once processing
- `FortMinorEventBusPort`: Interface for publishing NATS events
