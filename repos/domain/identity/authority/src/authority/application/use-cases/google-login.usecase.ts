import { randomUUID } from 'crypto'
import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { AuthorityEvent } from '@pack/event-inventory'

import { UseCase } from '@pack/kernel'

import { AuthorityEventBusPort, GoogleOAuthPort, UserPort } from '@domain/ports'
import { AuthorityProvider, Email } from '@domain/value-objects'
import { UserLoggedInEvent } from '@domain/events'

import {
  AuthorityTokenService,
  type SessionContext
} from '@application/services/authority-token.service'

interface GoogleLoginArgs {
  idToken: string
  context: SessionContext
}

interface GoogleLoginResult {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class GoogleLoginUseCase extends UseCase<
  GoogleLoginArgs,
  GoogleLoginResult
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

  async execute(input: GoogleLoginArgs): Promise<GoogleLoginResult> {
    const { idToken, context } = input
    const profile = await this.google.verifyIdToken(idToken)

    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google account email not verified')
    }

    const existing = await this.users.findByEmail(Email.create(profile.email))

    if (!existing) {
      throw new UnauthorizedException(
        'No account associated with this Google login'
      )
    }

    if (existing.provider !== AuthorityProvider.Google) {
      throw new ConflictException('Use email and password to sign in')
    }

    if (
      existing.providerUserId &&
      existing.providerUserId !== profile.providerUserId
    ) {
      throw new UnauthorizedException('Google account mismatch')
    }

    const { accessToken, refreshToken, sessionId } =
      await this.tokens.createSession(existing, context)

    const now = new Date()
    const loginEvent = new UserLoggedInEvent(
      existing.idString,
      {
        userId: existing.idString,
        email: existing.email,
        provider: existing.provider,
        sessionId,
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null
      },
      { eventId: randomUUID(), occurredOn: now }
    )

    void this.events.emit(AuthorityEvent.UserLoggedIn, loginEvent.toPrimitive())

    return { accessToken, refreshToken }
  }
}
