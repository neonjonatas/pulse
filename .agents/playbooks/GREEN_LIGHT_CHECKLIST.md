# Green Light Checklist

Operational playbook for verifying that the Pulse platform is fully operational after a fresh bootstrap, deployment, or infrastructure change.

---

## Prerequisites

| Requirement | How to verify |
|-------------|---------------|
| Docker Engine running | `docker info` exits 0 |
| pnpm installed | `pnpm --version` |
| Node.js 20+ | `node --version` |
| Env files generated | `pnpm dx:template` (generates `.env` from `.env.template` for all services) |

---

## Phase 1: Infrastructure (Docker Compose)

All infrastructure services are defined in `repos/packages/env-orchestration/docker-compose.yml`.

### Boot Infrastructure

```bash
pnpm dx:up        # starts all containers
pnpm dx:ps        # shows container status
```

### Verify Core Infrastructure

| Service | Port | Verify | Expected |
|---------|------|--------|----------|
| NATS | 4222 | `nc -zv localhost 4222` | Connection succeeded |
| MongoDB (authority) | 27017 | `mongosh --port 27017 --eval "db.runCommand({ping:1})"` | `{ ok: 1 }` |
| MongoDB (backstage) | 27020 | `mongosh --port 27020 --eval "db.runCommand({ping:1})"` | `{ ok: 1 }` |
| MongoDB (slim-shady) | 27018 | `mongosh --port 27018 --eval "db.runCommand({ping:1})"` | `{ ok: 1 }` |
| MongoDB (soundgarden) | 27019 | `mongosh --port 27019 --eval "db.runCommand({ping:1})"` | `{ ok: 1 }` |
| Redis (authority) | 6379 | `redis-cli -p 6379 PING` | `PONG` |
| Redis (fort-minor) | 6380 | `redis-cli -p 6380 PING` | `PONG` |
| MinIO (soundgarden) | 9000 | `curl -s http://localhost:9000/minio/health/live` | 200 |
| MinIO (mockingbird) | 9002 | `curl -s http://localhost:9002/minio/health/live` | 200 |
| MinIO (hybrid-storage) | 9004 | `curl -s http://localhost:9004/minio/health/live` | 200 |
| MinIO (petrified) | 9006 | `curl -s http://localhost:9006/minio/health/live` | 200 |
| MinIO (stereo) | 9008 | `curl -s http://localhost:9008/minio/health/live` | 200 |

### Pass Criteria

All infrastructure containers are `healthy` or `running` in `pnpm dx:ps`. No containers in `restarting` or `exited` state.

---

## Phase 2: Application Build

```bash
pnpm install          # install all dependencies
pnpm build            # build all workspaces (packages first via turbo)
```

### Pass Criteria

- `pnpm build` exits 0 with no TypeScript errors
- All packages under `repos/packages/` produce `dist/` directories
- All domain services under `repos/domain/` produce `dist/` directories

---

## Phase 3: Service Health Checks

All NestJS services expose a `GET /health` endpoint returning `{ "status": "ok" }`.

### Verify Each Service

| Service | Workspace | Port | Health URL |
|---------|-----------|------|------------|
| Authority | `repos/domain/identity/authority` | 7000 | `http://localhost:7000/health` |
| Slim Shady | `repos/domain/identity/slim-shady` | 7400 | `http://localhost:7400/health` |
| Soundgarden | `repos/domain/streaming/soundgarden` | 7100 | `http://localhost:7100/health` |
| Backstage | `repos/domain/realtime/backstage` | 4001 | `http://localhost:4001/health` |
| Petrified | `repos/domain/ai/petrified` | 7201 | `http://localhost:7201/health` |
| Fort Minor | `repos/domain/ai/fort-minor` | 7202 | `http://localhost:7202/health` |
| Stereo | `repos/domain/ai/stereo` | 7203 | `http://localhost:7203/health` |
| Mockingbird | `repos/domain/streaming/mockingbird` | 7200 | `http://localhost:7200/health` |
| Hybrid Storage | `repos/domain/streaming/hybrid-storage` | 7300 | `http://localhost:7300/health` |

### Quick Check Script

