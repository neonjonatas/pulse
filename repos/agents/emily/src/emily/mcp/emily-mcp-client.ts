import { MCPConfiguration } from '@mastra/mcp'

export function createEmilyMcpClient(): MCPConfiguration | null {
  const pulseUrl = process.env['PULSE_MCP_URL']
  const shinodaUrl = process.env['SHINODA_MCP_URL']

  if (!pulseUrl && !shinodaUrl) {
    console.log(
      '[emily:mcp] No MCP URLs configured — running without MCP client'
    )
    return null
  }

  const servers: Record<string, { url: URL }> = {}
  if (pulseUrl) servers.pulse = { url: new URL(pulseUrl) }
  if (shinodaUrl) servers.shinoda = { url: new URL(shinodaUrl) }

  return new MCPConfiguration({
    id: 'emily-mcp',
    servers,
    timeout: 30_000
  })
}
