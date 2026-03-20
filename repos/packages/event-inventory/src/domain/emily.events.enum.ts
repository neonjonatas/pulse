/**
 * NATS subjects for the Emily transformation agent lifecycle.
 * Covers payload reception, transformation, and forwarding to Pulse.
 */
export enum EmilyEvent {
  SearchReceived = 'emily.search.received',
  SearchTransformed = 'emily.search.transformed',
  TransformFailed = 'emily.transform.failed',
  SearchReturned = 'emily.search.returned'
}
