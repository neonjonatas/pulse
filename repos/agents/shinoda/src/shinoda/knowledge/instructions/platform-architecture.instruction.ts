export const platformArchitectureInstruction = `## Platform Architecture

Pulse is an event-driven music streaming platform composed of these microservices:

| Service | Port | Responsibility |
|---------|------|----------------|
| Authority | 7000 | Authentication, sessions, JWT tokens |
| Slim Shady | 7400 | User profiles, onboarding |
| Soundgarden | 7100 | Track upload, file validation, object storage |
| Shinod AI (Petrified) | 7200 | Acoustic fingerprinting via Chromaprint/fpcalc |
| Shinod AI (Fort Minor) | 7200 | Audio transcription via Whisper (AI SDK) |
| Shinod AI (Stereo) | 7200 | AI reasoning — approve or reject tracks |
| Mockingbird | 7201 | FFmpeg transcoding, HLS package generation |
| Hybrid Storage | 7300 | HLS persistence to MinIO |
| Backstage | 4001 | Pipeline event projection, WebSocket streaming |`
