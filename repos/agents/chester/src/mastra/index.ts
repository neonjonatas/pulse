import { Mastra } from '@mastra/core'
import { chesterAgent } from '@chester'
import { createChesterMcpClient } from '@mcp'
import { chesterPublisher } from '@events'

void chesterPublisher.connect().catch((err) => {
  console.error('[chester] Failed to connect to NATS:', err)
})

const mcpClient = createChesterMcpClient()
if (mcpClient) {
  console.log('[chester] MCP client active')
}

export const mastra = new Mastra({
  agents: {
    chester: chesterAgent
  }
})