```bash
for url in \
  http://localhost:7000/health \
  http://localhost:7400/health \
  http://localhost:7100/health \
  http://localhost:4001/health \
  http://localhost:7201/health \
  http://localhost:7202/health \
  http://localhost:7203/health \
  http://localhost:7200/health \
  http://localhost:7300/health; do
  echo -n "$url -> "
  curl -sf "$url" && echo "" || echo "FAIL"
done
```

### Expected Response

```json
{ "status": "ok" }
```

### Pass Criteria

All 9 endpoints return `200 OK` with `{ "status": "ok" }` within 5 seconds.

---

## Phase 4: Frontend (Pulse App)

| Item | Command / URL | Expected |
|------|---------------|----------|
| Dev server starts | `pnpm pulse` | Next.js dev server on `http://localhost:3000` |
| Homepage loads | `curl -s http://localhost:3000` | 200 response with HTML |

---

## Phase 5: Agent Verification

| Agent | Command | Expected |
|-------|---------|----------|
| Shinoda | `pnpm shinoda` | Mastra dev server starts, agents registered |
| Chester | `pnpm chester` | Mastra dev server starts, search tools available |
| Emily | `pnpm emily` | Mastra dev server starts, transform tools available |

---

## Phase 6: SSE Pipeline Verification

SSE is feature-flagged via `USE_SSE=true` on the Backstage service.

### When SSE is Enabled

1. **Stream endpoint responds:**

```bash
curl -N -H "Accept: text/event-stream" http://localhost:4001/pipelines/test-track-id/events
```

Expected: Connection stays open, receives heartbeat `:ping` comments every 15 seconds.

2. **Replay works:** Include `Last-Event-ID` header to verify replay of past events:

```bash
curl -N -H "Accept: text/event-stream" -H "Last-Event-ID: some-event-id" \
  http://localhost:4001/pipelines/test-track-id/events
```

### When SSE is Disabled (WebSocket fallback)

The Backstage gateway operates via Socket.IO on the same port.

---

## Phase 7: Event Flow Verification

### End-to-End Pipeline Test

1. Upload a track via Soundgarden (or use `MOCK_MODE=true` on relevant services)
2. Observe NATS subjects firing in sequence:

```
track.upload.received -> track.upload.validated -> track.upload.stored -> track.uploaded
-> track.petrified.generated -> track.fort-minor.started -> track.fort-minor.completed
-> track.stereo.started -> track.approved -> track.transcoding.started
-> track.transcoding.completed -> track.hls.generated -> track.hls.stored
```

3. Verify Backstage records pipeline events via `GET /pipelines` on port 4001

### Pass Criteria

- Events flow through the complete pipeline without stalling
- Backstage `GET /pipelines` returns at least one pipeline with progressive events
- No services in crash loop during the flow

---

## Common Failures

| Symptom | Likely Cause | Resolution |
|---------|--------------|------------|
| `ECONNREFUSED` on health check | Service not started or wrong port | Check env file, verify service is running |
| Build fails with `Cannot find module '@pack/*'` | Packages not built first | Run `pnpm build` (turbo handles order) |
| NATS connection refused | NATS container not running | `pnpm dx:up`, check `pnpm dx:ps` |
| MongoDB auth failure | Wrong credentials in `.env` | Regenerate with `pnpm dx:template` |
| MinIO bucket not found | CreateBuckets init container failed | Check `docker logs <minio-init-container>` |
| `tsc-alias` rewrites `nats` import | Known `base-url` replacer bug | Ensure `tsconfig.build.json` disables `base-url` replacer |
| Mastra "Invalid config" | Entry file not exporting `new Mastra({...})` | Verify `src/mastra/index.ts` exports Mastra instance |
| SSE heartbeat not received | `USE_SSE` not set to `true` | Set `USE_SSE=true` in backstage `.env` |

---

## Summary

| Phase | Check | Status |
|-------|-------|--------|
| 1 | Infrastructure containers healthy | [ ] |
| 2 | Build completes without errors | [ ] |
| 3 | All 9 health endpoints return OK | [ ] |
| 4 | Pulse frontend loads | [ ] |
| 5 | All 3 agents start | [ ] |
| 6 | SSE stream responds (if enabled) | [ ] |
| 7 | Event flow completes end-to-end | [ ] |

**Green Light:** All phases pass. System is operational.
