/// Port for preventing duplicate event processing.
export abstract class IdempotencyPort {
  abstract hasProcessed(eventId: string): Promise<boolean>
  abstract markProcessed(eventId: string): Promise<void>
}
