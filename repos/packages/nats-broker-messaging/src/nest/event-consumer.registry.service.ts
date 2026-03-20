import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  Optional
} from '@nestjs/common'
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core'
import type { NatsConnection } from 'nats'

import { NatsConsumer, NatsConnectionToken } from '@nats'

import {
  EVENT_CONSUMER_METADATA,
  type EventConsumerOptions
} from './decorators/event-consumer.decorator'

/**
 * Discovers and wires methods decorated with `@EventConsumer(...)`.
 */
@Injectable()
export class NatsConsumerRegistryService implements OnApplicationBootstrap {
  private readonly logger = new Logger(NatsConsumerRegistryService.name)
  private readonly consumersByQueue = new Map<
    string,
    NatsConsumer<Record<string, Record<string, unknown>>>
  >()

  constructor(
    @Inject(NatsConnectionToken)
    private readonly connection: NatsConnection | null,

    @Optional() private readonly discoveryService?: DiscoveryService,
    @Optional() private readonly metadataScanner?: MetadataScanner,
    @Optional() private readonly reflector?: Reflector
  ) {}

  /**
   * On bootstrap, scans providers and subscribes decorated handlers.
   */
  onApplicationBootstrap(): void {
    if (!this.connection) return
    if (!this.discoveryService || !this.metadataScanner || !this.reflector) {
      return
    }

    const reflector = this.reflector
    const wrappers = this.discoveryService.getProviders()
    for (const wrapper of wrappers) {
      const instance = wrapper.instance
      if (!instance || typeof instance !== 'object') continue
      const prototype = Object.getPrototypeOf(instance)
      if (!prototype) continue

      this.metadataScanner.scanFromPrototype(
        instance,
        prototype,
        (methodName: string) => {
          const methodRef = prototype[methodName]
          if (typeof methodRef !== 'function') return

          const metadata = reflector.get<
            EventConsumerOptions & { handlerMethod: string | symbol }
          >(EVENT_CONSUMER_METADATA, methodRef)
          if (!metadata) return

          const consumer = this.getOrCreateConsumer(metadata.queue)
          consumer.subscribe(
            metadata.subject,
            async (envelope) => {
              await methodRef.call(instance, envelope)
            },
            { expectedVersion: metadata.expectedVersion }
          )

          this.logger.log(
            `Subscribed ${wrapper.name ?? 'AnonymousProvider'}.${methodName} to ${metadata.subject} (queue: ${metadata.queue})`
          )
        }
      )
    }
  }

  /**
   * Gets or lazily creates a queue-scoped consumer instance.
   */
  private getOrCreateConsumer(
    queue: string
  ): NatsConsumer<Record<string, Record<string, unknown>>> {
    const existing = this.consumersByQueue.get(queue)
    if (existing) return existing

    const created = new NatsConsumer<Record<string, Record<string, unknown>>>(
      this.connection as NatsConnection,
      queue
    )
    this.consumersByQueue.set(queue, created)
    return created
  }
}
