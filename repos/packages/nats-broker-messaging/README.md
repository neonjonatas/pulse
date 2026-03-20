# 📨 @pack/nats-broker-messaging

> NATS transport layer for publishing and consuming event envelopes across the Pulse platform.

`@pack/nats-broker-messaging` provides transport-level messaging primitives for publishing and consuming serialised event envelopes over NATS, while keeping domain abstractions in `@pack/kernel`.

---

## 📦 Exports

### Core Transport

| Export | Kind | Description |
|--------|------|-------------|
| `NatsPublisher` | Class | Typed publisher -- serialises `EventPrimitive` envelopes and publishes to NATS subjects |
| `NatsConsumer` | Class | Typed subscriber with queue-group semantics, envelope validation, and middleware support |
| `NoopPublisher` | Class | No-op publisher for testing |
| `NoopConsumer` | Class | No-op consumer for testing |

### Contracts & Middleware

| Export | Kind | Description |
|--------|------|-------------|
| `EventContract` | Type | Maps NATS subject names to payload shapes |
| `ConsumeContext` | Type | Envelope context passed to consumer handlers |
| `ConsumeMiddleware` | Type | Middleware function for consume pipelines |
| `PublishContext` | Type | Envelope context passed to publish pipelines |
| `PublishMiddleware` | Type | Middleware function for publish pipelines |
| `composeConsumeMiddleware` | Function | Chains consume middleware into a single handler |
| `composePublishMiddleware` | Function | Chains publish middleware into a single handler |

### Error Hierarchy

| Export | Extends | Description |
|--------|---------|-------------|
| `EventBusError` | `DomainError` | Base error for all messaging failures |
| `EventBusConnectionError` | `EventBusError` | NATS connection failed |
| `EventBusPublishError` | `EventBusError` | Publish operation failed |
| `EventBusSubscriptionError` | `EventBusError` | Subscription failed |
| `EventBusValidationError` | `EventBusError` | Envelope schema validation failed |
| `EventBusVersionMismatchError` | `EventBusError` | Incompatible event version |

### NestJS Integration

| Export | Kind | Description |
|--------|------|-------------|
| `natsConnectionProvider` | Provider | Creates and injects a NATS connection |
| `NatsConnectionToken` | Token | DI injection token for the NATS connection |
| `NatsLifecycleService` | Service | Drains NATS connections on `onModuleDestroy` |
| `@EventConsumer` | Decorator | Declarative consumer binding on a class method |
| `NatsConsumerRegistryService` | Service | Auto-discovers and registers `@EventConsumer` handlers |
| `NatsConsumerModule` | Module | `NatsConsumerModule.forRoot()` enables declarative consumers |
| `NatsConfigFlag` | Enum | Config keys for NATS connection (`NatsUrl`, `QueueGroup`) |

### Legacy Exports

| Export | Description |
|--------|-------------|
| `EventBus` | Transport contract with `emit`/`on` |
| `NatsEventBusAdapter` | Legacy adapter |
| `NatsQueueConsumerAdapter` | Legacy queue consumer |
| `NoopEventBusAdapter` | No-op legacy adapter |

> New code should prefer `NatsPublisher` and `NatsConsumer`.

---

## 🔌 Usage

### Publishing

```typescript
import { NatsPublisher } from '@pack/nats-broker-messaging'
import type { EventPrimitive } from '@pack/kernel'

interface AuthorityContract {
  'authority.user.logged_in': {
    userId: string
    sessionId: string
  }
}

const publisher = new NatsPublisher<AuthorityContract>(connection)

const envelope: EventPrimitive<AuthorityContract['authority.user.logged_in']> = {
  eventId: crypto.randomUUID(),
  eventName: 'authority.user.logged_in',
  eventVersion: 1,
  aggregateId: 'usr_123',
  occurredOn: new Date(),
  payload: { userId: 'usr_123', sessionId: 'ses_123' }
}

await publisher.publish('authority.user.logged_in', envelope)
```

### Consuming

```typescript
import { NatsConsumer } from '@pack/nats-broker-messaging'

interface TrackContract {
  'track.uploaded': {
    trackId: string
    sourceStorage: { bucket: string; key: string }
  }
}

const consumer = new NatsConsumer<TrackContract>(connection, 'petrified-workers')
consumer.subscribe('track.uploaded', async (envelope) => {
  console.log(envelope.eventId, envelope.payload.trackId)
})
```

### NestJS Dependency Injection

```typescript
// In module providers:
natsConnectionProvider,
NatsLifecycleService,

// In a consumer class:
@EventConsumer(TrackEvent.Uploaded)
async handle(data: ConsumeContext) { ... }
```

---

## 🏗️ Project Structure

```
src/
├── core/
│   ├── publisher.ts
│   ├── consumer.ts
│   ├── noop-publisher.ts
│   ├── noop-consumer.ts
│   └── middleware/
├── contracts/
│   └── event-contract.ts
├── errors/
│   └── event-bus-error.ts
├── nestjs/
│   ├── nats-connection.provider.ts
│   ├── nats-lifecycle.service.ts
│   ├── event-consumer.decorator.ts
│   ├── nats-consumer-registry.service.ts
│   └── nats-consumer.module.ts
├── legacy/
│   ├── event-bus.ts
│   ├── nats-event-bus.adapter.ts
│   ├── nats-queue-consumer.adapter.ts
│   └── noop-event-bus.adapter.ts
└── index.ts
```

---

## 📋 Dependencies

| Dependency | Version |
|------------|---------|
| `nats` | ^2.17.0 |
| `zod` | ^4 |
| `@pack/kernel` | workspace:* |

### Peer Dependencies (optional)

| Dependency | Used By |
|------------|---------|
| `@nestjs/common` | NestJS integration module |
| `@nestjs/core` | NestJS integration module |
