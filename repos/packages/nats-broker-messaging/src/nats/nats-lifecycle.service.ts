import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import type { NatsConnection } from 'nats'

import { NatsConnectionToken } from './nats-connection.provider'

/**
 * Gracefully drains the NATS connection on NestJS module shutdown.
 */
@Injectable()
export class NatsLifecycleService implements OnModuleDestroy {
  constructor(
    @Inject(NatsConnectionToken)
    private readonly connection: NatsConnection | null
  ) {}

  /**
   * Drains all subscriptions and closes transport cleanly.
   */
  async onModuleDestroy(): Promise<void> {
    if (this.connection) await this.connection.drain()
  }
}
