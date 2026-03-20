# 🎧 Stereo

> AI reasoning and validation microservice for the Pulse platform.

**Stereo** is the decision-maker. It aggregates fingerprint signals from Petrified and transcription signals from Fort Minor, then runs GPT-based reasoning to approve or reject a track based on the platform's content policy (post-2000 music only).

| | |
|---|---|
| **Package** | `@micro/stereo` |
| **Domain** | AI |
| **Port** | `7203` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/stereo/
├── domain/              # Entities, Events
│   ├── entities/        # Stereo decision entity
│   └── events/          # Domain events
├── application/         # Use Cases
│   └── use-cases/       # RunStereoUseCase, AggregateFingerprintSignalUseCase,
│                        # AggregateTranscriptionSignalUseCase
├── infra/               # Adapters, Infrastructure Modules
│   ├── ai/              # AiSdkStereoAdapter (GPT reasoning)
│   ├── mongo/           # MongodbModule
│   └── nats/            # NatsModule
└── interface/           # Consumers, HTTP
    ├── consumers/       # PetrifiedGeneratedConsumer, TranscriptionCompletedConsumer
    └── http/            # HealthController
```

---

## 📡 Transport

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Consumes** | `track.petrified.generated` | Fingerprint signal from Petrified |
| **Consumes** | `track.fort-minor.completed` | Transcription signal from Fort Minor |
| **Emits** | `track.stereo.started` | Reasoning started (both signals received) |
| **Emits** | `track.approved` | Track approved by AI |
| **Emits** | `track.rejected` | Track rejected by AI |
| **Emits** | `track.stereo.failed` | Reasoning failed |

### Pipeline Position

```
Petrified ──┐
             ├──▶ [Stereo] ──▶ Mockingbird (if approved)
Fort Minor ─┘
```

Stereo waits for both signals before running the AI reasoning step.

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| MongoDB | `stereo-mongo` | 27019 |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7203) |
| `NATS_URL` | NATS connection URL |
| `NATS_QUEUE_GROUP` | Consumer queue group |
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB_NAME` | Database name |
| `OPENAI_API_KEY` | OpenAI API key |
| `AI_MODEL` | Reasoning model (gpt-4o-mini) |

---

## 🚀 Development

```bash
pnpm --filter @micro/stereo dev
```
