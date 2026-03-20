import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import axios from 'axios'

import { requireStringEnv } from '@pack/env-orchestration'
import { TrackEvent } from '@pack/event-inventory'

const EXPECTED_SEQUENCE: string[] = [
  TrackEvent.Uploaded,
  TrackEvent.PetrifiedGenerated,
  TrackEvent.FortMinorStarted,
  TrackEvent.FortMinorCompleted,
  TrackEvent.StereoStarted,
  TrackEvent.Approved,
  TrackEvent.HlsGenerated,
  TrackEvent.HlsStored
]

const TERMINAL_EVENTS: string[] = [
  TrackEvent.Rejected,
  TrackEvent.DuplicateDetected,
  TrackEvent.PetrifiedFailed,
  TrackEvent.FortMinorFailed,
  TrackEvent.StereoFailed
]

interface PipelineEvent {
  eventType: string
  timestamp: string
  payload: Record<string, unknown>
}

function findGaps(events: PipelineEvent[]) {
  const observed = new Set(events.map((e) => e.eventType))
  const gaps: Array<{
    after: string
    expected: string
    description: string
  }> = []

  const hasTerminal = events.some((e) => TERMINAL_EVENTS.includes(e.eventType))
  if (hasTerminal) return gaps

  for (let i = 0; i < EXPECTED_SEQUENCE.length - 1; i++) {
    const current = EXPECTED_SEQUENCE[i]
    const next = EXPECTED_SEQUENCE[i + 1]
    if (observed.has(current) && !observed.has(next)) {
      gaps.push({
        after: current,
        expected: next,
        description: `Expected "${next}" after "${current}" but it was not observed`
      })
      break
    }
  }

  return gaps
}

export const inspectEventsTool = createTool({
  id: 'inspect-events',
  description:
    'Inspect pipeline events for a track, optionally filtered by event type. Identifies gaps in the expected event sequence.',
  inputSchema: z.object({
    trackId: z.string().describe('Track ID to inspect events for'),
    eventType: z
      .string()
      .optional()
      .describe(
        'Filter events by type pattern (e.g. "track.petrified" matches all petrified events)'
      )
  }),
  execute: async ({ trackId, eventType }) => {
    const baseUrl = requireStringEnv('BACKSTAGE_URL')

    try {
      const response = await axios.get(`${baseUrl}/pipelines/${trackId}`, {
        timeout: 10_000
      })

      const pipeline = response.data
      let events: PipelineEvent[] = pipeline.events ?? []

      if (eventType) {
        events = events.filter((e: PipelineEvent) =>
          e.eventType.includes(eventType)
        )
      }

      const terminal = (pipeline.events as PipelineEvent[])?.find((e) =>
        TERMINAL_EVENTS.includes(e.eventType)
      )

      const gaps = findGaps(pipeline.events ?? [])

      return {
        success: true as const,
        trackId,
        events,
        totalEvents: events.length,
        gaps,
        terminalEvent: terminal?.eventType ?? null
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false as const,
            trackId,
            error: `No pipeline found for track: ${trackId}`
          }
        }
        return {
          success: false as const,
          trackId,
          error: `Backstage unreachable at ${baseUrl}: ${error.message}. Run \`pnpm infra\` to start infrastructure.`
        }
      }
      return {
        success: false as const,
        trackId,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }
})
