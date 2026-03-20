import { randomUUID } from 'crypto'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { UseCase } from '@pack/kernel'
import type { EventPrimitive } from '@pack/kernel'

import { SlimShadyEventBusPort, UserPort } from '@domain/ports'
import {
  type AudioQualityPreference,
  type ThemePreference
} from '@domain/entities'
import type { SlimShadyEventMap } from '@domain/events'
import { UserEvent } from '@pack/event-inventory'

interface UpdateUserPreferencesInput {
  profileId: string
  theme?: ThemePreference
  explicitContentFilter?: boolean
  audioQuality?: AudioQualityPreference
  privateSession?: boolean
}

@Injectable()
export class UpdateUserPreferencesUseCase extends UseCase<
  UpdateUserPreferencesInput,
  void
> {
  constructor(
    private readonly users: UserPort,
    @Inject(SlimShadyEventBusPort)
    private readonly events: SlimShadyEventBusPort
  ) {
    super()
  }

  async execute(input: UpdateUserPreferencesInput): Promise<void> {
    const user = await this.users.findById(input.profileId)

    if (!user) {
      throw new NotFoundException('Profile not found')
    }

    const now = new Date()
    const changedFields = user.updatePreferences(
      {
        theme: input.theme,
        explicitContentFilter: input.explicitContentFilter,
        audioQuality: input.audioQuality,
        privateSession: input.privateSession
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
