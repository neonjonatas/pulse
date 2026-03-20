import { randomUUID } from 'crypto'
import { Inject, Injectable, NotFoundException } from '@nestjs/common'

import { UseCase } from '@pack/kernel'
import type { EventPrimitive } from '@pack/kernel'

import { SlimShadyEventBusPort, UserPort } from '@domain/ports'
import type { SlimShadyEventMap } from '@domain/events'

import { UserEvent } from '@pack/event-inventory'

interface CompleteOnboardingInput {
  profileId: string
  completed: boolean
}

@Injectable()
export class CompleteOnboardingUseCase extends UseCase<
  CompleteOnboardingInput,
  void
> {
  constructor(
    private readonly users: UserPort,
    @Inject(SlimShadyEventBusPort)
    private readonly events: SlimShadyEventBusPort
  ) {
    super()
  }

  async execute(input: CompleteOnboardingInput): Promise<void> {
    const user = await this.users.findById(input.profileId)

    if (!user) {
      throw new NotFoundException('Profile not found')
    }

    const now = new Date()
    const changedFields = user.completeOnboarding(input.completed, {
      eventId: randomUUID(),
      occurredOn: now
    })

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
