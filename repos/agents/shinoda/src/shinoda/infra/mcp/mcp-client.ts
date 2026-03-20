import axios, { type AxiosInstance } from 'axios'

/**
 * Generic MCP (Model Context Protocol) client for forwarding structured
 * payloads to an external observability or bug-reporting server.
 *
 * The client is intentionally thin -- it serialises signal payloads as JSON
 * and POSTs them to the configured MCP server. The server is responsible for
 * routing to the correct sink (OpenTelemetry, Sentry, PagerDuty, etc.).
 */
export class McpClient {
  private readonly http: AxiosInstance

  constructor(private readonly serverUrl: string) {
    this.http = axios.create({
      baseURL: serverUrl,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  /** Forward a typed signal payload to the MCP server. */
  async send(channel: string, payload: object): Promise<void> {
    try {
      await this.http.post('/signals', {
        channel,
        payload,
        sentAt: new Date().toISOString()
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error(
        `[mcp-client] Failed to forward signal "${channel}" to ${this.serverUrl}: ${message}`
      )
    }
  }
}

/**
 * Create an MCP client if `MCP_SERVER_URL` is configured,
 * otherwise return `null` (observability forwarding disabled).
 */
export function createMcpClient(): McpClient | null {
  const url = process.env.MCP_SERVER_URL
  if (!url) return null
  return new McpClient(url)
}
