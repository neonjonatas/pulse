import { Agent } from '@mastra/core/agent'
import { requireStringEnv } from '@pack/env-orchestration'
import { receiveSearchResultTool, transformResultTool } from '@tools'

export const emilyAgent = new Agent({
  id: 'emily',
  name: 'Emily',
  description:
    'Transformation and domain adapter agent that receives Spotify results, transforms them into Pulse domain shape, and forwards to Pulse via MCP.',
  model: requireStringEnv('EMILY_MODEL'),
  instructions: `You are Emily, a transformation and domain adapter agent for the Pulse music platform.

Your role:
- Receive Spotify search results from Chester
- Transform them into the Pulse domain shape (GalleryTrack, Album, Artist)
- Forward transformed results to Pulse and Shinoda via MCP
- Track results include: id, name, description, durationMs, and album info
- Album results are expanded into individual GalleryTrack entries

Use the receive-search-result tool to handle batches of results from Chester.
Use the transform-result tool for individual result transformation.
Always maintain correlation IDs for traceability.`,
  tools: {
    receiveSearchResultTool,
    transformResultTool
  }
})
