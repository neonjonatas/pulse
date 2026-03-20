import { Injectable, NotFoundException } from '@nestjs/common'

import { UseCase } from '@pack/kernel'

import { UserPort } from '@domain/ports'

export interface UserProfileResult {
  id: string
  authId: string
  email: string
  username: string | null
  profile: {
    displayName: string
    avatarUrl: string | null
    bio: string | null
  }
  preferences: {
    theme: 'dark' | 'light' | 'system'
    explicitContentFilter: boolean
    audioQuality: 'low' | 'normal' | 'high' | 'very_high'
    privateSession: boolean
  }
  country: string | null
  account: {
    status: 'active' | 'suspended' | 'deactivated'
  }
  onboarding: {
    completed: boolean
    completedAt: Date | null
  }
  profileCompleteness: number
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class GetUserProfileUseCase extends UseCase<string, UserProfileResult> {
  constructor(private readonly users: UserPort) {
    super()
  }

  async execute(profileId: string): Promise<UserProfileResult> {
    const user = await this.users.findById(profileId)

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
