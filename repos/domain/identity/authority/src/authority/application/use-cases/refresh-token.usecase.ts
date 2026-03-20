import { randomUUID } from 'crypto'
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcrypt'
import { z } from 'zod'

import { UseCase } from '@pack/kernel'

import { AuthorityEventBusPort, SessionPort } from '@domain/ports'
import { AuthorityProvider } from '@domain/value-objects'
import { TokenRefreshedEvent } from '@domain/events'

import { requireStringEnv } from '@pack/env-orchestration'
import { DbConfigFlag } from '@infra/db'
import {
  AuthorityTokenService,
  type TokenPayload
} from '@application/services/authority-token.service'
import { AuthorityEvent } from '@pack/event-inventory'

interface RefreshTokenInput {
  refreshToken: string
}

interface RefreshTokenResult {
  accessToken: string
  refreshToken: string
}

@Injectable()
export class RefreshTokenUseCase extends UseCase<
  RefreshTokenInput,
  RefreshTokenResult
> {
  private readonly refreshSecret = requireStringEnv(
    DbConfigFlag.JwtRefreshSecret
  )
  private readonly payloadSchema = z
    .object({
      sub: z.string().min(1),
      email: z.string().email(),
      sid: z.string().min(1),
      provider: z.nativeEnum(AuthorityProvider),
      profileId: z.string().min(1).nullable().optional(),
      iat: z.number().optional(),
      exp: z.number().optional()
    })
    .passthrough()

  constructor(
    private readonly sessions: SessionPort,
    private readonly jwt: JwtService,
    private readonly tokens: AuthorityTokenService,
    @Inject(AuthorityEventBusPort)
    private readonly events: AuthorityEventBusPort
  ) {
    super()
  }

  async execute(input: RefreshTokenInput): Promise<RefreshTokenResult> {
    const { refreshToken } = input
    try {
      const payload = await this.jwt.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.refreshSecret
      })
      const parsedPayload = this.payloadSchema.safeParse(payload)
      if (!parsedPayload.success) {
        throw new UnauthorizedException('Refresh token is invalid')
      }
      const typedPayload = parsedPayload.data
      const session = await this.sessions.findById(typedPayload.sid)

      if (!session) {
        throw new UnauthorizedException('Refresh token is invalid')
      }

      if (session.userId !== typedPayload.sub) {
        throw new UnauthorizedException('Refresh token is invalid')
      }

      if (session.expiresAt.getTime() <= Date.now()) {
        await this.sessions.deleteById(session.idString)
        throw new UnauthorizedException('Refresh token expired')
      }

      const validHash = await compare(refreshToken, session.refreshTokenHash)
      if (!validHash) {
        throw new UnauthorizedException('Refresh token is invalid')
      }

      const { accessToken, refreshToken: rotatedRefreshToken } =
        await this.tokens.rotateSession(typedPayload, session)

      const now = new Date()
      const refreshedEvent = new TokenRefreshedEvent(
        typedPayload.sub,
        {
          userId: typedPayload.sub,
          sessionId: typedPayload.sid
        },
        { eventId: randomUUID(), occurredOn: now }
      )

      void this.events.emit(
        AuthorityEvent.TokenRefreshed,
        refreshedEvent.toPrimitive()
      )

      return { accessToken, refreshToken: rotatedRefreshToken }
    } catch (error) {
      throw new UnauthorizedException()
    }
  }
}
