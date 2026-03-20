import { randomUUID } from 'crypto'
import { Inject, Injectable } from '@nestjs/common'

import { UseCase } from '@pack/kernel'
import type { EventPrimitive } from '@pack/kernel'
import { UniqueEntityId } from '@pack/patterns'

import {
  type AudioQualityPreference,
  type ThemePreference,
  User
} from '@domain/entities'
import type { SlimShadyEventMap } from '@domain/events'
import { UserEvent } from '@pack/event-inventory'
import { SlimShadyEventBusPort, UserPort } from '@domain/ports'
import { DisplayName } from '@domain/value-objects'

interface CreateUserProfileInput {
  authId: string
  email: string
  name?: string | null
}

const defaultTheme: ThemePreference = 'dark'
const defaultAudioQuality: AudioQualityPreference = 'high'

@Injectable()
export class CreateUserProfileUseCase extends UseCase<
  CreateUserProfileInput,
  void
> {
  constructor(
    private readonly users: UserPort,
    @Inject(SlimShadyEventBusPort)
    private readonly events: SlimShadyEventBusPort
  ) {
    super()
  }

  async execute(input: CreateUserProfileInput): Promise<void> {
    const existing = await this.users.findByAuthId(input.authId)
    if (existing) return

    const fallbackName = input.email.split('@')[0] ?? 'listener'
    const displayName = DisplayName.create(
      input.name ?? fallbackName
    ).toString()
    const now = new Date()
    const id = UniqueEntityId.create(`usr_${randomUUID()}`)

    const meta = { eventId: randomUUID(), occurredOn: now }
    const user = User.createProfile(
      {
        authId: input.authId,
        email: input.email.trim().toLowerCase(),
        username: null,
        profile: {
          displayName,
          avatarUrl: null,
          bio: null
        },
        preferences: {
          theme: defaultTheme,
          explicitContentFilter: false,
          audioQuality: defaultAudioQuality,
          privateSession: false
        },
        country: null,
        account: {
          status: 'active'
        },
        onboarding: {
          completed: false,
          completedAt: null
        },
        createdAt: now,
        updatedAt: now
      },
      id,
      input.authId,
      meta
    )

    await this.users.create(user)

    for (const event of user.pullEvents()) {
      const eventName = event.eventName as UserEvent

      await this.events.emit(
        eventName,
        event as EventPrimitive<SlimShadyEventMap[UserEvent]>
      )
    }
  }
}
