import type { EventBus } from '@pack/nats-broker-messaging'

export class NoopEventBusAdapter<
  Events extends Record<string, Record<string, unknown>>
> implements EventBus<Events>
{
  async emit(): Promise<void> {
    // no-op
  }

  on(): () => void {
    return () => {}
  }
}
