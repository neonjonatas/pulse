import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import axios from 'axios'

import { requireStringEnv } from '@pack/env-orchestration'

interface ServiceEntry {
  name: string
  url: string
  healthPath: string
}

const SERVICE_REGISTRY: ServiceEntry[] = [
  {
    name: 'Authority',
    url: requireStringEnv('AUTHORITY_URL'),
    healthPath: '/health'
  },
  {
    name: 'Slim Shady',
    url: requireStringEnv('SLIM_SHADY_URL'),
    healthPath: '/health'
  },
  {
    name: 'Soundgarden',
    url: requireStringEnv('SOUNDGARDEN_URL'),
    healthPath: '/health'
  },
  {
    name: 'Petrified',
    url: requireStringEnv('PETRIFIED_URL'),
    healthPath: '/health'
  },
  {
    name: 'Fort Minor',
    url: requireStringEnv('FORT_MINOR_URL'),
    healthPath: '/health'
  },
  {
    name: 'Stereo',
    url: requireStringEnv('STEREO_URL'),
    healthPath: '/health'
  },
  {
    name: 'Mockingbird',
    url: requireStringEnv('MOCKINGBIRD_URL'),
    healthPath: '/health'
  },
  {
    name: 'Hybrid Storage',
    url: requireStringEnv('HYBRID_STORAGE_URL'),
    healthPath: '/health'
  },
  {
    name: 'Backstage',
    url: requireStringEnv('BACKSTAGE_URL'),
    healthPath: '/health'
  }
]

type ServiceStatus = 'healthy' | 'unhealthy' | 'unreachable'

interface ServiceResult {
  name: string
  url: string
  status: ServiceStatus
  responseTimeMs: number
  error?: string
}

async function checkHealth(service: ServiceEntry): Promise<ServiceResult> {
  const start = Date.now()
  try {
    const response = await axios.get(`${service.url}${service.healthPath}`, {
      timeout: 5_000
    })
    const responseTimeMs = Date.now() - start
    const isHealthy = response.status >= 200 && response.status < 500
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

export const checkServicesTool = createTool({
  id: 'check-services',
  description:
    'Health-check all Pulse platform services and report their status with response times',
  inputSchema: z.object({
    services: z
      .array(z.string())
      .optional()
      .describe(
        'Specific service names to check (e.g. ["Authority", "Backstage"]). Defaults to all services.'
      )
  }),
  execute: async ({ services: serviceFilter }) => {
    const targets = serviceFilter
      ? SERVICE_REGISTRY.filter((s) =>
          serviceFilter.some((f) => s.name.toLowerCase() === f.toLowerCase())
        )
      : SERVICE_REGISTRY

    const results = await Promise.all(targets.map(checkHealth))

    const summary = {
      total: results.length,
      healthy: results.filter((r) => r.status === 'healthy').length,
      unhealthy: results.filter((r) => r.status === 'unhealthy').length,
      unreachable: results.filter((r) => r.status === 'unreachable').length
    }

    return {
      success: summary.unreachable === 0 && summary.unhealthy === 0,
      services: results,
      summary
    }
  }
})
