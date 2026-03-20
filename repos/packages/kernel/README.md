# 🧬 @pack/kernel

> Domain-Driven Design primitives for the Pulse platform.

`@pack/kernel` provides the foundational building blocks that every microservice in the Pulse monorepo extends: entities, value objects, aggregates, events, use cases, and the event bus abstraction.

---

## 📦 Exports

| Category | Export | Description |
|----------|--------|-------------|
| **Entity** | `DomainEntity` | Base class for domain entities with identity |
| **Value Object** | `ValueObject` | Immutable value type with structural equality |
| **Aggregate** | `AggregateRoot` | Entity that owns a consistency boundary and records domain events |
| **Event** | `DomainEvent` | Base class for all domain events |
| **Event Bus** | `EventBus` | Abstract bus for publishing and subscribing to events |
| **Event Handler** | `EventHandler` | Abstract handler bound to a specific event type |
| **Event Map** | `EventMap` | Registry linking event names to handler classes |
| **Use Case** | `UseCase` | Abstract command/query handler |
| **Identity** | `Id` | Typed wrapper around entity identifiers |
| **Unit of Work** | `UnitOfWork` | Transactional boundary abstraction |
| **Error** | `DomainError` | Base error class for domain-level failures |

### Type Primitives

| Type | Purpose |
|------|---------|
| `IdType` | Branded string for entity IDs |
| `ObjectType` | Shape of a serialisable domain object |
| `EventType` | Discriminator string for events |
| `OccurredOnType` | ISO-8601 timestamp for events |
| `MetaType` | Metadata attached to events |
| `EventPrimitive` | Plain-object representation of a domain event |
| `IdPrimitive` | Serialised form of `Id` |
| `MetaPrimitive` | Serialised form of event metadata |
| `ObjectPrimitive` | Serialised form of an entity |
| `OccurredOnPrimitive` | Serialised form of a timestamp |

---

## 🏗️ Architecture

```
src/
├── application/
│   └── use-case.ts          # UseCase<Input, Output>
├── events/
│   ├── domain-event.ts
│   ├── event-bus.ts
│   ├── event-handler.ts
│   └── event-map.ts
├── primitives/
│   ├── aggregate-root.ts
│   ├── domain-entity.ts
│   ├── domain-error.ts
│   ├── id.ts
│   ├── unit-of-work.ts
│   └── value-object.ts
├── types/
│   └── *.type.ts
└── index.ts
```

---

## 🔌 Usage

```typescript
import { DomainEntity, Id, UseCase, EventBus } from '@pack/kernel'
```

Every microservice's domain layer extends these abstractions -- entities inherit from `DomainEntity`, use cases implement `UseCase<I, O>`, and event publishing goes through the `EventBus` contract.

---

## ⚠️ Constraints

`@pack/kernel` is **read-only infrastructure**. Microservices consume its abstractions but **never modify kernel source**. Changes to kernel require a dedicated RFC.

---

## 📋 Dependencies

| Dependency | Version |
|------------|---------|
| `typescript` | ^5 |

Zero runtime dependencies.
