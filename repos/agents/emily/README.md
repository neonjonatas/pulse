# Emily — Transformation & Domain Adapter Agent

Mastra agent that receives streamed Spotify results from **Chester** via MCP, transforms them into the Pulse domain shape, and forwards the result to Pulse and Shinoda via MCP.

## Responsibilities

- Expose MCP server for Chester to stream results
- Transform Spotify results into Pulse domain types (`GalleryTrack`, `Album`)
- Forward transformed results to Pulse via MCP
- Communicate with Shinoda via MCP
- Publish lifecycle events to NATS
- Use circuit breaker for MCP call resilience

## Running

```bash
# From monorepo root
pnpm emily

# Or directly
cd repos/agents/emily && pnpm dev
```

## Environment Variables

See `.env.template` for required configuration.
