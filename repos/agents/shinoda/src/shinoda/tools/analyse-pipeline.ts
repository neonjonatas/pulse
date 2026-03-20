import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import axios from 'axios'

import { requireStringEnv } from '@pack/env-orchestration'

export const analysePipelineTool = createTool({
  id: 'analyse-pipeline',
  description:
    'Query Backstage to retrieve pipeline state for a specific track or list pipelines filtered by status (all, active, failed)',
  inputSchema: z.object({
    trackId: z.string().optional().describe('Specific track ID to inspect'),
    filter: z
      .enum(['all', 'active', 'failed'])
      .optional()
      .default('all')
      .describe('Filter pipelines by status when no trackId is provided')
  }),
  execute: async ({ trackId, filter }) => {
    const baseUrl = requireStringEnv('BACKSTAGE_URL')

    try {
      if (trackId) {
        const response = await axios.get(`${baseUrl}/pipelines/${trackId}`, {
          timeout: 10_000
        })
        return { success: true as const, data: response.data }
      }

      const path =
        filter === 'active'
          ? '/pipelines/active'
          : filter === 'failed'
            ? '/pipelines/failed'
            : '/pipelines'

      const response = await axios.get(`${baseUrl}${path}`, {
        timeout: 10_000
      })
      return { success: true as const, data: response.data }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            success: false as const,
            error: `Pipeline not found for track: ${trackId}`
          }
        }
        return {
          success: false as const,
          error: `Backstage unreachable at ${baseUrl}: ${error.message}. Run \`pnpm infra\` to start infrastructure.`
        }
      }
      return {
        success: false as const,
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }
})
