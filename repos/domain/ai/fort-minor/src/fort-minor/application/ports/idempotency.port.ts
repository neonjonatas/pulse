export abstract class IdempotencyPort {
  abstract hasProcessed(eventId: string): Promise<boolean>
  abstract markProcessed(eventId: string): Promise<void>
}
