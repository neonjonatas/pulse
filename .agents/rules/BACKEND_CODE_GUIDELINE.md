---
alwaysApply: true
---

# Back-End Code Guideline

## Circuit Breaker Scope
Circuit breakers from `@pack/patterns` are only for synchronous calls to other services (HTTP, gRPC, database clients, etc.). Do not wrap asynchronous event emission or background jobs with them—events are fire-and-forget and keeping the breaker in the sync path keeps it reliable and predictable.

## Clean Architecture Per Microservice
Each microservice must follow Clean Architecture with a single domain and the folders `application`, `domain`, `infra`, and `interface`. Each microservice contains a single module under those folders.

Example:
- `domain/identity/authentication/src/auth/application`
- `domain/identity/authentication/src/auth/domain`
- `domain/identity/authentication/src/auth/infra`
- `domain/identity/authentication/src/auth/interface`
- `domain/identity/authentication/src/auth/auth.module.ts`

## No Shared Infrastructure Between Microservices
Infrastructure code is private to each microservice. A microservice must never import another microservice's `infra` layer (adapters, providers, config, clients, or wiring). Shared contracts and reusable primitives belong in workspace packages (for example `@pack/kernel`).

## Ports As Abstract Classes
Ports are abstract classes, not TypeScript interfaces. Adapters are classes implementing those ports. Event-bus ports extend `EventBus` from `@pack/nats-broker-messaging`; cache ports extend `CachePort` from `@pack/cache`.

Do:
```ts
import { EventBus } from '@pack/nats-broker-messaging'
import type { MyEventMap } from '@domain/events'
export abstract class MyEventBusPort extends EventBus<MyEventMap> {}
```

Don't:
```ts
export interface EventBusPort {
  emit(event: string, payload: unknown): Promise<void>
}
```

## Use Cases As Classes
Each use case must be a class and extend the Kernel abstract use-case base class.

Do:
```ts
export class StartPlaybackUseCase extends UseCase<StartInput, StartResult> {
  async execute(input: StartInput) {
    return input
  }
}
```

## Entities Are Kernel Entities
Entities must be classes and extend the Kernel `Entity` or `AggregateRoot` base class. The constructor requires an `Id`; use your chosen `Id` implementation package (or a local `Id` value-object) when creating new entities.

Do:
```ts
import { Entity } from '@pack/kernel'
export class Track extends Entity<TrackProps> {}
// Caller: new Track(props, /* Id implementation */)
```

## Events Are Kernel Events
Domain events must be classes and extend the Kernel `DomainEvent` abstract class. Callers must provide `eventId` and `occurredOn` (no defaults). Use your chosen id generation approach (e.g. `crypto.randomUUID`) for ids.

Do:
```ts
export class StreamStarted extends DomainEvent<StreamStartedPayload> {
  constructor(aggregateId: string, props: StreamStartedPayload, meta: { eventId: string; occurredOn: Date }) {
    super(aggregateId, props, meta)
  }
  get eventName() { return 'stream.started' }
  get eventVersion() { return 1 }
}
```

## Value Objects Are Kernel ValueObjects
Value objects must be classes and extend the Kernel `ValueObject` abstract class.

Do:
```ts
export class Email extends ValueObject<{ value: string }> {
  get value() {
    return this.props.value
  }
}
```

## DTOs Are Classes With Decorators
DTOs are classes, not interfaces, and must use NestJS decorators.

Do:
```ts
export class LoginDto {
  @IsEmail()
  email!: string

  @MinLength(8)
  password!: string
}
```

## NestJS Decorators Are Mandatory
Every NestJS class must use the correct decorators and follow NestJS opinionated patterns. Do not create arbitrary patterns that bypass NestJS DI and lifecycle behavior.

---

## DDD / Kernel

The `@pack/kernel` package is **abstract-only**. It defines domain vocabulary and contracts; implementations live in other packages. Adapters and infrastructure conform to the domain—not the other way around.

### Kernel Is Agnostic
- No implementations: no `UniqueId`, `UniqueEntityId`, or other concrete Id classes. Use a separate package (or local value-objects) for Id implementations.
- No UUID generation: callers provide `eventId` and `occurredOn` when constructing domain events. Use external packages (e.g. `crypto.randomUUID`) where needed.
- No defaults: if meta (`eventId`, `occurredOn`) is required for a domain event, the caller must pass it explicitly.
- No ports that belong elsewhere: `CachePort` lives in `@pack/cache`; `EventBus` lives in `@pack/nats-broker-messaging`.

### Abstractions Use Abstract Classes
Domain abstractions are abstract classes. Use interfaces or type aliases only for primitives (e.g. `IdPrimitive`, `DomainEventPrimitive`, `ObjectPrimitive`).

Do:
```ts
export abstract class EventPayload {}
export abstract class EventError extends Error {}
export abstract class EventMap {
  abstract get eventNames(): readonly string[]
}
```

Don't:
```ts
export type EventPayload = Record<string, unknown>
export interface EventMap {}
```

### Entity Uses Id
`Entity` and `AggregateRoot` use the abstract `Id` type. The caller must supply an `Id` instance (from your Id implementation). There is no default or auto-generated id in kernel.

### Domain Events
- `DomainEvent` requires `meta: { eventId: string; occurredOn: Date }` when constructing. No fallbacks.
- Event props use `ObjectPrimitive` (`Map<string, unknown>`) as the structural constraint.
- `DomainEventPrimitive` is a type (primitive representation) and lives in its own file.

### Package Boundaries
| Abstraction | Package |
|-------------|---------|
| `Id`, `Entity`, `AggregateRoot`, `DomainEvent`, `EventPayload`, `EventMap`, `EventError`, `UseCase`, `ValueObject`, `UnitOfWork` | `@pack/kernel` |
| `CachePort` | `@pack/cache` |
| `EventBus` | `@pack/nats-broker-messaging` |
