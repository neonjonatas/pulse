import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { z } from 'zod'

import { requireStringEnv } from '@pack/env-orchestration'
import { DbConfigFlag } from '@infra/db'
import { AuthorityProvider } from '@domain/value-objects'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly jwtSecret = requireStringEnv(DbConfigFlag.JwtSecret)

  constructor(private readonly jwt: JwtService) {}

  private readonly authHeaderSchema = z
    .string()
    .min(1, 'Authorization header is required')
    .regex(/^Bearer\s.+$/, 'Authorization header must be a Bearer token')

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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string }
      user?: {
        sub: string
        email: string
        sid: string
        provider: AuthorityProvider
        profileId?: string | null
      }
    }>()
    const header = this.authHeaderSchema.safeParse(
      request.headers.authorization
    )

    if (!header.success) {
      throw new UnauthorizedException(header.error.issues[0]?.message)
    }

    const token = header.data.slice('Bearer '.length)

    try {
      const rawPayload = await this.jwt.verifyAsync(token, {
        secret: this.jwtSecret
      })
      const parsed = this.payloadSchema.safeParse(rawPayload)
      if (!parsed.success) {
        throw new UnauthorizedException('Invalid access token payload')
      }
      request.user = parsed.data
      return true
    } catch {
      throw new UnauthorizedException('Invalid access token')
    }
  }
}
