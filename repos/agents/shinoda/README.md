# 🤖 Shinoda

> AI operations agent for the Pulse platform.

**Shinoda** is a Mastra-based AI agent that provides operational intelligence over the Pulse platform. It monitors the track processing pipeline, diagnoses stuck or failed tracks, checks service health, and can forward anomaly signals to external observability sinks via MCP.

| | |
|---|---|
| **Package** | `@agent/shinoda` |
| **Framework** | Mastra |
| **Port** | `4111` |
| **Model** | Configurable (default: Composer 1.5) |

---

## 🏗️ Architecture

```
src/
├── mastra/
│   └── index.ts                 # Mastra registration, signal subscribers, MCP wiring
├── shinoda/
│   ├── shinoda.agent.ts         # Agent identity, instructions, tool bindings
│   ├── env.ts                   # Environment helpers
│   ├── tools/
│   │   ├── analyse-pipeline.ts  # Query pipeline state from Backstage
│   │   ├── inspect-events.ts    # Detect event gaps, out-of-order, anomalies
│   │   └── check-services.ts   # Health check all platform services
│   ├── signals/
│   │   ├── signal-bus.ts        # Typed EventEmitter singleton
│   │   ├── shinoda-events.ts    # Event payload types (ShinodaEventMap)
│   │   ├── anomaly-rules.ts     # Stuck, gap, out-of-order, health rules
│   │   └── monitor.ts          # Socket.IO + polling monitor
│   ├── workflows/
│   │   ├── debug-pipeline.workflow.ts   # 4-step diagnostic workflow
│   │   └── health-pipeline.workflow.ts  # Parallel service health checks
│   ├── infra/mcp/
│   │   ├── mcp-client.ts       # Generic MCP client factory
│   │   └── observability-sink.ts # Signal bus → MCP server bridge
│   └── knowledge/
│       ├── context/             # Pipeline, transcoding, architecture docs
│       └── instructions/        # Agent role, platform architecture, event inventory
└── index.ts
```

---

## 🔧 Tools

| Tool | Description |
|------|-------------|
| `analyse-pipeline` | Queries Backstage for pipeline state by `trackId` or filter (all / active / failed) |
| `inspect-events` | Inspects event history for a track; detects gaps, out-of-order events, anomalies |
| `check-services` | Health-checks all 9 platform services via `GET /health` |

---

## 🔄 Workflows

### Debug Pipeline

A 4-step sequential workflow for diagnosing stuck or failed tracks:

```
gather-context → identify-gap → diagnose → report
```

1. **Gather Context** -- fetches pipeline data from Backstage + health-checks all services
2. **Identify Gap** -- determines where the pipeline stalled relative to the expected sequence
3. **Diagnose** -- correlates service health, terminal events, and timing to find root cause
4. **Report** -- generates human-readable diagnosis and emits `DIAGNOSIS_READY` signal

### Health Pipeline

Single-step parallel health check:

1. **Check All Services** -- pings all 9 services concurrently, aggregates results
2. Emits `SERVICE_UNHEALTHY` for any failing service
3. Returns summary with healthy/unhealthy/unreachable counts

---

## 📡 Signal Bus

The signal bus is a typed `EventEmitter` that routes operational events internally:

| Signal | Trigger | Description |
|--------|---------|-------------|
| `TRACK_STUCK` | Monitor | Track pipeline stalled beyond threshold |
| `SERVICE_UNHEALTHY` | Health pipeline | Service failed health check |
| `PIPELINE_ANOMALY` | Monitor | Event gap, out-of-order, duplicate, or timeout |
| `DIAGNOSIS_READY` | Debug pipeline | Diagnostic report completed |

All signals are logged to console and optionally forwarded to an MCP server.

---

## 🔌 MCP Integration

When `MCP_SERVER_URL` is configured, the **ObservabilitySink** subscribes to all signal bus events and forwards them to the external MCP server as structured JSON payloads.

```
Signal Bus → ObservabilitySink → MCP Server → OpenTelemetry / Bug Tracker / Alerting
```

The MCP client is a thin HTTP adapter that POSTs to `/signals` on the configured server.

---

## 📋 Service Registry

The agent monitors these services:

| Service | Default URL | Health Path |
|---------|-------------|-------------|
| Authority | `http://authority:7000` | `/health` |
| Slim Shady | `http://slim-shady:7400` | `/health` |
| Soundgarden | `http://soundgarden:7100` | `/health` |
| Petrified | `http://petrified:7201` | `/health` |
| Fort Minor | `http://fort-minor:7202` | `/health` |
| Stereo | `http://stereo:7203` | `/health` |
| Mockingbird | `http://mockingbird:7200` | `/health` |
| Hybrid Storage | `http://hybrid-storage:7300` | `/health` |
| Backstage | `http://backstage:4001` | `/health` |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `SHINODA_MODEL` | AI model name |
| `BACKSTAGE_URL` | Backstage base URL (primary data source) |
| `AUTHORITY_URL` | Authority health URL |
| `SLIM_SHADY_URL` | Slim Shady health URL |
| `SOUNDGARDEN_URL` | Soundgarden health URL |
| `PETRIFIED_URL` | Petrified health URL |
| `FORT_MINOR_URL` | Fort Minor health URL |
| `STEREO_URL` | Stereo health URL |
| `MOCKINGBIRD_URL` | Mockingbird health URL |
| `HYBRID_STORAGE_URL` | Hybrid Storage health URL |
| `MONITOR_POLL_INTERVAL_MS` | Monitor polling interval |
| `STUCK_THRESHOLD_MS` | Track stuck detection threshold |
| `MCP_SERVER_URL` | External MCP server (optional) |

---

## 🚀 Development

```bash
# From monorepo root
pnpm shinoda

# Or directly
pnpm --filter @agent/shinoda dev
```

The Mastra dev server starts at `http://localhost:4111`.
