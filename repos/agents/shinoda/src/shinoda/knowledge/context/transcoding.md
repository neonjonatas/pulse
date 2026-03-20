# Transcoding and HLS Storage

## Mockingbird — Audio Transcoding

### Purpose

Mockingbird consumes `track.approved` events and transcodes the source audio into HLS (HTTP Live Streaming) packages for playback.

### Process Flow

1. Consumes `track.approved` from NATS
2. Downloads the source audio from MinIO using `sourceStorage` references in the payload
3. Runs FFmpeg to transcode:
   - MP3 format at 128 kbps and 320 kbps bitrates
   - Generates HLS segments and master playlist
4. Uploads the HLS package to a staging volume
5. Emits `track.hls.generated` with the HLS package details

### track.hls.generated Payload Contract

```typescript
{
  trackId: string
  hlsPackage: {
    masterPlaylist: string
    segments: string[]
    bitrates: number[]
  }
  stagingPath: string
  occurredAt: string
}
```

The `masterPlaylist` field contains the path to the M3U8 master playlist. The `segments` array lists all generated HLS segment files.

### Infrastructure

- **FFmpeg**: System binary for audio transcoding (must be installed in container)
- **MinIO**: Source audio retrieval
- **Staging volume**: Shared Docker volume (`hls_staging`) for intermediate HLS files
- **NATS**: Event consumption and emission

### Failure Modes

- Source audio not found in MinIO → transcoding fails silently or emits failure event
- FFmpeg crashes or times out → HLS package incomplete
- Staging volume not accessible → write failure

## Hybrid Storage — HLS Persistence

### Purpose

Hybrid Storage consumes `track.hls.generated` events and persists the complete HLS package from the staging volume into permanent MinIO storage.

### Process Flow

1. Consumes `track.hls.generated` from NATS
2. Reads HLS package from the staging volume
3. Uploads master playlist and all segments to MinIO permanent storage
4. Emits `track.hls.stored` confirming successful persistence

### Infrastructure

- **MinIO**: Permanent object storage for HLS packages
- **Staging volume**: Shared Docker volume (`hls_staging`) — same volume mounted by Mockingbird
- **NATS**: Event consumption and emission

### Ports

- `StoragePort`: Interface for object storage operations
- `HybridStorageEventBusPort`: Interface for publishing NATS events
