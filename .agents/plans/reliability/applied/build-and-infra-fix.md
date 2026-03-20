# Reliability Fix — Build Failures and Docker Infrastructure

## Status: RESOLVED

All 20 packages build successfully. All fixes verified via `pnpm dx:reset`.

---

## Fixes Applied

### 1. tsc-alias Base-URL Replacer Bug (Root Cause of 4 Failures)

**File:** `repos/packages/nats-broker-messaging/tsconfig.build.json`

**Problem:** `tsc-alias`'s base-url replacer rewrote `import { connect } from 'nats'` (the npm package) to `import { connect } from '../nats'` (the local barrel file) because the compiled file sits in `dist/nats/` — a directory with the same name as the npm package. The local barrel exports providers and adapters, not the `connect` function.

**Impact:** Cascading build failures in `@agent/emily`, `@agent/chester`, `@micro/mockingbird`, `@micro/petrified` — any package that transitively imports `@pack/nats-broker-messaging`.

**Fix:** Disabled the base-url replacer in `tsconfig.build.json`:

```json
{
  "tsc-alias": {
    "replacers": {
      "base-url": {
        "enabled": false
      }
    }
  }
}
```

---

### 2. Shinoda Mastra Config (Invalid Entry Export)

**File:** `repos/agents/shinoda/src/mastra/index.ts`

**Problem:** The Mastra CLI expects `export const mastra = new Mastra({...})` but the file exported `export const mastra = new Agent({...})`. Chester and Emily already used the correct pattern.

**Fix:** Extracted the agent into a local variable, then wrapped it in `new Mastra({ agents: { shinoda: shinodaAgent } })`. Workflows are re-exported as standalone named exports since they are not a `Mastra` constructor option.

---

### 3. Bootstrap Script Name Mismatch

**File:** `bin/docker/docker-up.sh` line 90

**Problem:** The `--bootstrap` flag called `pnpm dx:env:template` but the root `package.json` defines the script as `dx:template`.

**Fix:** Changed to `pnpm dx:template`.

---

### 4. Chester and Emily Added to Docker Compose

**File:** `repos/packages/env-orchestration/docker-compose.yml`

**Problem:** Both agents had Dockerfiles and `.env.template` files but were missing from docker-compose.

**Fix:** Added service definitions:
- `chester`: port 4110, depends on `nats` (service_healthy)
- `emily`: port 4112 (host) → 4111 (container), depends on `nats` (service_healthy)

---

### 5. Docker Scripts Updated

**Files:** `bin/docker/docker-up.sh`, `bin/docker/docker-down.sh`, `bin/docker/docker-ps.sh`

**Problem:** `APP_SERVICES`, `APP_ENV_FILES`, and `CONFLICT_NAMES` arrays did not include `chester` or `emily`.

**Fix:** Added both agents to all three arrays in all three scripts.

---

### 6. App Service Docker Healthchecks

**File:** `repos/packages/env-orchestration/docker-compose.yml`

**Problem:** All infra services (NATS, MongoDB, Redis, MinIO) had Docker healthchecks but none of the 9 NestJS app services did. This prevented using `depends_on: condition: service_healthy` for app-to-app ordering.

**Fix:** Added healthcheck to all 9 NestJS services using `wget -qO- http://localhost:PORT/health` with `start_period: 30s` to allow for NestJS boot time.

Services with healthchecks: authority (7000), slim-shady (7400), soundgarden (7100), backstage (4001), petrified (7201), fort-minor (7202), stereo (7203), mockingbird (7200), hybrid-storage (7300).

Services without healthchecks (no `/health` endpoint): pulse (Next.js), shinoda, chester, emily (Mastra agents).

---

## Remaining Gaps (Not Blocking)

| Gap | Impact | Priority |
|-----|--------|----------|
| Pulse has no `/health` endpoint | Shinoda cannot monitor frontend | Medium |
| Shinoda does not check itself or Pulse | Blind spots in health monitoring | Low |
| SSE replay uses `crypto.randomUUID()` instead of stored IDs | `Last-Event-ID` replay semantics broken | High (tracked in SSE transition plan) |
| `USE_SSE=true` not in any `.env.template` | Default env boots with Socket.IO | Low |

---

## Verification

```
pnpm dx:reset

Tasks:    20 successful, 20 total
Cached:    0 cached, 20 total
Time:     1m36.974s
```

All packages, microservices, agents, and the frontend build cleanly from a cold state.
