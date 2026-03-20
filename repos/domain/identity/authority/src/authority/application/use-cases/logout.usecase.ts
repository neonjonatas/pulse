import { randomUUID } from 'crypto'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { z } from 'zod'

import { UseCase } from '@pack/kernel'

import { AuthorityEventBusPort, SessionPort } from '@domain/ports'
import { AuthorityProvider } from '@domain/value-objects'
import { UserLoggedOutEvent } from '@domain/events'

import { requireStringEnv } from '@pack/env-orchestration'
import { DbConfigFlag } from '@infra/db'
import type { TokenPayload } from '@application/services/authority-token.service'

import { AuthorityEvent } from '@pack/event-inventory'

interface LogoutInput {
  refreshToken: string
}

interface LogoutResult {
  success: boolean
}

@Injectable()
export class LogoutUseCase extends UseCase<LogoutInput, LogoutResult> {
  private readonly refreshSecret = requireStringEnv(
    DbConfigFlag.JwtRefreshSecret
  )
  private readonly payloadSchema = z
    .object({
      sub: z.string().min(1),
      email: z.string().email(),
      sid: z.string().min(1),
      provider: z.nativeEnum(AuthorityProvider)
    })
    .strict()

  constructor(
    private readonly sessions: SessionPort,
    private readonly jwt: JwtService,
    @Inject(AuthorityEventBusPort)
    private readonly events: AuthorityEventBusPort
  ) {
    super()
  }

  async execute(input: LogoutInput): Promise<LogoutResult> {
    const { refreshToken } = input
    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.refreshSecret
      })
      const parsedPayload = this.payloadSchema.safeParse(payload)
      if (!parsedPayload.success) {
        throw new UnauthorizedException('Invalid refresh token')
      }
      const typedPayload = parsedPayload.data

      await this.sessions.deleteById(typedPayload.sid)

      const now = new Date()
      const logoutEvent = new UserLoggedOutEvent(
        typedPayload.sub,
        {
          userId: typedPayload.sub,
          sessionId: typedPayload.sid
        },
        { eventId: randomUUID(), occurredOn: now }
      )

      void this.events.emit(
        AuthorityEvent.UserLoggedOut,
        logoutEvent.toPrimitive()
      )

      return { success: true }
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
