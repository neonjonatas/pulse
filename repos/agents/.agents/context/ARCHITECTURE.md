# Agent Architecture Reference

This document is the canonical reference for building Mastra-based agents in the `repos/agents/` workspace. It is distilled from the Shinoda implementation.

---

## Workspace Structure

```
agents/<agent-name>/
  .env.template              # All required environment variables with defaults
  .gitignore                 # Ignore .mastra/, dist/, node_modules/, .env
  package.json               # @agent/<name> workspace package
  tsconfig.json              # Absolute paths with @<alias>/* mappings
  tsconfig.build.json        # Extends tsconfig, emits to dist/
  src/
    index.ts                 # Barrel export of the agent
    mastra/
      index.ts               # Mastra instance registration (agents, workflows)
    <agent-name>/
      <agent-name>.agent.ts  # Agent definition (instructions, model, tools)
      tools/
        index.ts             # Barrel export of all tools
        <tool-name>.ts       # Individual tool files
      signals/
        index.ts             # Barrel export of signal layer
        <agent>-events.ts    # Typed event contracts (interfaces)
        signal-bus.ts         # Typed EventEmitter singleton
        anomaly-rules.ts     # Pure functions that evaluate state and emit signals
        monitor.ts           # Continuous monitoring (Socket.IO + polling)
      workflows/
        <workflow>.workflow.ts  # Multi-step workflow definitions
      knowledge/
        <topic>.md           # Domain knowledge documents (inlined into instructions)
```

## package.json Conventions

```json
{
  "name": "@agent/<name>",
  "type": "module",
  "scripts": {
    "dev": "mastra dev",
    "build": "tsc -p tsconfig.build.json",
    "start": "mastra start",
    "typecheck": "tsc --noEmit"
  }
}
```

Key dependencies: `@mastra/core`, `zod`, `axios` (for HTTP tools). Add `socket.io-client` if using real-time monitoring. Dev dependencies: `mastra` (CLI), `typescript`, `@types/node`.

## tsconfig Pattern

```json
{
  "compilerOptions": {
    "noEmit": true,
    "baseUrl": ".",
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "paths": {
      "@<agent>/*": ["./src/<agent>/*"],
      "@mastra/*": ["./src/mastra/*"],
      "@signals/*": ["./src/<agent>/signals/*"]
    }
  },
  "include": ["src"]
}
```

Use absolute `./` prefixed paths in `paths` aliases. The `tsconfig.build.json` extends this with `"noEmit": false, "outDir": "dist"`.

---

## Agent Definition

```typescript
import { Agent } from '@mastra/core/agent'

export const myAgent = new Agent({
  id: '<agent-id>',
  name: '<agent-name>',
  model: process.env.MODEL ?? 'openai:gpt-4o-mini',
  instructions: `<system prompt with inlined domain knowledge>`,
  tools: { tool1, tool2, tool3 }
})
```

### Instructions Strategy

Agent knowledge lives in `knowledge/*.md` files as the source of truth during development. The actual instructions string is a comprehensive system prompt that inlines the essential knowledge directly. This avoids filesystem access at runtime.

Instructions should include:
- Agent role and identity
- Platform/service topology
- Event pipeline documentation
- Event inventory (producer/consumer table)
- Diagnostic guidelines
- Output format expectations
- Guardrails (e.g. read-only, never modify state)

---

## Tool Design Pattern

```typescript
import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import axios from 'axios'

export const myTool = createTool({
  id: '<tool-id>',
  description: '<when the agent should use this tool>',
  inputSchema: z.object({
    param: z.string().describe('What this param does')
  }),
  execute: async ({ param }) => {
    const url = process.env.SERVICE_URL ?? 'http://localhost:PORT'
    try {
      const res = await axios.get(`${url}/endpoint`, { timeout: 10_000 })
      return { success: true as const, data: res.data }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return { success: false as const, error: error.message }
      }
      return { success: false as const, error: String(error) }
    }
  }
})
```

