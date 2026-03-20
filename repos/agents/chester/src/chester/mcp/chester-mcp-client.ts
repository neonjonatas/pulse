import { MCPConfiguration } from '@mastra/mcp'

export function createChesterMcpClient(): MCPConfiguration | null {
  const emilyUrl = process.env['EMILY_MCP_URL']
  const shinodaUrl = process.env['SHINODA_MCP_URL']

  if (!emilyUrl && !shinodaUrl) {
    console.log('[chester:mcp] No MCP URLs configured — running without MCP')
    return null
  }

  const servers: Record<string, { url: URL }> = {}
  if (emilyUrl) servers.emily = { url: new URL(emilyUrl) }
  if (shinodaUrl) servers.shinoda = { url: new URL(shinodaUrl) }

  return new MCPConfiguration({
    id: 'chester-mcp',
    servers,
    timeout: 30_000
  })
}
