import { DynamicModule, Global, Module, type Provider } from '@nestjs/common'
import { DiscoveryModule } from '@nestjs/core'

import { NatsConsumerRegistryService } from './event-consumer.registry.service'

/**
 * Optional runtime options for the declarative NATS consumer module.
 */
export interface NatsConsumerModuleOptions {
  queuePrefix?: string
}

const NATS_CONSUMER_MODULE_OPTIONS = Symbol('NATS_CONSUMER_MODULE_OPTIONS')

/**
 * Global module that discovers `@EventConsumer` handlers and wires them to NATS.
 */
@Global()
@Module({
  imports: [DiscoveryModule]
})
export class NatsConsumerModule {
  /**
   * Registers the consumer module and optional bootstrap settings.
   */
  static forRoot(options: NatsConsumerModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: NATS_CONSUMER_MODULE_OPTIONS,
      useValue: options
    }

    return {
      module: NatsConsumerModule,
      imports: [DiscoveryModule],
      providers: [optionsProvider, NatsConsumerRegistryService],
      exports: [NatsConsumerRegistryService]
    }
  }
}
