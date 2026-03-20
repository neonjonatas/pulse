import { Injectable, Logger, OnModuleInit } from '@nestjs/common'

import { UserPort } from '@domain/ports'
import { AuthorityEventBusPort } from '@domain/ports/authority-event-bus.port'

import { UserEvent } from '@pack/event-inventory'

@Injectable()
export class UserProfileCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(UserProfileCreatedConsumer.name)

  constructor(
    private readonly users: UserPort,
    private readonly events: AuthorityEventBusPort
  ) {}

  onModuleInit(): void {
    this.events.on(UserEvent.ProfileCreated, async (envelope) => {
      try {
        await this.users.updateProfileId(
          envelope.payload.authId,
          envelope.payload.profileId
        )
      } catch (error) {
        this.logger.error('Failed to handle user.profile.created', error)
      }
    })
  }
}
