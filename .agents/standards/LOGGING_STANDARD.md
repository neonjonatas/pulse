# Logging Standard

This standard defines the logging conventions for all services in the Pulse platform.

---

## Log Format

All services must output structured JSON logs. Each log line is a single JSON object.

```json
{
  "level": "info",
  "timestamp": "2026-03-19T14:30:00.000Z",
  "service": "soundgarden",
  "message": "Track upload completed",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Required Fields

Every log entry must include:

| Field | Type | Description |
|-------|------|-------------|
| `level` | `string` | Log level: `error`, `warn`, `info`, `debug`, `verbose` |
| `timestamp` | `string` (ISO 8601) | When the log entry was created |
| `service` | `string` | Name of the producing service (e.g., `soundgarden`, `authority`, `chester`) |
| `message` | `string` | Human-readable log message |

### Recommended Fields

| Field | Type | When to Include |
|-------|------|-----------------|
| `correlationId` | `string` | Always include when processing a pipeline event or request that has a correlation context |
| `trackId` | `string` | When the operation involves a specific track |
| `userId` | `string` | When the operation involves a specific user |
| `event` | `string` | When logging about a NATS event (use the full subject name) |
| `durationMs` | `number` | When logging operation completion (include elapsed time) |
| `error` | `object` | When logging errors (include `message`, `stack`, and `code` if available) |

---

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `error` | Unrecoverable failures requiring attention | Database connection lost, event processing failed after retries |
| `warn` | Degraded conditions that may need investigation | Circuit breaker opened, retry attempt, slow dependency response |
| `info` | Significant business events and state transitions | Track uploaded, pipeline completed, service started |
| `debug` | Detailed diagnostic information for troubleshooting | Request/response payloads, internal state changes |
| `verbose` | Extremely detailed tracing | Individual function entries/exits, full event payloads |

### Level Selection Rules

- Production environments: `info` and above
- Staging environments: `debug` and above
- Development environments: `verbose` and above

---

## Forbidden Patterns

### No `console.log` in Production Paths

All service code must use the NestJS `Logger` (or a structured logging adapter). Direct `console.log`, `console.warn`, and `console.error` calls are forbidden in:

- Use cases
- Controllers
- Event consumers
- Adapters and providers
- Domain entities and value objects

`console.log` is acceptable only in:

- CLI scripts and build tooling
- One-time bootstrap messages (e.g., port binding confirmation)

### No Sensitive Data in Logs

Never log:

- Passwords, API keys, or tokens (including JWTs)
- Full credit card numbers or PII beyond user IDs
- MinIO credentials or database connection strings with passwords

### No Unstructured Multi-Line Logs

Avoid stack traces as raw multi-line strings. Wrap errors in the structured `error` field:

```json
{
  "level": "error",
  "timestamp": "2026-03-19T14:35:00.000Z",
  "service": "petrified",
  "message": "Fingerprint generation failed",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "trackId": "track-uuid-456",
  "error": {
    "message": "Timeout after 30000ms",
    "code": "PROCESSING_TIMEOUT",
    "stack": "Error: Timeout after 30000ms\n    at ..."
  }
}
```

---

## NestJS Logger Usage

```typescript
import { Logger } from '@nestjs/common'

export class TranscribeTrackUseCase {
  private readonly logger = new Logger(TranscribeTrackUseCase.name)

  async execute(trackId: string): Promise<void> {
    this.logger.log(`Transcription started for track ${trackId}`)
    // ...
    this.logger.error(`Transcription failed for track ${trackId}`, error.stack)
  }
}
```

---

## Correlation ID Propagation

When processing an event or request that includes a `correlationId`:

1. Extract the `correlationId` from the event envelope or request context
2. Include it in every log entry produced during that processing run
3. Pass it to any downstream events emitted during processing

This enables end-to-end tracing of a complete pipeline run across all services.

---

## Related Artifacts

- `.agents/schemas/shared/correlation-context.schema.json` — Correlation context schema
- `.agents/schemas/shared/error-envelope.schema.json` — Error envelope schema
- `.agents/context/EVENT_ARCHITECTURE.md` — Event envelope and correlation ID conventions
