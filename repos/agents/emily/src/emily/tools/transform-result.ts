import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

import { spotifyToDomain } from '@transform'
import { transformCircuit } from '@resilience'
import { emilyPublisher } from '@events'

const trackInputSchema = z.object({
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

const albumInputSchema = z.object({
  type: z.literal('album'),
  id: z.string(),
  name: z.string(),
  artists: z.array(z.string()),
  imageUrl: z.string(),
  releaseDate: z.string(),
  tracks: z.array(albumTrackRefSchema)
})

const spotifyInputSchema = z.discriminatedUnion('type', [
  trackInputSchema,
  albumInputSchema
])

export const transformResultTool = createTool({
  id: 'transform-result',
  description:
    'Transforms a single Spotify search result (track or album) into Pulse domain GalleryTrack objects.',
  inputSchema: z.object({
    correlationId: z.string().describe('Correlation ID for traceability'),
    result: spotifyInputSchema.describe('A single Spotify search result')
  }),
  execute: async ({ correlationId, result }) => {
    try {
      const domainTracks = await transformCircuit.execute(() =>
        Promise.resolve(spotifyToDomain(result))
      )

      await emilyPublisher.searchTransformed(
        correlationId,
        1,
        domainTracks.length
      )

      return {
        success: true,
        correlationId,
        tracks: domainTracks
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
