import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common'
import { OAuth2Client } from 'google-auth-library'
import { CircuitBreaker } from '@pack/patterns'

import { GoogleOAuthPort, type GoogleProfile } from '@domain/ports'
import { AuthorityProvider } from '@domain/value-objects'
import { requireStringEnv } from '@pack/env-orchestration'

import { OAuthConfigFlag } from './oauth-config-flag.enum'

@Injectable()
export class GoogleOAuthAdapter implements GoogleOAuthPort {
  private readonly clientId = requireStringEnv(OAuthConfigFlag.GoogleClientId)
  private readonly client = new OAuth2Client(this.clientId)
  private readonly breaker = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    timeoutMs: 5_000,
    resetTimeoutMs: 30_000
  })

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    return await this.breaker.execute(
      async () => {
        const ticket = await this.client.verifyIdToken({
          idToken,
          audience: this.clientId
        })
        const payload = ticket.getPayload()

        if (!payload?.email || !payload.sub) {
          throw new UnauthorizedException('Invalid Google ID token')
        }

        return {
          provider: AuthorityProvider.Google,
          providerUserId: payload.sub,
          email: payload.email,
          name: payload.name ?? null,
          emailVerified: Boolean(payload.email_verified)
        }
      },
      async () => {
        throw new ServiceUnavailableException(
          'Google verification is temporarily unavailable'
        )
      }
    )
  }
}
