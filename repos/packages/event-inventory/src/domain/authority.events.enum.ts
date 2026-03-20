/**
 * NATS subjects emitted by the Authority microservice.
 * These cover the full authentication lifecycle: signup, login,
 * token refresh, and logout.
 */
export enum AuthorityEvent {
  /** Emitted when a new user completes signup (consumed by Slim Shady). */
  UserSignedUp = 'authority.user.signed_up',
  /** Emitted when an existing user logs in (observability only). */
  UserLoggedIn = 'authority.user.logged_in',
  /** Emitted when a JWT access token is refreshed (observability only). */
  TokenRefreshed = 'authority.token.refreshed',
  /** Emitted when a user logs out and the session is destroyed (observability only). */
  UserLoggedOut = 'authority.user.logged_out'
}
