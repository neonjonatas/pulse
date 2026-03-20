# Event Naming Standard

This standard codifies the event naming rules described in `.agents/context/EVENT_ARCHITECTURE.md` into an enforceable convention. All NATS event subjects in the Pulse platform must follow these rules.

---

## Format

```
<domain>.<entity>.<state>
```

All segments are lowercase, dot-delimited. The terminal segment (`<state>`) must always be in the **past tense** because events represent facts that already happened.

---

## Rules

### Rule 1: Past-Tense Terminal Segment

The final segment must be a past-tense verb or past participle.

| Correct | Wrong |
|---------|-------|
| `track.upload.received` | `track.upload.receive` |
| `track.upload.validated` | `track.validate` |
| `track.fort-minor.completed` | `track.fort-minor.complete` |
| `authority.user.signed_up` | `authority.user.signup` |

### Rule 2: Domain Prefix

Every event must start with its domain prefix. Domain prefixes map to bounded contexts:

| Domain Prefix | Bounded Context | Producer Services |
|---------------|----------------|-------------------|
| `track.*` | Streaming + AI pipeline | Soundgarden, Petrified, Fort Minor, Stereo, Mockingbird, Hybrid Storage |
| `authority.*` | Authentication lifecycle | Authority |
| `user.*` | User profile lifecycle | Slim Shady |
| `chester.*` | Search orchestration | Chester (agent) |
| `emily.*` | Data transformation | Emily (agent) |

### Rule 3: No Ambiguous Terminal States

Avoid final states that do not describe what happened. Events must be specific about the fact they represent.

| Correct | Wrong | Why |
|---------|-------|-----|
| `track.hls.stored` | `track.ready` | "Ready" does not describe what happened |
| `track.fort-minor.completed` | `track.processed` | "Processed" is ambiguous across stages |

### Rule 4: Use `failed` for Errors

Error events use `failed` as the terminal segment (past tense of "fail").

```
track.upload.failed
track.petrified.failed
track.fort-minor.failed
track.stereo.failed
track.transcoding.failed
track.hls.failed
chester.search.failed
emily.transform.failed
```

### Rule 5: Use `started` / `completed` for Async Operations

Long-running asynchronous operations emit a pair of events marking the start and end.

```
track.fort-minor.started   → track.fort-minor.completed
track.stereo.started       → track.approved / track.rejected
track.transcoding.started  → track.transcoding.completed
```

### Rule 6: Use Underscores Only for Multi-Word States

When a state is multi-word, use underscores within the terminal segment. Never use camelCase or kebab-case in the terminal segment.

| Correct | Wrong |
|---------|-------|
| `authority.user.signed_up` | `authority.user.signedUp` |
| `authority.user.logged_in` | `authority.user.logged-in` |
| `chester.search.not_found` | `chester.search.notFound` |

---

## Forbidden Patterns

| Pattern | Why | Fix |
|---------|-----|-----|
| Imperative verbs (`transcribe.track`) | Events are facts, not commands | `track.fort-minor.completed` |
| Present tense (`track.uploading`) | Events happen after the fact | `track.upload.received` |
| Generic states (`track.ready`, `track.done`) | Ambiguous | Use specific stage + state |
| CamelCase segments (`track.fortMinor.completed`) | Convention is lowercase dot-delimited | `track.fort-minor.completed` |
| Deeply nested (>3 segments without domain justification) | Keep subjects scannable | `track.petrified.song.found` is acceptable (4 segments with clear meaning) |

---

## Complete Event Inventory

### TrackEvent (24 subjects)

```
track.upload.received
track.upload.validated
track.upload.stored
track.uploaded
track.upload.failed
track.petrified.generated
track.petrified.song.found
track.petrified.song.unknown
track.petrified.detected
track.petrified.failed
track.duplicate.detected
track.fort-minor.started
track.fort-minor.completed
track.fort-minor.failed
track.stereo.started
track.approved
track.rejected
track.stereo.failed
track.transcoding.started
track.transcoding.completed
track.transcoding.failed
track.hls.generated
track.hls.stored
track.hls.failed
```

### AuthorityEvent (4 subjects)

```
authority.user.signed_up
authority.user.logged_in
authority.token.refreshed
authority.user.logged_out
```

### UserEvent (3 subjects)

```
user.profile.created
user.profile.updated
user.profile.deleted
```

### ChesterEvent (5 subjects)

```
chester.search.started
chester.search.ended
chester.search.failed
chester.search.not_found
chester.emily.streamed
```

### EmilyEvent (4 subjects)

```
emily.search.received
emily.search.transformed
emily.transform.failed
emily.search.returned
```

---

## Enforcement

- Event subjects are defined as TypeScript enums in `@pack/event-inventory` (`repos/packages/event-inventory/src/domain/`)
- Adding a new event requires adding an enum member following this standard
- Code review must verify past-tense terminal segments and correct domain prefixes
- The event schema files in `.agents/schemas/events/` must be updated when inventory enums change
