# 🌐 @pack/env-orchestration

> Environment variable helpers and Docker Compose orchestration for the Pulse platform.

`@pack/env-orchestration` serves two purposes:

1. **Runtime helpers** -- typed functions for reading required/optional env vars with validation
2. **Docker Compose topology** -- the single `docker-compose.yml` that defines all infrastructure and application services

---

## 📦 Exports

### Environment Helpers

| Function | Signature | Behaviour |
|----------|-----------|-----------|
| `requireStringEnv` | `(name: string) => string` | Throws if the variable is missing or empty |
| `requireNumberEnv` | `(name: string) => number` | Throws if missing or not a finite number |
| `optionalStringEnv` | `(name: string, defaultValue: string) => string` | Returns default when unset |
| `optionalNumberEnv` | `(name: string, defaultValue: number) => number` | Returns default when unset |

### Usage

```typescript
import { requireStringEnv, optionalNumberEnv } from '@pack/env-orchestration'

const mongoUri = requireStringEnv('MONGO_URI')
const port = optionalNumberEnv('PORT', 3000)
```

---

## 🐳 Docker Compose Topology

The `docker-compose.yml` in this package orchestrates the entire Pulse platform for local development.

### Infrastructure Services

| Service | Ports | Purpose |
|---------|-------|---------|
| `nats` | 4222, 8222 | JetStream message broker + HTTP monitor |
| `authority-mongo` | 27017 | Authority MongoDB |
| `slim-shady-mongo` | 27018 | Slim Shady MongoDB |
| `stereo-mongo` | 27019 | Stereo MongoDB |
| `backstage-mongo` | 27020 | Backstage MongoDB |
| `petrified-redis` | 6380 | Petrified Redis (hashes + idempotency) |
| `fort-minor-redis` | 6381 | Fort Minor Redis (idempotency) |
| `soundgarden-minio` | 9010 / 9011 | Uploads bucket (API / Console) |
| `mockingbird-minio` | 9020 / 9021 | Transcoded bucket |
| `hybrid-storage-minio` | 9030 / 9031 | HLS transcoded bucket |
| `petrified-minio` | 9040 / 9041 | Fingerprints bucket |
| `fort-minor-minio` | 9050 / 9051 | Transcripts bucket |

### Application Services

| Service | Port | Dependencies |
|---------|------|--------------|
| `authority` | 7000 | authority-mongo, nats |
| `slim-shady` | 7400 | slim-shady-mongo, nats |
| `soundgarden` | 7100 | nats, soundgarden-minio |
| `backstage` | 4001 | backstage-mongo, nats |
| `petrified` | 7201 | nats, petrified-redis, petrified-minio |
| `fort-minor` | 7202 | nats, fort-minor-redis, fort-minor-minio |
| `stereo` | 7203 | nats, stereo-mongo |
| `mockingbird` | 7200 | nats, mockingbird-minio |
| `hybrid-storage` | 7300 | nats, hybrid-storage-minio |
| `pulse` | 3000 | authority |
| `shinoda` | 4111 | backstage |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                      NATS :4222                     │
│                  (shared event plane)               │
├──────────┬──────────┬──────────┬────────────────────┤
│ Identity │ Streaming│   AI     │ Realtime           │
│──────────│──────────│──────────│────────────────────│
│ Authority│Soundgarden│Petrified │ Backstage          │
│ Slim     │Mockingbird│Fort Minor│                    │
│ Shady    │Hybrid Stg │Stereo   │                    │
├──────────┴──────────┴──────────┴────────────────────┤
│           Per-micro Mongo / Redis / MinIO           │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Project Structure

```
├── docker-compose.yml        # Full platform topology
├── .env.template             # MinIO root credentials
├── lib/
│   ├── required-string.compute.ts
│   ├── required-number.compute.ts
│   ├── optional-string.compute.ts
│   └── optional-number.compute.ts
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

---

## 📋 Dependencies

| Dependency | Version |
|------------|---------|
| `typescript` | ^5 |
| `@types/node` | ^20 |

Zero runtime dependencies.
