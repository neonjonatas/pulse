export const eventPipelineInstruction = `## Event Pipeline

The complete track lifecycle flows through these NATS event subjects:

\`\`\`
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
\`\`\`

### Fan-Out Semantics

Fort Minor and Stereo both consume \`track.petrified.generated\` with distinct NATS queue groups:
- Fort Minor: \`{NATS_QUEUE_GROUP}-fort-minor-petrified\`
- Stereo: \`{NATS_QUEUE_GROUP}-stereo-petrified\`

This ensures both modules receive each event (fan-out) rather than competing for the same message.

### Stereo Aggregation

Stereo waits for both signals before running AI reasoning:
1. Receives \`track.petrified.generated\` — stores fingerprint data in MongoDB track_processing_states
2. Receives \`track.fort-minor.completed\` — stores transcription data
3. When both are present, runs GPT-4o-mini reasoning to approve or reject the track`
