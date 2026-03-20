import { Module } from '@nestjs/common'
import {
  NatsConnectionToken,
  natsConnectionProvider,
  NatsLifecycleService
} from '@pack/nats-broker-messaging'

/** Provides a NATS connection and lifecycle drain for this microservice. */
@Module({
  providers: [natsConnectionProvider, NatsLifecycleService],
  exports: [NatsConnectionToken]
})
export class NatsModule {}
