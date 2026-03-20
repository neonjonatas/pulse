import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

import { transformAll } from '@transform'
import { transformCircuit } from '@resilience'
import { emilyPublisher } from '@events'

const trackSchema = z.object({
  type: z.literal('track'),
  id: z.string(),
  name: z.string(),
  artists: z.array(z.string()),
  album: z.string(),
  albumId: z.string(),
  albumImageUrl: z.string(),
  durationMs: z.number()
})

const albumTrackRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMs: z.number()
})

const albumSchema = z.object({
  type: z.literal('album'),
  id: z.string(),
  name: z.string(),
  artists: z.array(z.string()),
  imageUrl: z.string(),
  releaseDate: z.string(),
  tracks: z.array(albumTrackRefSchema)
})

const searchResultSchema = z.discriminatedUnion('type', [
  trackSchema,
  albumSchema
])

export const receiveSearchResultTool = createTool({
  id: 'receive-search-result',
  description:
    'Receives search results from Chester (Spotify data), transforms them into Pulse domain shape, and returns the domain objects.',
  inputSchema: z.object({
    correlationId: z.string().describe('Correlation ID for traceability'),
    source: z.string().describe('Source agent'),
    results: z
      .array(searchResultSchema)
      .describe('Spotify search results to transform')
  }),
  execute: async ({ correlationId, source, results }) => {
    await emilyPublisher.searchReceived(correlationId, source, results.length)

    try {
      const domainTracks = await transformCircuit.execute(() =>
        Promise.resolve(transformAll(results))
      )

      await emilyPublisher.searchTransformed(
        correlationId,
        results.length,
        domainTracks.length
      )

      return {
        success: true,
        correlationId,
        tracks: domainTracks,
        inputCount: results.length,
        outputCount: domainTracks.length
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await emilyPublisher.transformFailed(correlationId, message)

      return {
        success: false,
        correlationId,
        error: message
      }
    }
  }
})
