import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcrypt'

import { Session, User } from '@domain/entities'
import { SessionPort } from '@domain/ports'
import { AuthorityProvider } from '@domain/value-objects'
import { requireStringEnv } from '@pack/env-orchestration'
import { DbConfigFlag } from '@infra/db'

export interface SessionContext {
  ipAddress?: string | null
  userAgent?: string | null
}

export interface AuthorityTokens {
  accessToken: string
  refreshToken: string
  sessionId: string
}

export interface TokenPayload {
  sub: string
  email: string
  sid: string
  provider: AuthorityProvider
  profileId?: string | null
}

@Injectable()
export class AuthorityTokenService {
  private readonly refreshSecret = requireStringEnv(
    DbConfigFlag.JwtRefreshSecret
  )
  private readonly refreshExpiresIn = requireStringEnv(
    DbConfigFlag.JwtRefreshExpiresIn
  ) as never

  constructor(
    private readonly sessions: SessionPort,
    private readonly jwt: JwtService
  ) {}

  async createSession(
    user: User,
    context: SessionContext
  ): Promise<AuthorityTokens> {
    const session = Session.create({
      userId: user.idString,
      refreshTokenHash: '',
      expiresAt: new Date(),
      createdAt: new Date(),
      ipAddress: context.ipAddress ?? null,
      userAgent: context.userAgent ?? null,
      provider: user.provider
    })

    const payload: TokenPayload = {
      sub: user.idString,
      email: user.email,
      sid: session.idString,
      provider: user.provider,
      profileId: user.profileId ?? null
    }

    const accessToken = await this.jwt.signAsync(payload)
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn
    })

    const decoded = this.jwt.decode(refreshToken) as { exp?: number } | null

    if (!decoded?.exp) {
      throw new UnauthorizedException('Invalid refresh token payload')
    }

    session.rotateRefreshToken(
      await hash(refreshToken, 10),
      new Date(decoded.exp * 1000)
    )

    await this.sessions.create(session)

    return { accessToken, refreshToken, sessionId: session.idString }
  }

  async rotateSession(
    payload: TokenPayload,
    session: Session
  ): Promise<AuthorityTokens> {
    const accessToken = await this.jwt.signAsync(payload)
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiresIn
    })

    const decoded = this.jwt.decode(refreshToken) as { exp?: number } | null

    if (!decoded?.exp) {
      throw new UnauthorizedException('Invalid refresh token payload')
    }

    session.rotateRefreshToken(
      await hash(refreshToken, 10),
      new Date(decoded.exp * 1000)
    )
    await this.sessions.update(session)

    return { accessToken, refreshToken, sessionId: session.idString }
  }
}
