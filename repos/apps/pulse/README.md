# 🎵 Pulse

> Next.js frontend for the Pulse streaming platform.

**Pulse** is the user-facing web application built with Next.js 16, React 19, and Tailwind CSS 4. It features a music player with HLS streaming, real-time pipeline visualisation, AI reasoning UI, and a fully slot-based layout architecture.

| | |
|---|---|
| **Package** | `pulse` |
| **Framework** | Next.js 16 (App Router) |
| **Port** | `3000` |
| **State** | Jotai + Immer |

---

## 🏗️ Architecture

### Route Groups

```
app/
├── (public)/                    # Unauthenticated routes
│   └── (auth)/
│       ├── login/               # Login page
│       └── signup/              # Signup page
├── (protected)/                 # Auth-guarded routes
│   └── (player)/               # Player shell
│       ├── layout.tsx           # Grid layout with all slots
│       ├── @gallery/            # Track list / library
│       ├── @uploader/           # Upload dropzone + AI reasoning view
│       ├── @user-menu/          # Avatar + dropdown
│       └── @now-playing/        # Playback bar
│           ├── @track-metadata/ # Song title + artist
│           ├── @playback/       # Prev / Play / Next + scrubber
│           └── @volume-bar/     # Volume control
├── api/                         # BFF proxy routes
│   ├── authority/               # Auth proxy → Authority service
│   ├── slim-shady/profile/      # Profile proxy → Slim Shady
│   ├── soundgarden/tracks/      # Upload proxy → Soundgarden
│   └── transport/hls/           # HLS stream proxy → Mockingbird
└── lib/                         # Shared utilities
```

### Parallel Slots

The player uses Next.js parallel routes (`@slot`) to compose independent UI sections that load and update independently:

```
┌──────────────────────────────────────────────┐
│  @user-menu                                  │
├───────────────────────┬──────────────────────┤
│                       │                      │
│   @gallery            │   @uploader          │
│   (track list)        │   (dropzone /        │
│                       │    reasoning UI)     │
│                       │                      │
├───────────────────────┴──────────────────────┤
│  @now-playing                                │
│  ┌──────────┬───────────────┬──────────────┐ │
│  │@metadata │  @playback    │ @volume-bar  │ │
│  └──────────┴───────────────┴──────────────┘ │
└──────────────────────────────────────────────┘
```

### State Management

- **Jotai** atoms for global state (`currentTrackAtom`, `galleryAtom`, `volumeAtom`, `isReasoningAtom`)
- **Immer** integration for immutable state updates
- Domain types and mocks in `lib/state/`

### HLS Streaming

- `hls.js` for adaptive bitrate playback
- Custom hooks: `useHlsLoader`, `useHlsMediaSession`
- Media Session API integration for OS-level playback controls

### AI Reasoning UI

- **ReasoningPipeline** component shows real-time AI processing steps
- **Reasoning** component (Vercel AI Elements port) for streaming AI output
- **Shimmer** loading animation for processing states

### BFF (Backend-for-Frontend)

Next.js API routes act as a proxy layer between the browser and backend microservices, handling auth tokens and request forwarding.

---

## 🎨 Theming

- **OKLCH colour space** via `@pack/neon-tokens`
- **Tailwind CSS 4** with custom design token mappings
- Neon gradient aesthetic with warm synth / violet palette
- Dark-first design

---

## 📡 Real-time

The frontend connects to **Backstage** via Socket.IO (`/pipeline` namespace) for real-time pipeline event streaming and progress updates.

---

## ⚙️ Environment

See [`.env.template`](.env.template):

| Variable | Description |
|----------|-------------|
| `BFF_BASE_URL` | Self-reference for BFF routes |
| `NEXT_PUBLIC_BACKSTAGE_WS_URL` | Backstage WebSocket URL |
| `NEXT_PUBLIC_BACKSTAGE_WS_NAMESPACE` | Socket.IO namespace |
| `NEXT_PUBLIC_REASONING_IDLE_TIMEOUT_MS` | Reasoning UI idle timeout |
| `BFF_API_TIMEOUT_MS` | BFF request timeout |
| `SOUNDGARDEN_BASE_URL` | Soundgarden upload endpoint |
| `SLIM_SHADY_BASE_URL` | Slim Shady profile endpoint |
| `MOCKINGBIRD_BASE_URL` | HLS stream endpoint |

---

## 📋 Key Dependencies

| Dependency | Purpose |
|------------|---------|
| `next` | Framework (App Router, RSC) |
| `react` | UI library |
| `jotai` + `jotai-immer` | State management |
| `hls.js` | HLS video/audio playback |
| `socket.io-client` | Real-time pipeline events |
| `@ai-sdk/react` | AI streaming components |
| `motion` | Animations |
| `@pack/neon-tokens` | Design tokens |

---

## 🚀 Development

```bash
# From monorepo root
pnpm pulse

# Or directly
pnpm --filter pulse dev
```

The app starts at `http://localhost:3000`.
