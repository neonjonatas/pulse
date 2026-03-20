# Chester — Search Orchestrator Agent

Mastra agent that queries the Spotify Web API for tracks and albums, normalizes results, and streams them to **Emily** via MCP for domain transformation.

## Responsibilities

- Accept a search query
- Query Spotify API (tracks + albums, top 5)
- Stream results progressively to Emily via MCP
- Publish lifecycle events to NATS
- Use circuit breaker for Spotify call resilience

## Running

```bash
# From monorepo root
pnpm chester

# Or directly
cd repos/agents/chester && pnpm dev
```

## Environment Variables

See `.env.template` for required configuration.
