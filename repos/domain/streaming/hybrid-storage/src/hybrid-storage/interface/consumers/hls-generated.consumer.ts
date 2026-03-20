import { Injectable, OnModuleInit } from '@nestjs/common'

import { createEventEnvelope } from '@domain/events'
import { HybridStorageEventBusPort } from '@domain/ports'
import { HLSPackage } from '@domain/entities/hls-package.entity'
import { PersistHLSPackageUseCase } from '@application/use-cases'

import { TrackEvent } from '@pack/event-inventory'
@Injectable()
export class HLSGeneratedConsumer implements OnModuleInit {
  private unsubscribe: (() => void) | null = null

  constructor(
    private readonly eventBus: HybridStorageEventBusPort,
    private readonly persistHLSPackage: PersistHLSPackageUseCase
  ) {}

  onModuleInit(): void {
    this.unsubscribe = this.eventBus.on(
      TrackEvent.HlsGenerated,
      async (event) => {
        const payload = event.payload
        const pkg = new HLSPackage(
          payload.trackId,
          payload.masterPlaylist,
          payload.variants
        )

        console.log('[HybridStorage] Processing track.hls.generated', {
          trackId: payload.trackId
        })

        try {
          await this.persistHLSPackage.execute(pkg)
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Failed to persist HLS package'
          console.error('[HybridStorage] Failed to persist HLS package', {
            trackId: payload.trackId,
            error: message
          })
          await this.eventBus.emit(
            TrackEvent.HlsFailed,
            createEventEnvelope(TrackEvent.HlsFailed, payload.trackId, {
              trackId: payload.trackId,
              errorCode: 'HLS_PERSIST_FAILED',
              message
            })
          )
        }
      }
    )

    console.log('[HybridStorage] Subscribed to track.hls.generated')
  }
}
