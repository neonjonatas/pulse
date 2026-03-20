# Fingerprinting (Petrified Module)

## Technology

- **Chromaprint/fpcalc**: Generates acoustic fingerprints from audio files. Requires `chromaprint` and `ffmpeg` system packages.
- **SHA256 Audio Hashing**: Computes a hash of the raw audio data for duplicate detection.
- **Redis**: Caches audio hashes for fast duplicate lookup.
- **MinIO**: Stores source audio files and fingerprint artifacts.

## Process Flow

1. Petrified consumes `track.uploaded` from NATS
2. Downloads the audio file from MinIO using storage references in the event payload
3. Runs `fpcalc` to generate the acoustic fingerprint
4. Computes SHA256 hash of the audio data
5. Checks Redis for existing audio hash (duplicate detection)
6. If duplicate found: emits `track.duplicate.detected` and stops
7. If no duplicate: stores fingerprint artifact, caches audio hash in Redis
8. Emits `track.petrified.generated` with fingerprint data and storage references

## Duplicate Detection

Audio hashes are stored in Redis with the key pattern based on the SHA256 hash. When a new track's hash matches an existing entry, the pipeline emits `track.duplicate.detected` with both the new and existing track IDs.

## track.petrified.generated Payload Contract

```typescript
{
  trackId: string
  fingerprint: {
    hash: string
    duration: number
  }
  sourceStorage: {
    bucket: string
    key: string
  }
  petrifiedStorage: {
    bucket: string
    key: string
  }
  fortMinorStorage: {
    bucket: string
    key: string
  }
  storage: {
    bucket: string
    key: string
  }
  occurredAt: string
}
```

The payload includes storage references for downstream consumers:
- `sourceStorage`: Original uploaded file location
- `petrifiedStorage`: Fingerprint artifact location
- `fortMinorStorage`: Storage reference for Fort Minor to access the audio

## Failure Modes

- `fpcalc` binary not available or crashes → `track.petrified.failed`
- Audio file not found in MinIO → `track.petrified.failed`
- Redis connection failure → `track.petrified.failed`
- Idempotency check detects already-processed trackId → event skipped silently

## Ports

- `PetrifiedGeneratorPort`: Interface for fingerprint generation
- `AudioHashPort`: Interface for audio hash computation and duplicate check
- `IdempotencyPort`: Interface for ensuring at-most-once processing
- `PetrifiedEventBusPort`: Interface for publishing NATS events
