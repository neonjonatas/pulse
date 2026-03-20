import { Injectable, ServiceUnavailableException } from '@nestjs/common'

import { CircuitBreaker } from '@pack/patterns'

import { SessionPort } from '@domain/ports'
import { Session } from '@domain/entities'
import { MongooseSessionAdapter } from '@infra/mongoose'

const SESSION_BREAKER_OPTIONS = {
  failureThreshold: 4,
  successThreshold: 2,
  timeoutMs: 5_000,
  resetTimeoutMs: 20_000
}

@Injectable()
export class SessionCircuitBreakerAdapter implements SessionPort {
  private readonly breaker = new CircuitBreaker(SESSION_BREAKER_OPTIONS)

  constructor(private readonly delegate: MongooseSessionAdapter) {}

  private async guard<Result>(
    operation: () => Promise<Result>
  ): Promise<Result> {
    return this.breaker.execute(operation, async () => {
      throw new ServiceUnavailableException(
        'Session storage is temporarily unavailable'
      )
    })
  }

  async create(session: Session): Promise<void> {
    await this.guard(() => this.delegate.create(session))
  }

  async findById(id: string): Promise<Session | null> {
    return this.guard(() => this.delegate.findById(id))
  }

  async update(session: Session): Promise<void> {
    await this.guard(() => this.delegate.update(session))
  }

  async deleteById(id: string): Promise<void> {
    await this.guard(() => this.delegate.deleteById(id))
  }
}
