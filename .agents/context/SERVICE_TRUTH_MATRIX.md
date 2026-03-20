# Pulse Service Truth Matrix

## Scope

Current implementation truth captured from:

- `repos/packages/env-orchestration/docker-compose.yml`
- `repos/domain/*` services

This matrix is actively maintained during implementation and health validation.

---

## Runtime Topology (Compose)

## Infrastructure

Each microservice owns its infrastructure. The only shared component is NATS.

| Service | Owner | Port | Purpose |
| --- | --- | --- | --- |
| `nats` | Shared | 4222, 8222 | JetStream event plane + HTTP monitor |
| `authority-mongo` | Authority | 27017 | Auth users, sessions |
| `slim-shady-mongo` | Slim Shady | 27018 | User profiles |
| `stereo-mongo` | Stereo | 27019 | AI reasoning state |
| `backstage-mongo` | Backstage | 27020 | Pipeline projections |
| `petrified-redis` | Petrified | 6380 | Audio hashes, idempotency |
| `fort-minor-redis` | Fort Minor | 6381 | Idempotency |
| `soundgarden-minio` | Soundgarden | 9010/9011 | Uploads bucket |
| `mockingbird-minio` | Mockingbird | 9020/9021 | Transcoded bucket |
| `hybrid-storage-minio` | Hybrid Storage | 9030/9031 | HLS transcoded bucket |
| `petrified-minio` | Petrified | 9040/9041 | Fingerprints bucket |
| `fort-minor-minio` | Fort Minor | 9050/9051 | Transcripts bucket |

## Application Services

| Service | Port | Domain | Health |
| --- | --- | --- | --- |
| `authority` | 7000 | Identity | `/health` |
| `slim-shady` | 7400 | Identity | `/health` |
| `soundgarden` | 7100 | Streaming | `/health` |
| `petrified` | 7201 | AI | `/health` |
| `fort-minor` | 7202 | AI | `/health` |
| `stereo` | 7203 | AI | `/health` |
| `mockingbird` | 7200 | Streaming | `/health` |
| `hybrid-storage` | 7300 | Streaming | `/health` |
| `backstage` | 4001 | Realtime | `/health` |
| `pulse` | 3000 | Frontend | — |
| `shinoda` | 4111 | Agent | — |

---

## Service Matrix

| Service | Transport | Persistence | Emits | Consumes |
| --- | --- | --- | --- | --- |
| Authority | HTTP + NATS | Mongo (`authority-mongo`) | `authority.user.*`, `authority.token.refreshed` | `user.profile.created` |
| Slim Shady | HTTP + NATS | Mongo (`slim-shady-mongo`) | `user.profile.*` | `authority.user.signed_up` |
| Soundgarden | HTTP + NATS | local `/tmp/uploads` + MinIO (`soundgarden-minio`) | `track.upload.*`, `track.uploaded`, `track.upload.failed` | none |
| Petrified | NATS | Redis (`petrified-redis`), MinIO (`petrified-minio`) | `track.petrified.*`, `track.duplicate.detected` | `track.uploaded` |
| Fort Minor | NATS | Redis (`fort-minor-redis`), MinIO (`fort-minor-minio`) | `track.fort-minor.*` | `track.petrified.generated` |
| Stereo | NATS | Mongo (`stereo-mongo`) | `track.stereo.*`, `track.approved`, `track.rejected` | `track.petrified.generated`, `track.fort-minor.completed` |
| Mockingbird | NATS | MinIO (`mockingbird-minio`) | `track.transcoding.*`, `track.hls.generated` | `track.approved` |
| Hybrid Storage | NATS | MinIO (`hybrid-storage-minio`) | `track.hls.stored` | `track.hls.generated` |
| Backstage | HTTP + Socket.IO + NATS | Mongo (`backstage-mongo`) | websocket `pipeline.event` | `track.>` |
| Pulse (Next.js/BFF) | HTTP + Socket.IO client | Browser/Jotai | none | HTTP APIs + websocket stream |
| Shinoda (Agent) | HTTP | — | MCP signals (optional) | Backstage API + health endpoints |

---

## Boundary/Dependency Notes

- Identity boundary is clean: Authority owns auth, Slim Shady owns profile.
- AI cognition is split into three independent microservices: Petrified, Fort Minor, Stereo.
- Each micro owns its own Mongo/Redis/MinIO — no shared infrastructure except NATS.
- Backstage uses wildcard event consumption and must stay projection-only.
- Shinoda agent monitors all services via `/health` endpoints and can forward signals to external MCP servers.

---

## Health Monitoring

All 9 microservices expose `GET /health` returning `{ status: 'ok' }`.

The Shinoda agent runs a health pipeline workflow that checks all services in parallel and emits `SERVICE_UNHEALTHY` signals for any failures. These signals can optionally be forwarded to an external observability platform via MCP.

---

## Detected Contract Risks

1. Storage naming drift (`tracks` vs `uploads`) still requires cleanup across env/config surfaces.
2. Backstage mock subjects must stay clearly isolated from runtime subjects as the pipeline evolves.
