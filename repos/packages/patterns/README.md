# 🔄 @pack/patterns

> Resilience patterns and factory utilities for the Pulse platform.

`@pack/patterns` provides a production-ready **Circuit Breaker** implementation and a `UniqueEntityId` factory for generating domain identifiers.

---

## 📦 Exports

### Circuit Breaker

| Export | Kind | Description |
|--------|------|-------------|
| `CircuitBreaker` | Class | State-machine circuit breaker with configurable thresholds |
| `CircuitBreakerState` | Enum | `Closed`, `Open`, `HalfOpen` |
| `CircuitBreakerOptions` | Interface | Configuration for thresholds, timeouts, callbacks |
| `CircuitBreakerOpenError` | Error | Thrown when circuit is open and call is rejected |
| `CircuitBreakerTimeoutError` | Error | Thrown when operation exceeds the configured timeout |

### Factory

| Export | Kind | Description |
|--------|------|-------------|
| `UniqueEntityId` | Class | Generates unique identifiers for domain entities |

---

## ⚡ Circuit Breaker States

```
  ┌───────────┐  failure >= threshold  ┌──────────┐
  │  CLOSED   │ ────────────────────▶  │   OPEN   │
  │ (normal)  │                        │ (reject) │
  └───────────┘                        └──────────┘
       ▲                                    │
       │  success >= threshold         resetTimeout
       │                                    │
  ┌────────────┐                           ▼
  │ HALF-OPEN  │ ◀─────────────────────────┘
  │  (probe)   │
  └────────────┘
```

---

## 🔌 Usage

```typescript
import { CircuitBreaker, CircuitBreakerState } from '@pack/patterns'

const breaker = new CircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 5000,
  resetTimeoutMs: 30000,
  successThreshold: 2,
  callbacks: {
    onOpen: () => console.log('Circuit opened'),
    onClose: () => console.log('Circuit closed'),
    onHalfOpen: () => console.log('Circuit half-open')
  }
})

const result = await breaker.execute(
  () => fetchExternalService(),
  () => fallbackValue()
)

console.log(breaker.getState())  // CircuitBreakerState.Closed
console.log(breaker.getStats())  // { failures, successes, state }
```

### In Pulse

Authority wraps session persistence with a circuit breaker via `SessionCircuitBreakerAdapter` to protect against Redis/Mongo outages during login flows.

---

## 🏗️ Project Structure

```
src/
├── circuit-breaker/
│   ├── circuit-breaker.ts
│   ├── circuit-breaker.error.ts
│   ├── circuit-breaker.options.ts
│   └── circuit-breaker.state.ts
├── factory/
│   └── unique-entity-id.ts
└── index.ts
```

---

## 📋 Dependencies

| Dependency | Version |
|------------|---------|
| `@pack/event-inventory` | workspace:* |
| `@pack/kernel` | workspace:* |
| `typescript` | ^5 |
