import { Mastra } from '@mastra/core'
import { emilyAgent } from '@emily'
import { createEmilyMcpClient } from '@mcp'
import { emilyPublisher } from '@events'

void emilyPublisher.connect().catch((err) => {
  console.error('[emily] Failed to connect to NATS:', err)
})

const mcpClient = createEmilyMcpClient()
if (mcpClient) {
  console.log('[emily] MCP client active')
}

export const mastra = new Mastra({
  agents: {
    emily: emilyAgent
  }
})
