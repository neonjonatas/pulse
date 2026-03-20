# 🎭 Backstage

> Pipeline observability and real-time broadcast microservice for the Pulse platform.

**Backstage** is the control room. It subscribes to all track pipeline events via NATS wildcard (`track.>`), records pipeline state in MongoDB, and broadcasts updates to the frontend in real time through WebSocket (Socket.IO).

| | |
|---|---|
| **Package** | `@micro/backstage` |
| **Domain** | Realtime |
| **Port** | `4001` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/backstage/
├── domain/              # Entities
│   └── entities/        # TrackPipeline
├── application/         # Use Cases
│   └── use-cases/       # RecordPipelineEvent, BroadcastPipelineEvent,
│                        # GetTrackPipeline, ListActivePipelines,
│                        # ListAllPipelines, ListFailedPipelines
├── infra/               # Adapters
│   ├── mongo/           # MongoPipelineAdapter
│   ├── socket/          # SocketIOEventStreamAdapter
│   ├── mock/            # MockEventGeneratorService (dev mode)
│   └── event-bus/       # NATS event bus provider
└── interface/           # HTTP, WebSocket, Consumers
    ├── http/            # PipelinesController, HealthController
    ├── gateway/         # PipelineGateway (Socket.IO namespace /pipeline)
    └── consumers/       # PipelineEventConsumer (track.> wildcard)
```

---

## 📡 Transport

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/pipelines` | List all pipelines |
| `GET` | `/pipelines/active` | List active pipelines |
| `GET` | `/pipelines/failed` | List failed pipelines |
| `GET` | `/pipelines/:trackId` | Get pipeline by track ID |
| `GET` | `/health` | Health check |

### WebSocket (Socket.IO)

| Namespace | Event | Description |
|-----------|-------|-------------|
| `/pipeline` | `pipeline:event` | Real-time pipeline event broadcast |

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Consumes** | `track.>` | All track events (wildcard subscription) |

Backstage does not emit NATS events -- it is a pure observer and broadcaster.

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| MongoDB | `backstage-mongo` | 27020 |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (4001) |
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB_NAME` | Database name |
| `NATS_URL` | NATS connection URL |
| `MOCK_MODE` | Enable mock event generator (dev only) |

---

## 🚀 Development

```bash
pnpm --filter @micro/backstage dev
```
