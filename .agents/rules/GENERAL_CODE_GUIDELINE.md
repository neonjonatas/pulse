---
alwaysApply: true
---

# General Code Guideline

## Prefer Absolute Imports
Use absolute paths configured in `tsconfig` instead of `../` imports. Relative imports are allowed only for same-level files using `./`.

Do:
```ts
import { LoginForm } from '@login/ui'
import { getFieldErrors } from '@lib/ui'
import { mapEmailChange } from './form.mappers'
```

Don't:
```ts
import { LoginForm } from '../../../lib/ui'
import { getFieldErrors } from '../../../../../lib/ui'
```

### Microservice Path Aliases
For microservices, `tsconfig` path aliases must point directly to the four Clean Architecture folders under `./src/{service}`: `application`, `domain`, `interface`, and `infra`. Do not use service-name absolute imports in code; always use the `@application`, `@domain`, `@infra`, and `@interface` aliases.

Do:
```json
{
  "baseUrl": ".",
  "paths": {
    "@application/*": ["./src/mocking-bird/application/*"],
    "@domain/*": ["./src/mocking-bird/domain/*"],
    "@infra/*": ["./src/mocking-bird/infra/*"],
    "@interface/*": ["./src/mocking-bird/interface/*"]
  }
}
```

Do:
```ts
import { SegmentStorePort } from '@domain/ports'
```

Don't:
```json
{
  "paths": {
    "@application/*": ["mocking-bird/application/*"],
    "@domain/*": ["mocking-bird/domain/*"],
    "@infra/*": ["mocking-bird/infra/*"],
    "@interface/*": ["mocking-bird/interface/*"]
  }
}
```

Don't:
```ts
import { SegmentStorePort } from 'mocking-bird/domain/ports'
```

### Kebab-Case File Naming
All files across apps, packages, and domains must be named in kebab-case.

Do:
```text
form.handlers.tsx
mocking-bird.module.ts
circuit-breaker.ts
```

Don't:
```text
formHandlers.tsx
MockingBird.module.ts
circuitBreakerOpen.error.ts
```

### Inline Type Avoidance In Use Cases
When a use case or other class needs a non-trivial object type (for example the output of a `UseCase` generic), define an `interface` directly above the class in the same module instead of inlining the object type.

Do:
```ts
export interface GetSegmentResult {
  data: Buffer
  contentType: string
}

export class GetSegmentUseCase extends UseCase<
  [trackId: string, segment: string],
  GetSegmentResult
> {}
```

Don't:
```ts
export class GetSegmentUseCase extends UseCase<
  [trackId: string, segment: string],
  { data: Buffer; contentType: string }
> {}
```

### Prefer `interface` Over `type` For Object Shapes
Avoid `type` aliases when an `interface` is sufficient. Reserve `type` for unions, intersections, primitives, mapped types, or other cases where `interface` cannot express the shape.

Do:
```ts
export interface TokenPayload {
  sub: string
  email: string
  sid: string
  provider: AuthProvider
}
```

Don't:
```ts
export type TokenPayload = {
  sub: string
  email: string
  sid: string
  provider: AuthProvider
}
```

### Domain Abstractions: Abstract Classes; Types Only For Primitives
For domain contracts and DDD primitives, use abstract classes—not interfaces or type aliases. Reserve interfaces and type aliases for primitive representations (e.g. `IdPrimitive`, `DomainEventPrimitive`, `ObjectPrimitive`).

Do:
```ts
export abstract class EventPayload {}
export type DomainEventPrimitive = { eventId: string; payload: unknown }
```

Don't:
```ts
export type EventPayload = Record<string, unknown>
export abstract class DomainEventPrimitive {}
```

### Descriptive Generics Only
In TypeScript, use meaningful words for generic names instead of single-letter placeholders. Never prefix a generic with `T`—just name it after what it represents so intent is obvious at the declaration site.

