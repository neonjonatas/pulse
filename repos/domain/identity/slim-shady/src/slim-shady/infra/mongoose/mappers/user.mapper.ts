import { UniqueEntityId } from '@pack/patterns'

import { User } from '@domain/entities'
import { type UserDocument } from '@infra/mongoose'

export const userMapper = {
  toDomain(doc: UserDocument): User {
    return User.create(
      {
        authId: doc.authId,
        email: doc.email,
        username: doc.username,
        profile: {
          displayName: doc.profile.displayName,
          avatarUrl: doc.profile.avatarUrl,
          bio: doc.profile.bio
        },
        preferences: {
          theme: doc.preferences.theme,
          explicitContentFilter: doc.preferences.explicitContentFilter,
          audioQuality: doc.preferences.audioQuality,
          privateSession: doc.preferences.privateSession
        },
        country: doc.country,
        account: {
          status: doc.account.status
        },
        onboarding: {
          completed: doc.onboarding.completed,
          completedAt: doc.onboarding.completedAt
        },
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      },
      UniqueEntityId.create(doc._id.toString())
    )
  },

  toPersistence(user: User) {
    return {
      _id: user.idString,
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
      onboarding: user.onboarding
    }
  }
}
