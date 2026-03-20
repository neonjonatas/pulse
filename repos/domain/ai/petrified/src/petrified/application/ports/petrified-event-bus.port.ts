import { EventBus } from '@pack/nats-broker-messaging'

import type { PetrifiedEventMap } from 'src/petrified/domain/events/petrified-event.map'

export abstract class PetrifiedEventBusPort extends EventBus<PetrifiedEventMap> {}
