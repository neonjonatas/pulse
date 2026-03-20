import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

import { searchAll } from '@spotify/spotify-client'
import { spotifyCircuit } from '@resilience'
import { chesterPublisher } from '@events'
import type { SpotifySearchResult } from '@chester-types/search-result.type'

export const searchSpotifyTool = createTool({
  id: 'search-spotify',
  description:
    'Search Spotify for tracks and albums matching a query. Returns top 5 results for each type. Album results include all tracks.',
  inputSchema: z.object({
    query: z
      .string()
      .describe('The search query (artist, track, or album name)'),
    limit: z
      .number()
      .optional()
      .default(5)
      .describe('Maximum results per type (default 5)')
  }),
  execute: async ({ query, limit }) => {
    const correlationId = crypto.randomUUID()
    const startTime = Date.now()

    await chesterPublisher.searchStarted(correlationId, query)

    try {
      const results: SpotifySearchResult[] = await spotifyCircuit.execute(() =>
        searchAll(query, limit)
      )

      if (results.length === 0) {
        await chesterPublisher.searchNotFound(correlationId, query)
        return {
          success: true,
          correlationId,
          results: [],
          message: `No results found for "${query}"`
        }
      }

      const latencyMs = Date.now() - startTime
      await chesterPublisher.searchEnded(
        correlationId,
        query,
        results.length,
        latencyMs
      )

      return {
        success: true,
        correlationId,
        results,
        resultCount: results.length,
        latencyMs
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await chesterPublisher.searchFailed(correlationId, query, message)

      return {
        success: false,
        correlationId,
        error: message
      }
    }
  }
})
