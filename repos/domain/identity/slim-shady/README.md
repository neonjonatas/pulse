# 👤 Slim Shady

> User profile microservice for the Pulse platform.

**Slim Shady** manages user profiles, preferences, and onboarding. It reacts to signup events from Authority and provides profile CRUD for the frontend.

| | |
|---|---|
| **Package** | `@micro/slim-shady` |
| **Domain** | Identity |
| **Port** | `7400` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/slim-shady/
├── domain/              # Entities, Events, Ports
│   ├── entities/        # UserProfile
│   ├── events/          # ProfileCreated, ProfileUpdated, ProfileDeleted
│   └── ports/           # UserPort
├── application/         # Use Cases
│   └── use-cases/       # CreateUserProfile, UpdateUserProfile, GetUserProfile,
│                        # GetUserProfileByAuthId, UpdateUserPreferences, CompleteOnboarding
├── infra/               # Adapters, Persistence
│   ├── mongoose/        # MongooseUserAdapter, Schema
│   └── event-bus/       # NATS event bus provider
└── interface/           # HTTP Controllers, Consumers
    ├── http/            # UserProfileController, HealthController, Pipes
    └── consumers/       # UserSignedUpConsumer
```

---

## 📡 Transport

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/profiles` | Create profile |
| `GET` | `/profiles/:id` | Get profile by ID |
| `PATCH` | `/profiles/:id` | Update profile |
| `PATCH` | `/profiles/:id/preferences` | Update preferences |
| `POST` | `/profiles/:id/onboarding` | Complete onboarding |
| `GET` | `/health` | Health check |

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Emits** | `user.profile.created` | Profile was created |
| **Emits** | `user.profile.updated` | Profile was updated |
| **Consumes** | `authority.user.signed_up` | Triggers automatic profile creation |

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| MongoDB | `slim-shady-mongo` | 27018 |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7400) |
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB_NAME` | Database name |
| `NATS_URL` | NATS connection URL |

---

## 🚀 Development

```bash
pnpm --filter @micro/slim-shady dev
```
