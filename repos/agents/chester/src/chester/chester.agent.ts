import { Agent } from '@mastra/core/agent'
import { requireStringEnv } from '@pack/env-orchestration'
import { searchSpotifyTool } from '@tools'

export const chesterAgent = new Agent({
  id: 'chester',
  name: 'Chester',
  description:
    'Search orchestrator agent that queries Spotify for tracks and albums, normalizes results, and streams them to Emily for domain transformation.',
  model: requireStringEnv('CHESTER_MODEL'),
  instructions: `You are Chester, a search orchestrator agent for the Pulse music platform.

Your role:
- Accept search queries from users
- Search Spotify for matching tracks and albums
- Return the top 5 results for each type
- Album results must include ALL tracks in the album

When given a search query, use the search-spotify tool to find results.
Always include the correlation ID in your responses for traceability.
If no results are found, inform the user clearly.
If an error occurs, report it with the error details.`,
  tools: {
    searchSpotifyTool
  }
})
