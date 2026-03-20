# Health Check Standard

This standard defines the required health check contract for all NestJS microservices in the Pulse platform.

---

## Required Endpoint

Every NestJS service must expose:

```
GET /health
```

No authentication. No query parameters. Must respond within 5 seconds.

---

## Response Contract

### Liveness Response

```json
{ "status": "ok" }
```

| Field | Type | Value | Description |
|-------|------|-------|-------------|
| `status` | `string` | `"ok"` | Confirms the process is alive and accepting HTTP requests |

HTTP status code: `200 OK`

Content-Type: `application/json`

See `.agents/schemas/health/liveness.schema.json` for the formal JSON Schema.

---

## Implementation Pattern

Every service implements a `HealthController` following this pattern:

```typescript
import { Controller, Get } from '@nestjs/common'

@Controller()
export class HealthController {
  @Get('health')
  check() {
    return { status: 'ok' }
  }
}
```

The controller must be registered in the service's root module.

---

## Service Port Convention

Each service has a fixed port assignment:

| Service | Port | Workspace |
|---------|------|-----------|
| Authority | 7000 | `repos/domain/identity/authority` |
| Slim Shady | 7400 | `repos/domain/identity/slim-shady` |
| Soundgarden | 7100 | `repos/domain/streaming/soundgarden` |
| Backstage | 4001 | `repos/domain/realtime/backstage` |
| Petrified | 7201 | `repos/domain/ai/petrified` |
| Fort Minor | 7202 | `repos/domain/ai/fort-minor` |
| Stereo | 7203 | `repos/domain/ai/stereo` |
| Mockingbird | 7200 | `repos/domain/streaming/mockingbird` |
| Hybrid Storage | 7300 | `repos/domain/streaming/hybrid-storage` |

---

## Docker Healthcheck

All services in `docker-compose.yml` must include a healthcheck that probes this endpoint:

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:PORT/health"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 15s
```

Replace `PORT` with the service's assigned port.

### Configuration Rules

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| `interval` | 10s | Frequent enough to detect failures quickly |
| `timeout` | 5s | Health check must respond within 5 seconds |
| `retries` | 3 | Three consecutive failures before marking unhealthy |
| `start_period` | 15s | Grace period for NestJS boot and dependency connection |

---

## Shinoda Agent Integration

The Shinoda monitoring agent polls all 9 health endpoints for status reporting. It expects:

1. All service URLs configured via environment variables (see `.agents/schemas/env/shinoda.env.schema.json`)
2. Each URL appended with `/health` to form the probe endpoint
3. Response `{ "status": "ok" }` to indicate a healthy service
4. Any non-200 response or connection error indicates an unhealthy service

---

## Rules

1. **Every NestJS service must expose `GET /health`.** No exceptions.
2. **Response must be `{ "status": "ok" }`.** Do not add additional fields to the liveness response. Use a separate readiness endpoint if dependency status is needed.
3. **No authentication on the health endpoint.** Health probes from Docker, load balancers, and agents must not require tokens.
4. **Port must match the service convention.** Do not change assigned ports without updating all consumers (Docker Compose, Shinoda env, this standard).
5. **Docker healthcheck must use `wget`.** The NestJS containers use Alpine-based images that include `wget` but not `curl`.
6. **Health endpoints must not have side effects.** No database writes, no event emissions, no external calls.

---

## Related Artifacts

- `.agents/schemas/health/liveness.schema.json` — Liveness response schema
- `.agents/schemas/health/readiness.schema.json` — Extended readiness response schema
- `.agents/schemas/health/dependency-status.schema.json` — Per-dependency status schema
- `.agents/playbooks/GREEN_LIGHT_CHECKLIST.md` — Operational verification playbook
- `.agents/schemas/env/shinoda.env.schema.json` — Shinoda health check URL configuration
