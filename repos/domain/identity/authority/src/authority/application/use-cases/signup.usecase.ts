import { randomUUID } from 'crypto'
import { ConflictException, Inject, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'

import { UseCase } from '@pack/kernel'
import type { EventPrimitive } from '@pack/kernel'

import { User } from '@domain/entities'
import { AuthorityEventBusPort, UserPort } from '@domain/ports'
import { AuthorityProvider, Email, Password } from '@domain/value-objects'
import { UserLoggedInEvent } from '@domain/events'
import type { AuthorityEventMap } from '@domain/events'

import {
  AuthorityTokenService,
  type SessionContext
} from '@application/services/authority-token.service'
import { AuthorityEvent } from '@pack/event-inventory'

interface SignupInput {
  email: string
  password: string
  name?: string | null
}

interface SignupArgs {
  input: SignupInput
  context: SessionContext
}

interface SignupResult {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class SignupUseCase extends UseCase<SignupArgs, SignupResult> {
  constructor(
    private readonly users: UserPort,
    private readonly tokens: AuthorityTokenService,
    @Inject(AuthorityEventBusPort)
    private readonly events: AuthorityEventBusPort
  ) {
    super()
  }

  async execute(input: SignupArgs): Promise<SignupResult> {
    const { input: signupInput, context } = input
    const email = Email.create(signupInput.email)
    const password = Password.create(signupInput.password)
    const existing = await this.users.findByEmail(email)

    if (existing) {
      throw new ConflictException('Email already registered')
    }

    const hash = await bcrypt.hash(password.toString(), 10)

    const now = new Date()
    const user = User.signUp(
      {
        email: email.toString(),
        passwordHash: hash,
        provider: AuthorityProvider.Password,
        providerUserId: null,
        name: signupInput.name ?? null,
        profileId: null,
        createdAt: now
      },
      undefined,
      { eventId: randomUUID(), occurredOn: now }
    )

    await this.users.create(user)

    const { accessToken, refreshToken, sessionId } =
      await this.tokens.createSession(user, context)

    for (const event of user.pullEvents()) {
      if (event.eventName !== AuthorityEvent.UserSignedUp) continue

      void this.events.emit(
        AuthorityEvent.UserSignedUp,
        event as EventPrimitive<AuthorityEventMap[AuthorityEvent.UserSignedUp]>
      )
    }

    const loginTime = new Date()
    const loginEvent = new UserLoggedInEvent(
      user.idString,
      {
        userId: user.idString,
        email: user.email,
        provider: user.provider,
        sessionId,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null
      },
      { eventId: randomUUID(), occurredOn: loginTime }
    )

    void this.events.emit(AuthorityEvent.UserLoggedIn, loginEvent.toPrimitive())

    return { accessToken, refreshToken }
  }
}
