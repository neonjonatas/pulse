/**
 * NATS subjects emitted by the Slim Shady (user profile) microservice.
 * These cover the user profile lifecycle.
 */
export enum UserEvent {
  /** Emitted after a user profile is created (consumed by Authority for profileId backfill). */
  ProfileCreated = 'user.profile.created',
  /** Emitted when a user profile is updated. */
  ProfileUpdated = 'user.profile.updated',
  /** Emitted when a user profile is deleted (modeled but not currently produced). */
  ProfileDeleted = 'user.profile.deleted'
}
