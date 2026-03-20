# 🗄️ @pack/cache

> Port-adapter cache abstraction over Redis for the Pulse platform.

`@pack/cache` provides a generic caching contract (`CachePort`) and a Redis adapter (`RedisCacheAdapter`) that serialises values as JSON with optional TTL support.

---

## 📦 Exports

| Export | Kind | Description |
|--------|------|-------------|
| `CachePort` | Abstract class | Contract: `get<T>`, `set<T>`, `delete` |
| `RedisCacheAdapter` | Class | Implementation backed by a `RedisLike` client |
| `RedisLike` | Interface | Minimal Redis client shape (`get`, `set`, `del`, `setex`) |

---

## 🔌 Usage

```typescript
import { CachePort, RedisCacheAdapter } from '@pack/cache'

// Inject via DI
const cache: CachePort = new RedisCacheAdapter(redisClient)

// Store with 60-second TTL
await cache.set('track:abc', { status: 'processing' }, 60)

// Retrieve
const data = await cache.get<{ status: string }>('track:abc')

// Remove
await cache.delete('track:abc')
```

### NestJS Provider Pattern

```typescript
{
  provide: CachePort,
  useFactory: (redis: RedisLike) => new RedisCacheAdapter(redis),
  inject: ['REDIS_CLIENT']
}
```

---

## 🏗️ Project Structure

```
src/
├── ports/
│   └── cache.port.ts       # Abstract CachePort
├── adapters/
│   └── redis.adapter.ts    # RedisCacheAdapter + RedisLike interface
└── index.ts
```

---

## 📋 Dependencies

| Dependency | Version |
|------------|---------|
| `@pack/event-inventory` | workspace:* |
| `typescript` | ^5 |
