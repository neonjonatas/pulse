# Agents Guidelines

Agents in `repos/agents/` follow the [General Code Guideline](../../../.agents/rules/GENERAL_CODE_GUIDELINE.md) at the monorepo root. In addition:

## Prefer Absolute Imports

Use `@shinoda/*` path aliases instead of `../` imports. See [shinoda tsconfig paths](../../shinoda/tsconfig.json).

Do:
```ts
import { shinodaAgent } from '@shinoda/shinoda.agent'
import { signalBus } from '@shinoda/signals/signal-bus'
```

Don't:
```ts
import { shinodaAgent } from '../shinoda/shinoda.agent'
import { signalBus } from '../signals/signal-bus'
```

## Agent Structure

Each agent under `repos/agents/<name>/` follows the Mastra convention:

- `src/mastra/index.ts` — Mastra registration (agents, workflows, signal subscribers)
- `src/<name>/` — Agent identity, tools, signals, workflows, knowledge
- Path aliases in `tsconfig.json` map `@<name>/*` to `./src/<name>/*`
