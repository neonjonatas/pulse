# 🪨 Petrified

> Audio fingerprinting and duplicate detection microservice for the Pulse platform.

**Petrified** is the first AI stage in the track pipeline. It downloads the uploaded audio from MinIO, generates a Chromaprint fingerprint, checks for duplicates via Redis hashes, and emits fingerprint data for downstream services.

| | |
|---|---|
| **Package** | `@micro/petrified` |
| **Domain** | AI |
| **Port** | `7201` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/petrified/
├── domain/              # Ports
│   └── ports/           # AudioStoragePort
├── application/         # Use Cases, Ports
│   ├── use-cases/       # GenerateFingerprintUseCase
│   └── ports/           # AudioHashPort, IdempotencyPort, PetrifiedGeneratorPort
├── infra/               # Adapters, Infrastructure Modules
│   ├── chromaprint/     # ChromaprintAdapter (fingerprint generation)
│   ├── redis/           # RedisAudioHashAdapter, RedisIdempotencyAdapter
│   ├── minio/           # MinioAudioStorageAdapter
│   ├── nats/            # NatsModule
│   ├── redis-module/    # RedisModule + provider
│   └── storage-module/  # StorageModule + MinIO provider
└── interface/           # Consumers, HTTP
    ├── consumers/       # TrackUploadedConsumer
    └── http/            # HealthController
```

---

## 📡 Transport

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Consumes** | `track.uploaded` | Triggers fingerprint generation |
| **Emits** | `track.petrified.generated` | Fingerprint generated successfully |
| **Emits** | `track.petrified.song.unknown` | Audio could not be identified |
| **Emits** | `track.petrified.detected` | Existing fingerprint match found |
| **Emits** | `track.duplicate.detected` | Track is a confirmed duplicate |
| **Emits** | `track.petrified.failed` | Fingerprinting failed |

### Pipeline Position

```
Soundgarden (track.uploaded) → [Petrified] → Fort Minor + Stereo
```

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| Redis | `petrified-redis` | 6380 |
| MinIO | `petrified-minio` | 9040 (API) / 9041 (Console) |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7201) |
| `NATS_URL` | NATS connection URL |
| `NATS_QUEUE_GROUP` | Consumer queue group |
| `REDIS_URL` | Redis connection URL |
| `STORAGE_ENDPOINT` | MinIO API endpoint |
| `STORAGE_REGION` | S3-compatible region |
| `STORAGE_ACCESS_KEY` | MinIO access key |
| `STORAGE_SECRET_KEY` | MinIO secret key |

---

## 🚀 Development

```bash
pnpm --filter @micro/petrified dev
```
