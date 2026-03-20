import { Agent } from '@mastra/core/agent'
import { requireStringEnv } from '@pack/env-orchestration'

import {
  analysePipelineTool,
  inspectEventsTool,
  checkServicesTool
} from '@tools'
import { instructions } from '@instructions'

export const shinodaAgent = new Agent({
  id: 'shinoda',
  name: 'shinoda',
  model: requireStringEnv('SHINODA_MODEL'),
  instructions,
  tools: {
    analysePipelineTool,
    inspectEventsTool,
    checkServicesTool
  }
})
