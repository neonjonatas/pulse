import { EventBus } from '@pack/nats-broker-messaging'

import type { HybridStorageEventMap } from '@domain/events'

export abstract class HybridStorageEventBusPort extends EventBus<HybridStorageEventMap> {}
