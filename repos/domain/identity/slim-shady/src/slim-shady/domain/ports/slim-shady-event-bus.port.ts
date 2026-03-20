import { EventBus } from '@pack/nats-broker-messaging'

import type { SlimShadyEventMap } from '@domain/events'

export abstract class SlimShadyEventBusPort extends EventBus<SlimShadyEventMap> {}
