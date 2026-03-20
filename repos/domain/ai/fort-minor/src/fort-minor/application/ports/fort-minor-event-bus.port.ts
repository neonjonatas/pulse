import { EventBus } from '@pack/nats-broker-messaging'

import type { FortMinorEventMap } from '@domain/events'

export abstract class FortMinorEventBusPort extends EventBus<FortMinorEventMap> {}
