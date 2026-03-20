import { randomUUID } from 'crypto'
import { ConflictException, Inject, Injectable } from '@nestjs/common'

import { UseCase } from '@pack/kernel'
import type { EventPrimitive } from '@pack/kernel'

import { User } from '@domain/entities'
import { AuthorityEventBusPort, GoogleOAuthPort, UserPort } from '@domain/ports'
import { AuthorityProvider, Email } from '@domain/value-objects'
import { UserLoggedInEvent } from '@domain/events'
import type { AuthorityEventMap } from '@domain/events'

import {
  AuthorityTokenService,
  type SessionContext
} from '@application/services/authority-token.service'
import { AuthorityEvent } from '@pack/event-inventory'

interface GoogleSignupArgs {
  idToken: string
  context: SessionContext
}

interface GoogleSignupResult {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class GoogleSignupUseCase extends UseCase<
  GoogleSignupArgs,
  GoogleSignupResult
> {
  constructor(
    private readonly users: UserPort,
    private readonly tokens: AuthorityTokenService,
    private readonly google: GoogleOAuthPort,
    @Inject(AuthorityEventBusPort)
    private readonly events: AuthorityEventBusPort
  ) {
    super()
  }

  async execute(input: GoogleSignupArgs): Promise<GoogleSignupResult> {
    const { idToken, context } = input
    const profile = await this.google.verifyIdToken(idToken)

    if (!profile.emailVerified) {
      throw new ConflictException('Google account email not verified')
    }

    const existing = await this.users.findByEmail(Email.create(profile.email))

    if (existing) {
      throw new ConflictException('Email already registered')
    }

    const now = new Date()
    const user = User.signUp(
      {
        email: profile.email,
        passwordHash: null,
        provider: AuthorityProvider.Google,
        providerUserId: profile.providerUserId,
        name: profile.name ?? null,
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
