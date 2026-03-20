import { randomUUID } from 'crypto'
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { UserEvent } from '@pack/event-inventory'

import { UseCase } from '@pack/kernel'
import type { EventPrimitive } from '@pack/kernel'

import { SlimShadyEventBusPort, UserPort } from '@domain/ports'
import type { SlimShadyEventMap } from '@domain/events'
import { Country, DisplayName, Username } from '@domain/value-objects'

interface UpdateUserProfileInput {
  profileId: string
  username?: string | null
  displayName?: string
  avatarUrl?: string | null
  bio?: string | null
  country?: string | null
}

@Injectable()
export class UpdateUserProfileUseCase extends UseCase<
  UpdateUserProfileInput,
  void
> {
  constructor(
    private readonly users: UserPort,
    @Inject(SlimShadyEventBusPort)
    private readonly events: SlimShadyEventBusPort
  ) {
    super()
  }

  async execute(input: UpdateUserProfileInput): Promise<void> {
    const user = await this.users.findById(input.profileId)

    if (!user) {
      throw new NotFoundException('Profile not found')
    }

    const normalizedUsername =
      input.username === null || input.username === undefined
        ? input.username
        : Username.create(input.username).toString()

    if (normalizedUsername && normalizedUsername !== user.username) {
      const conflicting = await this.users.findByUsername(normalizedUsername)

      if (conflicting) {
        throw new BadRequestException('Username already in use')
      }
    }

    const normalizedDisplayName = input.displayName
      ? DisplayName.create(input.displayName).toString()
      : undefined

    const normalizedCountry =
      input.country === undefined || input.country === null
        ? input.country
        : Country.create(input.country).toString()

    const now = new Date()
    const changedFields = user.updateProfile(
      {
        username: normalizedUsername,
        displayName: normalizedDisplayName,
        avatarUrl: input.avatarUrl,
        bio: input.bio,
        country: normalizedCountry
      },
      { eventId: randomUUID(), occurredOn: now }
    )

    if (changedFields.length === 0) {
      return
    }

    await this.users.update(user)

    for (const event of user.pullEvents()) {
      const eventName = event.eventName as UserEvent

      await this.events.emit(
        eventName,
        event as EventPrimitive<SlimShadyEventMap[UserEvent]>
      )
    }
  }
}