Do:
```ts
export type Mapper<Input, Output> = (value: Input) => Output
```

Don't:
```ts
export type Mapper<TInput, TOutput> = (value: TInput) => TOutput
export type Mapper<T> = (value: T) => string
```

### Import Order
Keep imports in this order with a blank line between groups: third-party, absolute, relative.

Do:
```ts
import { z } from 'zod'
import Link from 'next/link'

import { LoginForm } from '@login/ui'
import { cn } from '@lib/template'

import { loginFormState } from './form-state.data'
```

Don't:
```ts
import { loginFormState } from './form-state.data'
import { cn } from '@lib/template'
import Link from 'next/link'
```

### Test Description Format
All test descriptions must start with the microservice name (or the application name for frontend). Format: `service/layer/file` in kebab case, using the first layer only (`interface`, `application`, `infrastructure`, or `domain`). The description must be the file name, not the exported class name.

Do:
```ts
describe('mocking-bird/application/start-playback.usecase', () => {})
describe('auth/application/login.usecase', () => {})
```

Don't:
```ts
describe('StartPlaybackUseCase', () => {})
describe('LoginUseCase', () => {})
```

Front-end examples:
```ts
describe('pulse/login/login-form', () => {})
describe('pulse/@gallery/track-item', () => {})
```

### Semantic Suffixes
Kebab-case filenames use semantic suffixes to explain the file’s responsibility. This makes intent obvious at the import site and keeps naming consistent across the codebase.

Custom React hooks may end with either `.hook` or `.hooks`; prefer `.hooks` when multiple hooks reside in the same file.

| Suffix | Description | Scope |
| --- | --- | --- |
| `.abstract` | Abstract base class or contract intended for extension. | Back-end |
| `.adapter` | Infrastructure adapter that implements a port or integrates with an external system. | Back-end |
| `.action` | Server action or command-style function. | Front-end |
| `.atom` | Jotai atom definition. | Front-end |
| `.compute` | Pure computation or derived calculation utilities. | Both |
| `.controller` | NestJS controller for HTTP or message endpoints. | Back-end |
| `.interceptor` | NestJS interceptor (generic cross-cutting logic such as caching, circuit breaking). | Back-end |
| `.data` | Static data, defaults, or initial state. | Both |
| `.domain` | Domain model or domain-specific module entry. | Back-end |
| `.dto` | Data transfer object (class with decorators). | Back-end |
| `.enum` | Enum definitions. | Both |
| `.event` | Domain event definition. | Back-end |
| `.fmt` | Formatting helpers (string/number/date). | Both |
| `.guard` | NestJS guard or UI route guard. | Both |
| `.handlers` | Event or interaction handlers. | Front-end |
| `.hooks` | Custom React hooks. | Front-end |
| `.map` | Single mapping helper or transform. | Both |
| `.mappers` | Collection of mapping helpers or state mutators. | Front-end |
| `.mock` | Single mock implementation or fixture. | Both |
| `.mocks` | Multiple mocks or fixture collection. | Both |
| `.pipe` | NestJS pipe or data transform pipeline. | Back-end |
| `.port` | Port definition (abstract class). | Back-end |
| `.service` | Service class with business or orchestration logic. | Back-end |
| `.state` | State container or state contract. | Front-end |
| `.type` | Single type definition. | Both |
| `.types` | Multiple type definitions. | Both |
| `.usecase` | Use case class. | Back-end |
| `.value-object` | Value object class. | Back-end |

### `.service` Files Must Be Class-Based
Any file using the `.service` suffix must export a class as its primary implementation. Do not use `.service` for standalone function modules. For function-only modules, use an appropriate suffix such as `.compute`, `.data`, `.map`, or `.mappers`.

### Never Default Environment Variables
Do not provide hardcoded fallback values for required environment variables in code. If an env var is required for runtime behavior, fail fast during startup/build when it is missing. The corresponding `.env.template` must define all required keys.
