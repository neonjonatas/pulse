import { UniqueEntityId } from '@pack/patterns'

import { Session } from '@domain/entities'
import { AuthorityProvider } from '@domain/value-objects'
import { type SessionDocument } from '@infra/mongoose'

export const sessionMapper = {
  toDomain(doc: SessionDocument): Session {
    const props = {
      userId: doc.userId,
      refreshTokenHash: doc.refreshTokenHash,
      expiresAt: doc.expiresAt,
      createdAt: doc.createdAt,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      provider: doc.provider as AuthorityProvider
    }

    return Session.create(props, UniqueEntityId.create(doc._id.toString()))
  },

  toPersistence(session: Session) {
    return {
      _id: session.idString,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      provider: session.provider
    }
  }
}
