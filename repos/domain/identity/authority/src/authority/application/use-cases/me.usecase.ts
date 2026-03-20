import { Injectable, UnauthorizedException } from '@nestjs/common'

import { UseCase } from '@pack/kernel'

import { UserPort } from '@domain/ports'
import { UserId } from '@domain/value-objects'

interface MeInput {
  userId: string
}

interface MeResult {
  id: string
  profileId: string | null
  email: string
  name: string | null
  provider: string
  createdAt: Date
}

@Injectable()
export class MeUseCase extends UseCase<MeInput, MeResult> {
  constructor(private readonly users: UserPort) {
    super()
  }

  async execute(input: MeInput): Promise<MeResult> {
    const id = UserId.create(input.userId)
    const user = await this.users.findById(id.toString())

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return {
      id: user.idString,
      profileId: user.profileId,
      email: user.email,
      name: user.name,
      provider: user.provider,
      createdAt: user.createdAt
    }
  }
}
