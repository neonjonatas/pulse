# 📡 @pack/event-inventory

> Centralised NATS event subject catalogue for the Pulse platform.

`@pack/event-inventory` defines the canonical event enums that every microservice uses when publishing or subscribing to NATS subjects. A single source of truth eliminates magic strings and keeps consumers in sync.

---

## 📦 Event Enums

### `AuthorityEvent`

| Member | Subject | Emitter |
|--------|---------|---------|
| `UserSignedUp` | `authority.user.signed_up` | Authority |
| `UserLoggedIn` | `authority.user.logged_in` | Authority |
| `TokenRefreshed` | `authority.token.refreshed` | Authority |
| `UserLoggedOut` | `authority.user.logged_out` | Authority |

### `UserEvent`

| Member | Subject | Emitter |
|--------|---------|---------|
| `ProfileCreated` | `user.profile.created` | Slim Shady |
| `ProfileUpdated` | `user.profile.updated` | Slim Shady |
| `ProfileDeleted` | `user.profile.deleted` | Slim Shady |

### `TrackEvent`

| Member | Subject | Emitter |
|--------|---------|---------|
| `Uploaded` | `track.uploaded` | Soundgarden |
| `PetrifiedGenerated` | `track.petrified.generated` | Petrified |
| `PetrifiedFailed` | `track.petrified.failed` | Petrified |
| `DuplicateDetected` | `track.duplicate.detected` | Petrified |
| `FortMinorStarted` | `track.fort-minor.started` | Fort Minor |
| `FortMinorCompleted` | `track.fort-minor.completed` | Fort Minor |
| `FortMinorFailed` | `track.fort-minor.failed` | Fort Minor |
| `StereoStarted` | `track.stereo.started` | Stereo |
| `Approved` | `track.approved` | Stereo |
| `Rejected` | `track.rejected` | Stereo |
| `StereoFailed` | `track.stereo.failed` | Stereo |
| `HlsGenerated` | `track.hls.generated` | Mockingbird |
| `HlsStored` | `track.hls.stored` | Hybrid Storage |

---

## 🏗️ Project Structure

```
src/
├── domain/
│   ├── authority.events.enum.ts
│   ├── user.events.enum.ts
│   └── track.events.enum.ts
├── event.map.ts
└── index.ts
```

---

## 🔌 Usage

```typescript
import { TrackEvent, AuthorityEvent, UserEvent } from '@pack/event-inventory'

// Publishing
await publisher.publish(TrackEvent.Uploaded, payload)

// Subscribing
@EventConsumer(TrackEvent.PetrifiedGenerated)
async handle(data: ConsumeContext) { ... }
```

---

## 🏷️ Naming Convention

All event subjects follow the pattern:

```
<domain>.<entity>.<past-tense-verb>
```

Examples: `track.uploaded`, `authority.user.signed_up`, `track.fort-minor.completed`.

---

## ➕ Adding a New Event

1. Add the member to the appropriate enum in `src/domain/`
2. Use `snake_case` for the subject string
3. Register the consumer in the target microservice's module
4. Update `.agents/context/EVENTS_PIPELINE.md` if it changes the pipeline flow

---

## 📋 Dependencies

| Dependency | Version |
|------------|---------|
| `typescript` | ^5 |

Zero runtime dependencies.
