import { connect, type NatsConnection } from 'nats'
import { NatsPublisher } from '@pack/nats-broker-messaging'
import { EmilyEvent } from '@pack/event-inventory'

type EmilyEventContract = {
  [EmilyEvent.SearchReceived]: {
    correlationId: string
    source: string
    resultCount: number
    timestamp: string
  }
  [EmilyEvent.SearchTransformed]: {
    correlationId: string
    inputCount: number
    outputCount: number
    timestamp: string
  }
  [EmilyEvent.TransformFailed]: {
    correlationId: string
    error: string
    timestamp: string
  }
  [EmilyEvent.SearchReturned]: {
    correlationId: string
    trackCount: number
    timestamp: string
  }
}

export class EmilyPublisher {
  private publisher: NatsPublisher<EmilyEventContract> | null = null

  async connect(): Promise<void> {
    const natsUrl = process.env['NATS_URL']
    if (!natsUrl) {
      console.log('[emily:events] NATS_URL not set — running in no-op mode')
      return
    }

    const nc: NatsConnection = await connect({ servers: natsUrl })
    this.publisher = new NatsPublisher<EmilyEventContract>(nc)
    console.log('[emily:events] Connected to NATS')
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

  async searchReceived(
    correlationId: string,
    source: string,
    resultCount: number
  ): Promise<void> {
    await this.publisher?.publish(
      EmilyEvent.SearchReceived,
      this.envelope(EmilyEvent.SearchReceived, correlationId, {
        correlationId,
        source,
        resultCount,
        timestamp: new Date().toISOString()
      })
    )
  }

  async searchTransformed(
    correlationId: string,
    inputCount: number,
    outputCount: number
  ): Promise<void> {
    await this.publisher?.publish(
      EmilyEvent.SearchTransformed,
      this.envelope(EmilyEvent.SearchTransformed, correlationId, {
        correlationId,
        inputCount,
        outputCount,
        timestamp: new Date().toISOString()
      })
    )
  }

  async transformFailed(correlationId: string, error: string): Promise<void> {
    await this.publisher?.publish(
      EmilyEvent.TransformFailed,
      this.envelope(EmilyEvent.TransformFailed, correlationId, {
        correlationId,
        error,
        timestamp: new Date().toISOString()
      })
    )
  }

  async searchReturned(
    correlationId: string,
    trackCount: number
  ): Promise<void> {
    await this.publisher?.publish(
      EmilyEvent.SearchReturned,
      this.envelope(EmilyEvent.SearchReturned, correlationId, {
        correlationId,
        trackCount,
        timestamp: new Date().toISOString()
      })
    )
  }
}

export const emilyPublisher = new EmilyPublisher()
