import { connect, type NatsConnection } from 'nats'
import { NatsPublisher } from '@pack/nats-broker-messaging'
import { ChesterEvent } from '@pack/event-inventory'

type ChesterEventContract = {
  [ChesterEvent.SearchStarted]: {
    query: string
    correlationId: string
    timestamp: string
  }
  [ChesterEvent.SearchEnded]: {
    query: string
    correlationId: string
    resultCount: number
    latencyMs: number
    timestamp: string
  }
  [ChesterEvent.SearchFailed]: {
    query: string
    correlationId: string
    error: string
    timestamp: string
  }
  [ChesterEvent.SearchNotFound]: {
    query: string
    correlationId: string
    timestamp: string
  }
  [ChesterEvent.EmilyStreamed]: {
    correlationId: string
    resultCount: number
    timestamp: string
  }
}

export class ChesterPublisher {
  private publisher: NatsPublisher<ChesterEventContract> | null = null

  async connect(): Promise<void> {
    const natsUrl = process.env['NATS_URL']
    if (!natsUrl) {
      console.log('[chester:events] NATS_URL not set — running in no-op mode')
      return
    }

    const nc: NatsConnection = await connect({ servers: natsUrl })
    this.publisher = new NatsPublisher<ChesterEventContract>(nc)
    console.log('[chester:events] Connected to NATS')
  }

  private envelope<T>(event: string, aggregateId: string, payload: T) {
    return {
      eventId: crypto.randomUUID(),
      eventName: event,
      eventVersion: 1,
      aggregateId,
      occurredOn: new Date(),
      payload
    }
  }

  async searchStarted(correlationId: string, query: string): Promise<void> {
    await this.publisher?.publish(
      ChesterEvent.SearchStarted,
      this.envelope(ChesterEvent.SearchStarted, correlationId, {
        query,
        correlationId,
        timestamp: new Date().toISOString()
      })
    )
  }

  async searchEnded(
    correlationId: string,
    query: string,
    resultCount: number,
    latencyMs: number
  ): Promise<void> {
    await this.publisher?.publish(
      ChesterEvent.SearchEnded,
      this.envelope(ChesterEvent.SearchEnded, correlationId, {
        query,
        correlationId,
        resultCount,
        latencyMs,
        timestamp: new Date().toISOString()
      })
    )
  }

  async searchFailed(
    correlationId: string,
    query: string,
    error: string
  ): Promise<void> {
    await this.publisher?.publish(
      ChesterEvent.SearchFailed,
      this.envelope(ChesterEvent.SearchFailed, correlationId, {
        query,
        correlationId,
        error,
        timestamp: new Date().toISOString()
      })
    )
  }

  async searchNotFound(correlationId: string, query: string): Promise<void> {
    await this.publisher?.publish(
      ChesterEvent.SearchNotFound,
      this.envelope(ChesterEvent.SearchNotFound, correlationId, {
        query,
        correlationId,
        timestamp: new Date().toISOString()
      })
    )
  }

  async emilyStreamed(
    correlationId: string,
    resultCount: number
  ): Promise<void> {
    await this.publisher?.publish(
      ChesterEvent.EmilyStreamed,
      this.envelope(ChesterEvent.EmilyStreamed, correlationId, {
        correlationId,
        resultCount,
        timestamp: new Date().toISOString()
      })
    )
  }
}

export const chesterPublisher = new ChesterPublisher()
