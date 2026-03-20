# AI Reasoning (Stereo Module)

## Purpose

Stereo is the decision-making module that aggregates both the acoustic fingerprint and transcription results, then runs AI reasoning via GPT-4o-mini to approve or reject tracks.

## Dual-Signal Aggregation

Stereo uses a state machine pattern backed by MongoDB `track_processing_states` collection:

1. **Receives `track.petrified.generated`**: Stores fingerprint data for the trackId
2. **Receives `track.fort-minor.completed`**: Stores transcription data for the trackId
3. **Completeness check**: After each event, checks if both fingerprint AND transcription are present
4. **When both signals arrive**: Triggers the AI reasoning pipeline

The arrival order does not matter. The aggregation is idempotent — processing the same event twice does not cause duplicate reasoning.

## AI Reasoning Pipeline

When both signals are ready:

1. Emits `track.stereo.started`
2. Constructs a prompt with:
   - Fingerprint analysis results
   - Transcription text
   - Track metadata
3. Sends to GPT-4o-mini for evaluation
4. GPT analyzes content quality, originality, and appropriateness
5. Returns approve or reject decision with reasoning

## Decision Outcomes

- **Approved**: Emits `track.approved` — track proceeds to Mockingbird for transcoding
- **Rejected**: Emits `track.rejected` — pipeline terminates, reason logged

## track.approved Payload Contract

```typescript
{
  trackId: string
  sourceStorage: {
    bucket: string
    objectKey: string
  }
  reasoning: {
    decision: 'approved'
    confidence: number
    summary: string
  }
  occurredAt: string
}
```

The `sourceStorage` field is critical — Mockingbird uses it to locate the audio file for transcoding. The `objectKey` field contains the MinIO object key.

## track.rejected Payload

```typescript
{
  trackId: string
  reasoning: {
    decision: 'rejected'
    confidence: number
    summary: string
    reasons: string[]
  }
  occurredAt: string
}
```

## Failure Modes

- GPT-4o-mini API timeout → `track.stereo.failed`
- MongoDB track state not found (data corruption) → `track.stereo.failed`
- One signal never arrives (stuck pipeline) → track remains in `processing` state indefinitely
- Idempotency check fails → `track.stereo.failed`

## Infrastructure

- **MongoDB**: `track_processing_states` collection stores the aggregation state
- **NATS**: Consumes from two subjects with distinct queue groups
- **AI SDK**: GPT-4o-mini for reasoning (configurable model)

## Ports

- `StereoPort`: Interface for AI reasoning execution
- `TrackStatePort`: Interface for dual-signal state management
- `IdempotencyPort`: Interface for at-most-once processing
- `StereoEventBusPort`: Interface for publishing NATS events
