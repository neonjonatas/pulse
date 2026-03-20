import { createWorkflow, createStep } from '@mastra/core/workflows'
import { z } from 'zod'
import axios from 'axios'

import { requireStringEnv } from '@pack/env-orchestration'
import { signalBus } from '../signals/signal-bus'

/** Service to be health-checked. */
interface ServiceEntry {
  name: string
  url: string
}

const SERVICE_REGISTRY: ServiceEntry[] = [
  { name: 'Authority', url: requireStringEnv('AUTHORITY_URL') },
  { name: 'Slim Shady', url: requireStringEnv('SLIM_SHADY_URL') },
  { name: 'Soundgarden', url: requireStringEnv('SOUNDGARDEN_URL') },
  { name: 'Petrified', url: requireStringEnv('PETRIFIED_URL') },
  { name: 'Fort Minor', url: requireStringEnv('FORT_MINOR_URL') },
  { name: 'Stereo', url: requireStringEnv('STEREO_URL') },
  { name: 'Mockingbird', url: requireStringEnv('MOCKINGBIRD_URL') },
  { name: 'Hybrid Storage', url: requireStringEnv('HYBRID_STORAGE_URL') },
  { name: 'Backstage', url: requireStringEnv('BACKSTAGE_URL') }
]

type ServiceStatus = 'healthy' | 'unhealthy' | 'unreachable'

interface ServiceResult {
  name: string
  url: string
  status: ServiceStatus
  responseTimeMs: number
  error?: string
}

const inputSchema = z.object({
  services: z
    .array(z.string())
    .optional()
    .describe('Filter to specific service names. Omit to check all.')
})

const serviceResultSchema = z.object({
  name: z.string(),
  url: z.string(),
  status: z.enum(['healthy', 'unhealthy', 'unreachable']),
  responseTimeMs: z.number(),
  error: z.string().optional()
})

const outputSchema = z.object({
  results: z.array(serviceResultSchema),
  summary: z.object({
    total: z.number(),
    healthy: z.number(),
    unhealthy: z.number(),
    unreachable: z.number()
  }),
  allHealthy: z.boolean()
})

/** Pings a single service's `/health` endpoint and returns the result. */
async function checkHealth(service: ServiceEntry): Promise<ServiceResult> {
  const start = Date.now()
  try {
    const response = await axios.get(`${service.url}/health`, {
      timeout: 5_000
    })
    const responseTimeMs = Date.now() - start
    const isHealthy = response.status >= 200 && response.status < 400
    return {
      name: service.name,
      url: service.url,
      status: isHealthy ? 'healthy' : 'unhealthy',
      responseTimeMs
    }
  } catch (error) {
    const responseTimeMs = Date.now() - start
    const message = error instanceof Error ? error.message : String(error)

    if (axios.isAxiosError(error) && error.response) {
      return {
        name: service.name,
        url: service.url,
        status: 'unhealthy',
        responseTimeMs,
        error: `HTTP ${error.response.status}: ${message}`
      }
    }
    return {
      name: service.name,
      url: service.url,
      status: 'unreachable',
      responseTimeMs,
      error: message
    }
  }
}

const checkAllServicesStep = createStep({
  id: 'check-all-services',
  inputSchema,
  outputSchema,
  execute: async ({ inputData }) => {
    const serviceFilter = inputData.services
    const targets = serviceFilter
      ? SERVICE_REGISTRY.filter((s) =>
          serviceFilter.some((f) => s.name.toLowerCase() === f.toLowerCase())
        )
      : SERVICE_REGISTRY

    const results = await Promise.all(targets.map(checkHealth))

    for (const result of results) {
      if (result.status !== 'healthy') {
        signalBus.emit('SERVICE_UNHEALTHY', {
          service: result.name,
          url: result.url,
          error: result.error ?? `Status: ${result.status}`,
          timestamp: new Date().toISOString()
        })
      }
    }

    const summary = {
      total: results.length,
      healthy: results.filter((r) => r.status === 'healthy').length,
      unhealthy: results.filter((r) => r.status === 'unhealthy').length,
      unreachable: results.filter((r) => r.status === 'unreachable').length
    }

    return {
      results,
      summary,
      allHealthy: summary.unhealthy === 0 && summary.unreachable === 0
    }
  }
})

export const healthPipelineWorkflow = createWorkflow({
  id: 'health-pipeline',
  description:
    'Check the health of all Pulse platform services and emit signals for any unhealthy ones',
  inputSchema,
  outputSchema
})
  .then(checkAllServicesStep)
  .commit()
