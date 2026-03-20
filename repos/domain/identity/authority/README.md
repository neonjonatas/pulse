# 🔐 Authority

> Authentication and authorisation microservice for the Pulse platform.

**Authority** handles user signup, login, logout, token refresh, and Google OAuth flows. It issues JWTs and manages sessions, acting as the identity gateway for every other service.

| | |
|---|---|
| **Package** | `@micro/authority` |
| **Domain** | Identity |
| **Port** | `7000` |
| **Health** | `GET /health` |

---

## 🏗️ Architecture (Clean Architecture)

```
src/authority/
├── domain/              # Entities, Value Objects, Ports, Events
│   ├── entities/        # User, Session
│   ├── value-objects/   # Email, Password
│   ├── ports/           # UserPort, SessionPort, GoogleOAuthPort
│   └── events/          # AuthorityEventBusPort
├── application/         # Use Cases, Services
│   ├── use-cases/       # Signup, Login, Logout, RefreshToken, GoogleSignup, GoogleLogin, Me
│   └── services/        # AuthorityTokenService (JWT minting)
├── infra/               # Adapters, Persistence
│   ├── mongoose/        # MongooseUserAdapter, MongooseSessionAdapter, Schemas
│   ├── oauth/           # GoogleOAuthAdapter
│   ├── session/         # SessionCircuitBreakerAdapter
│   ├── event-bus/       # NATS event bus provider
│   └── db/              # DbConfigFlag enum
└── interface/           # HTTP Controllers, Guards, Consumers
    ├── http/            # AuthorityController, HealthController, Guards, Pipes
    └── consumers/       # UserProfileCreatedConsumer
```

---

## 📡 Transport

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/authority/signup` | Register a new user |
| `POST` | `/authority/login` | Login with email/password |
| `POST` | `/authority/google/signup` | Google OAuth signup |
| `POST` | `/authority/google/login` | Google OAuth login |
| `POST` | `/authority/refresh` | Refresh access token |
| `POST` | `/authority/logout` | Invalidate session |
| `GET` | `/authority/me` | Get current user (guarded) |
| `GET` | `/health` | Health check |

### NATS Events

| Direction | Subject | Description |
|-----------|---------|-------------|
| **Emits** | `authority.user.signed_up` | User registered |
| **Emits** | `authority.user.logged_in` | User logged in |
| **Emits** | `authority.token.refreshed` | Token refreshed |
| **Emits** | `authority.user.logged_out` | User logged out |
| **Consumes** | `user.profile.created` | Slim Shady confirms profile creation |

---

## 🐳 Infrastructure

| Service | Container | Port |
|---------|-----------|------|
| MongoDB | `authority-mongo` | 27017 |
| NATS | `nats` | 4222 |

---

## ⚙️ Environment

See [`.env.template`](.env.template) for all variables:

| Variable | Description |
|----------|-------------|
| `PORT` | HTTP server port (7000) |
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB_NAME` | Database name |
| `JWT_SECRET` | Access token secret |
| `JWT_EXPIRES_IN` | Access token TTL |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NATS_URL` | NATS connection URL |

---

## 🚀 Development

```bash
# From monorepo root
pnpm --filter @micro/authority dev
```
