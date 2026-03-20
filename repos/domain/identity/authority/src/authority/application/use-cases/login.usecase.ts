import { randomUUID } from 'crypto'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { compare } from 'bcrypt'

import { UseCase } from '@pack/kernel'

import { AuthorityEventBusPort, UserPort } from '@domain/ports'
import { AuthorityProvider, Email, Password } from '@domain/value-objects'
import { UserLoggedInEvent } from '@domain/events'

import {
  AuthorityTokenService,
  type SessionContext
} from '@application/services/authority-token.service'
import { AuthorityEvent } from '@pack/event-inventory'

interface LoginInput {
  email: string
  password: string
  context: SessionContext
}

interface LoginResult {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class LoginUseCase extends UseCase<LoginInput, LoginResult> {
  constructor(
    private readonly users: UserPort,
    private readonly tokens: AuthorityTokenService,
    @Inject(AuthorityEventBusPort)
    private readonly events: AuthorityEventBusPort
  ) {
    super()
  }

  async execute(input: LoginInput): Promise<LoginResult> {
    const { email, password, context } = input
    const emailVo = Email.create(email)
    const passwordVo = Password.create(password)
    const user = await this.users.findByEmail(emailVo)

    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    if (user.provider !== AuthorityProvider.Password || !user.hasPassword) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const ok = await compare(passwordVo.toString(), user.passwordHash)

    if (!ok) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const { accessToken, refreshToken, sessionId } =
      await this.tokens.createSession(user, context)

    const now = new Date()
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
      { eventId: randomUUID(), occurredOn: now }
    )

    void this.events.emit(AuthorityEvent.UserLoggedIn, loginEvent.toPrimitive())

    return { accessToken, refreshToken }
  }
}
