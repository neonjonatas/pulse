# 💾 Hybrid Storage

> HLS persistence microservice for the Pulse platform.

**Hybrid Storage** is the final stage of the track pipeline. It receives HLS packages from Mockingbird and persists them to MinIO object storage, making them available for streaming by the frontend player.

| | |
|---|---|
| **Package** | `@micro/hybrid-storage` |
| **Domain** | Streaming |
| **Port** | `7300` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/hybrid-storage/
├── domain/              # Entities, Ports
│   ├── entities/        # HLSPackage
│   └── ports/           # StoragePort, HybridStorageEventBusPort
├── application/         # Use Cases
│   └── use-cases/       # PersistHLSPackageUseCase
├── infra/               # Adapters
│   ├── minio/           # MinioStorageAdapter
│   ├── mock/            # MockHLSGeneratorService (dev)
│   └── event-bus/       # NATS event bus provider
└── interface/           # Consumers, HTTP
    ├── consumers/       # HLSGeneratedConsumer
    └── http/            # HealthController
```

---

## 📡 Transport

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Consumes** | `track.hls.generated` | HLS package ready for persistence |
| **Emits** | `track.hls.stored` | HLS package persisted successfully |
| **Emits** | `track.hls.failed` | Persistence failed |

### Pipeline Position

```
Mockingbird (track.hls.generated) → [Hybrid Storage] ── pipeline complete ✓
```

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| MinIO | `hybrid-storage-minio` | 9030 (API) / 9031 (Console) |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7300) |
| `NATS_URL` | NATS connection URL |
| `STORAGE_ENDPOINT` | MinIO API endpoint |
| `STORAGE_REGION` | S3-compatible region |
| `STORAGE_ACCESS_KEY` | MinIO access key |
| `STORAGE_SECRET_KEY` | MinIO secret key |
| `STORAGE_TRANSCODED_BUCKET` | Source/destination bucket |

---

## 🚀 Development

```bash
pnpm --filter @micro/hybrid-storage dev
```
