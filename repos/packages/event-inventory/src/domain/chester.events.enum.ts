/**
 * NATS subjects for the Chester search agent lifecycle.
 * Covers Spotify search orchestration and streaming to Emily.
 */
export enum ChesterEvent {
  SearchStarted = 'chester.search.started',
  SearchEnded = 'chester.search.ended',
  SearchFailed = 'chester.search.failed',
  SearchNotFound = 'chester.search.not_found',
  EmilyStreamed = 'chester.emily.streamed'
}
