import type {
  ShinodaEventMap,
  ShinodaEventName
} from '../../signals/shinoda-events'
import type { McpClient } from '@infra/mcp/mcp-client'

/**
 * Bridges the Shinoda signal bus to an external MCP server.
 *
 * When an MCP client is available, every signal emitted by the signal bus
 * is forwarded as a structured payload to the configured MCP endpoint.
 * The MCP server then routes it to the appropriate observability sink
 * (OpenTelemetry collector, bug tracker, alerting platform, etc.).
 */
export class ObservabilitySink {
  constructor(private readonly mcp: McpClient) {}

  /** Forward a signal bus event to the MCP server. */
  forward<K extends ShinodaEventName>(
    event: K,
    payload: ShinodaEventMap[K]
  ): void {
    void this.mcp.send(event, payload)
  }

  /** Subscribe to all signal bus events and forward them. */
  static wire(
    signalBus: {
      on: <K extends ShinodaEventName>(
        event: K,
        listener: (payload: ShinodaEventMap[K]) => void
      ) => void
    },
    mcp: McpClient
  ): ObservabilitySink {
    const sink = new ObservabilitySink(mcp)

    const events: ShinodaEventName[] = [
      'TRACK_STUCK',
      'SERVICE_UNHEALTHY',
      'PIPELINE_ANOMALY',
      'DIAGNOSIS_READY'
    ]

    for (const event of events) {
      signalBus.on(event, (payload) => sink.forward(event, payload))
    }

    return sink
  }
}
