import { EventBus } from '@pack/nats-broker-messaging'

import type { MockingbirdEventMap } from '@domain/events'

export abstract class MockingbirdEventBusPort extends EventBus<MockingbirdEventMap> {}
