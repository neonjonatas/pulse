import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common'
import type { NatsConnection } from 'nats'

import { NatsConnectionToken } from './nats-connection.provider'

@Injectable()
export class NatsLifecycleService implements OnModuleDestroy {
  constructor(
    @Inject(NatsConnectionToken) private readonly nc: NatsConnection | null
  ) {}

  async onModuleDestroy(): Promise<void> {
    if (this.nc) {
      await this.nc.drain()
      this.nc.close()
    }
  }
}
