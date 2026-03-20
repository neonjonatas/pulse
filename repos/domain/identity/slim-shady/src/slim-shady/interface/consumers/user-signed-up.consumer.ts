import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

import { CreateUserProfileUseCase } from '@application/use-cases'
import { SlimShadyEventBusPort } from '@domain/ports'

import { AuthorityEvent } from '@pack/event-inventory'

@Injectable()
export class UserSignedUpConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserSignedUpConsumer.name)

  constructor(
    private readonly createUserProfile: CreateUserProfileUseCase,
    private readonly events: SlimShadyEventBusPort
  ) {}

  onModuleInit(): void {
    this.events.on(AuthorityEvent.UserSignedUp, async (envelope) => {
      try {
        await this.createUserProfile.execute({
          authId: envelope.payload.userId,
          email: envelope.payload.email,
          name: envelope.payload.name ?? null
        })
      } catch (error) {
        this.logger.error('Failed to handle authority.user.signed_up', error)
      }
    })
  }
}
