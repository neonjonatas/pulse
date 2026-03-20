/**
 * Event subject to payload contract used by the messaging adapters.
 *
 * This remains transport-focused and intentionally independent from kernel's
 * `EventMap` abstract class, which represents domain-level event mapping.
 */
export interface EventContract {
  [eventName: string]: Record<string, unknown>
}
