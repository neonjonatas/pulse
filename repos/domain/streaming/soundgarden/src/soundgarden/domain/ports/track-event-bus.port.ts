import { EventBus } from '@pack/nats-broker-messaging'

import type { TrackEventMap } from '@domain/events'

export abstract class TrackEventBusPort extends EventBus<TrackEventMap> {}
