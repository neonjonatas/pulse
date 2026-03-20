import { EventBus } from '@pack/nats-broker-messaging'

import type { StereoEventMap } from '@domain/events'

export abstract class StereoEventBusPort extends EventBus<StereoEventMap> {}
