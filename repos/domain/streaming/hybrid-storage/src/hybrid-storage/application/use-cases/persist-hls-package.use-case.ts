import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

import type { HLSPackage } from '@domain/entities/hls-package.entity'
import { createEventEnvelope } from '@domain/events'
import { HybridStorageEventBusPort, StoragePort } from '@domain/ports'

import { TrackEvent } from '@pack/event-inventory'
@Injectable()
export class PersistHLSPackageUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly eventBus: HybridStorageEventBusPort
  ) {}

  async execute(pkg: HLSPackage): Promise<void> {
    const base = `tracks/${pkg.trackId}/hls`

    await this.storage.putObject({
      key: `${base}/master.m3u8`,
      body: fs.createReadStream(pkg.masterPlaylist),
      contentType: 'application/vnd.apple.mpegurl'
    })

    for (const variant of pkg.variants) {
      const playlistKey = `${base}/${variant.bitrate}/index.m3u8`

      await this.storage.putObject({
        key: playlistKey,
        body: fs.createReadStream(variant.playlist),
        contentType: 'application/vnd.apple.mpegurl'
      })

      const files = fs.readdirSync(variant.segmentsDir)

      for (const file of files) {
        if (!file.endsWith('.ts') && !file.endsWith('.m4s')) continue

        const segmentKey = `${base}/${variant.bitrate}/${file}`

        await this.storage.putObject({
          key: segmentKey,
          body: fs.createReadStream(path.join(variant.segmentsDir, file)),
          contentType: 'video/mp2t'
        })
      }
    }

    console.log(
      `[HybridStorage] Persisted HLS package for track ${pkg.trackId} at ${base}`
    )

    await this.eventBus.emit(
      TrackEvent.HlsStored,
      createEventEnvelope(TrackEvent.HlsStored, pkg.trackId, {
        trackId: pkg.trackId,
        baseKey: base,
        manifestKey: `${base}/master.m3u8`,
        storedAt: new Date().toISOString()
      })
    )
  }
}
