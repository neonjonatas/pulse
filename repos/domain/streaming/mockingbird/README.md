# 🐦 Mockingbird

> HLS transcoding microservice for the Pulse platform.

**Mockingbird** receives approved tracks, downloads them from MinIO, and uses FFmpeg to transcode the audio into HLS (HTTP Live Streaming) format with adaptive bitrate playlists. The transcoded packages are stored back in MinIO.

| | |
|---|---|
| **Package** | `@micro/mockingbird` |
| **Domain** | Streaming |
| **Port** | `7200` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/mockingbird/
├── domain/              # Entities, Ports
│   ├── entities/        # TranscodingJob
│   └── ports/           # StoragePort, TranscoderPort, MockingbirdEventBusPort
├── application/         # Use Cases
│   └── use-cases/       # TranscodeTrackUseCase
├── infra/               # Adapters
│   ├── minio/           # MinioStorageAdapter
│   ├── ffmpeg/          # FfmpegTranscoderAdapter
│   └── event-bus/       # NATS event bus provider
└── interface/           # Consumers, HTTP
    ├── consumers/       # TrackApprovedConsumer
    └── http/            # HealthController
```

---

## 📡 Transport

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Consumes** | `track.approved` | Triggers HLS transcoding |
| **Emits** | `track.transcoding.started` | Transcoding in progress |
| **Emits** | `track.transcoding.completed` | Transcoding finished |
| **Emits** | `track.hls.generated` | HLS package ready |
| **Emits** | `track.transcoding.failed` | Transcoding failed |

### Pipeline Position

```
Stereo (track.approved) → [Mockingbird] → Hybrid Storage
```

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| MinIO | `mockingbird-minio` | 9020 (API) / 9021 (Console) |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7200) |
| `NATS_URL` | NATS connection URL |
| `STORAGE_ENDPOINT` | MinIO API endpoint |
| `STORAGE_REGION` | S3-compatible region |
| `STORAGE_ACCESS_KEY` | MinIO access key |
| `STORAGE_SECRET_KEY` | MinIO secret key |
| `STORAGE_UPLOADS_BUCKET` | Source bucket (uploads) |
| `STORAGE_TRANSCODED_BUCKET` | Destination bucket (transcoded) |

---

## 🚀 Development

```bash
pnpm --filter @micro/mockingbird dev
```
