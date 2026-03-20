# 🎤 Fort Minor

> AI transcription microservice for the Pulse platform.

**Fort Minor** receives fingerprinted audio, downloads it from MinIO, and produces a Whisper-based transcription. The transcription is published for Stereo to combine with the fingerprint for final AI reasoning.

| | |
|---|---|
| **Package** | `@micro/fort-minor` |
| **Domain** | AI |
| **Port** | `7202` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/fort-minor/
├── domain/              # Ports
│   └── ports/           # AudioStoragePort
├── application/         # Use Cases
│   └── use-cases/       # TranscribeTrackUseCase
├── infra/               # Adapters, Infrastructure Modules
│   ├── ai/              # AiSdkTranscriberAdapter (Whisper)
│   ├── redis/           # RedisIdempotencyAdapter
│   ├── minio/           # MinioAudioStorageAdapter
│   ├── nats/            # NatsModule
│   ├── redis-module/    # RedisModule + provider
│   └── storage-module/  # StorageModule + MinIO provider
└── interface/           # Consumers, HTTP
    ├── consumers/       # PetrifiedGeneratedConsumer
    └── http/            # HealthController
```

---

## 📡 Transport

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Consumes** | `track.petrified.generated` | Triggers transcription after fingerprinting |
| **Emits** | `track.fort-minor.started` | Transcription started |
| **Emits** | `track.fort-minor.completed` | Transcription completed |
| **Emits** | `track.fort-minor.failed` | Transcription failed |

### Pipeline Position

```
Petrified (track.petrified.generated) → [Fort Minor] → Stereo
```

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| Redis | `fort-minor-redis` | 6381 |
| MinIO | `fort-minor-minio` | 9050 (API) / 9051 (Console) |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7202) |
| `NATS_URL` | NATS connection URL |
| `NATS_QUEUE_GROUP` | Consumer queue group |
| `REDIS_URL` | Redis connection URL |
| `STORAGE_ENDPOINT` | MinIO API endpoint |
| `STORAGE_REGION` | S3-compatible region |
| `STORAGE_ACCESS_KEY` | MinIO access key |
| `STORAGE_SECRET_KEY` | MinIO secret key |
| `OPENAI_API_KEY` | OpenAI API key (Whisper) |
| `AI_MODEL` | Transcription model (whisper-1) |

---

## 🚀 Development

```bash
pnpm --filter @micro/fort-minor dev
```
