# 🎸 Soundgarden

> Audio upload microservice for the Pulse platform.

**Soundgarden** receives track uploads via HTTP, validates file types and sizes, stores the raw audio in MinIO object storage, and triggers the processing pipeline through NATS.

| | |
|---|---|
| **Package** | `@micro/soundgarden` |
| **Domain** | Streaming |
| **Port** | `7100` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/soundgarden/
├── domain/              # Ports, Events
│   ├── ports/           # FileStoragePort, FileValidatorPort, ObjectStoragePort
│   └── events/          # TrackEventMap
├── application/         # Use Cases
│   └── use-cases/       # UploadTrackUseCase
├── infra/               # Adapters
│   ├── file-storage.adapter.ts     # Local filesystem staging
│   ├── file-validator.adapter.ts   # MIME type + size validation
│   ├── object-storage/             # MinioStorageAdapter
│   ├── upload-config.provider.ts   # Config injection
│   ├── cleanup/                    # UploadCleanupService (scheduled)
│   └── event-bus/                  # NATS event bus provider
└── interface/           # HTTP Controllers
    └── http/            # UploadController, HealthController
```

---

## 📡 Transport

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/tracks/upload` | Upload an audio file |
| `GET` | `/health` | Health check |

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Emits** | `track.uploaded` | Track validated and stored in MinIO |
| **Emits** | `track.upload.received` | Upload received |
| **Emits** | `track.upload.validated` | File passed validation |
| **Emits** | `track.upload.stored` | File persisted to object storage |
| **Emits** | `track.upload.failed` | Upload or validation failed |

Soundgarden is the **entry point** of the track processing pipeline.

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| MinIO | `soundgarden-minio` | 9010 (API) / 9011 (Console) |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7100) |
| `NATS_URL` | NATS connection URL |
| `UPLOAD_MAX_SIZE_BYTES` | Max upload size (default 50 MB) |
| `UPLOAD_STORAGE_PATH` | Local staging directory |
| `UPLOAD_STORAGE_BUCKET` | MinIO bucket name |
| `STORAGE_ENDPOINT` | MinIO API endpoint |
| `STORAGE_REGION` | S3-compatible region |
| `STORAGE_ACCESS_KEY` | MinIO access key |
| `STORAGE_SECRET_KEY` | MinIO secret key |

---

## 🚀 Development

```bash
pnpm --filter @micro/soundgarden dev
```
