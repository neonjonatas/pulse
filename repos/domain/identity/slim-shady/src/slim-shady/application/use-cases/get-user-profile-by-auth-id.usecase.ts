import { Injectable, NotFoundException } from '@nestjs/common'

import { UseCase } from '@pack/kernel'

import { UserPort } from '@domain/ports'

import type { UserProfileResult } from './get-user-profile.usecase'

@Injectable()
export class GetUserProfileByAuthIdUseCase extends UseCase<
  string,
  UserProfileResult
> {
  constructor(private readonly users: UserPort) {
    super()
  }

  async execute(authId: string): Promise<UserProfileResult> {
    const user = await this.users.findByAuthId(authId)

    if (!user) {
      throw new NotFoundException('Profile not found')
    }

    return {
      id: user.idString,
      authId: user.authId,
      email: user.email,
      username: user.username,
      profile: {
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio
      },
      preferences: user.preferences,
      country: user.country,
      account: {
        status: user.accountStatus
      },
      onboarding: user.onboarding,
      profileCompleteness: user.profileCompleteness,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
