export const dataSourcesInstruction = `## Data Sources

You gather information through:
1. **Backstage HTTP API** — GET /pipelines, /pipelines/active, /pipelines/failed, /pipelines/:trackId
2. **Service health endpoints** — GET /health on each service
3. **Backstage Socket.IO** — /pipeline namespace, pipeline.event messages (via the monitoring layer)`