### Tool Guidelines

- Use `zod` for input validation with `.describe()` on each field
- `outputSchema` is optional — omit it to avoid zod version compatibility issues
- All HTTP calls use `axios` with explicit timeouts (5s for health checks, 10s for data queries)
- Wrap all external calls in `try/catch` with `axios.isAxiosError()` checks
- Return structured `{ success, data?, error? }` objects
- Service URLs are always env-configurable with localhost defaults
- When infrastructure is down, return a helpful error suggesting `pnpm infra`

---

## Signal Layer Pattern

The signal layer provides typed event emission for anomaly detection and operational signals.

### Event Contracts

```typescript
export interface AgentEventMap {
  SOME_SIGNAL: {
    entityId: string
    description: string
    timestamp: string
  }
}
```

Define all signal payloads as exported interfaces in a single `*-events.ts` file.

### Signal Bus

```typescript
import { EventEmitter } from 'node:events'

class AgentSignalBus extends EventEmitter {
  override emit<K extends keyof AgentEventMap>(
    event: K, payload: AgentEventMap[K]
  ): boolean { return super.emit(event, payload) }

  override on<K extends keyof AgentEventMap>(
    event: K, listener: (payload: AgentEventMap[K]) => void
  ): this { return super.on(event, listener) }
}

export const signalBus = new AgentSignalBus()
```

The bus is a typed singleton wrapping Node's `EventEmitter`.

### Anomaly Rules

Rules are pure functions that evaluate state and emit signals:

```typescript
export function someRule(state: StateType): void {
  if (/* anomaly condition */) {
    signalBus.emit('SOME_SIGNAL', { /* payload */ })
  }
}
```

### Continuous Monitoring

The monitor class combines:
1. **Primary**: Socket.IO connection for real-time events
2. **Fallback**: HTTP polling on an interval for reconciliation

```typescript
class Monitor {
  start(): void { /* connect socket, start poll timer */ }
  stop(): void  { /* disconnect, clear timer */ }
}
```

---

## Workflow Composition

```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'

const step1 = createStep({
  id: 'step-1',
  inputSchema: z.object({ ... }),
  outputSchema: z.object({ ... }),
  execute: async ({ inputData }) => { return { ... } }
})

export const myWorkflow = createWorkflow({
  id: 'my-workflow',
  inputSchema: z.object({ ... }),
  outputSchema: z.object({ ... })
})
  .then(step1)
  .then(step2)
  .commit()
```

Each step's `outputSchema` must match the next step's `inputSchema`. Use `z.any()` for complex nested types to avoid zod version compatibility issues.

---

## Mastra Registration

```typescript
import { Mastra } from '@mastra/core'

export const mastra = new Mastra({
  agents: { myAgent },
  workflows: { 'workflow-id': myWorkflow }
})
```

Register signal bus subscribers in this file to log all signal emissions:

```typescript
signalBus.on('SIGNAL_NAME', (payload) => {
  console.log(`[agent:signal] SIGNAL_NAME — ${JSON.stringify(payload)}`)
})
```

---

## Environment Configuration

Create `.env.template` with all required variables:

```
OPENAI_API_KEY=
MODEL=openai:gpt-4o-mini
SERVICE_URL=http://localhost:PORT
MONITOR_POLL_INTERVAL_MS=30000
```

---

## Development Commands

```bash
pnpm --filter @agent/<name> dev         # Start Mastra dev server (port 4111)
pnpm --filter @agent/<name> typecheck   # Verify TypeScript
pnpm --filter @agent/<name> build       # Compile to dist/
```

## Validation Checklist

- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm dev` starts Mastra Studio at http://localhost:4111
- [ ] Agent responds to basic domain questions using inlined knowledge
- [ ] All tools handle unreachable services gracefully
- [ ] Signal bus emits typed events for detected anomalies
- [ ] `.env.template` documents all required variables
