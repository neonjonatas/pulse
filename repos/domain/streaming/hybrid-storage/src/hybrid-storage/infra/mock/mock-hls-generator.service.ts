import { Injectable, OnModuleInit } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

import { createEventEnvelope } from '@domain/events'
import { HybridStorageEventBusPort } from '@domain/ports'

import { TrackEvent } from '@pack/event-inventory'
const MOCK_BITRATES = [128, 320]
const MOCK_SEGMENT_COUNT = 3

@Injectable()
export class MockHLSGeneratorService implements OnModuleInit {
  constructor(private readonly eventBus: HybridStorageEventBusPort) {}

  onModuleInit(): void {
    if (process.env.MOCK_MODE !== 'true') {
      return
    }

    console.log(
      '[HybridStorage] MOCK_MODE enabled — generating mock HLS package'
    )
    void this.runMockFlow()
  }

  private async runMockFlow(): Promise<void> {
    const trackId = crypto.randomUUID()
    const hlsRoot = path.join('/tmp', `hls-mock-${trackId}`)

    const masterPath = this.writeMasterPlaylist(hlsRoot, trackId)
    const variants = this.writeVariants(hlsRoot)

    console.log('[HybridStorage] Emitting mock track.hls.generated', {
      trackId
    })

    await this.eventBus.emit(
      TrackEvent.HlsGenerated,
      createEventEnvelope(TrackEvent.HlsGenerated, trackId, {
        trackId,
        masterPlaylist: masterPath,
        variants,
        generatedAt: new Date().toISOString()
      })
    )
  }

  private writeMasterPlaylist(hlsRoot: string, trackId: string): string {
    fs.mkdirSync(hlsRoot, { recursive: true })

    const content = [
      '#EXTM3U',
      '#EXT-X-VERSION:3',
      ...MOCK_BITRATES.map(
        (br) => `#EXT-X-STREAM-INF:BANDWIDTH=${br * 1000}\n${br}/index.m3u8`
      )
    ].join('\n')

    const masterPath = path.join(hlsRoot, 'master.m3u8')
    fs.writeFileSync(masterPath, content)

    return masterPath
  }

  private writeVariants(
    hlsRoot: string
  ): Array<{ bitrate: number; playlist: string; segmentsDir: string }> {
    return MOCK_BITRATES.map((bitrate) => {
      const variantDir = path.join(hlsRoot, String(bitrate))
      fs.mkdirSync(variantDir, { recursive: true })

      const segments: string[] = []

      for (let i = 0; i < MOCK_SEGMENT_COUNT; i++) {
        const segName = `seg-${String(i).padStart(3, '0')}.ts`
        fs.writeFileSync(
          path.join(variantDir, segName),
          `mock-segment-${bitrate}-${i}`
        )
        segments.push(segName)
      }

      const playlistContent = [
        '#EXTM3U',
        '#EXT-X-VERSION:3',
        '#EXT-X-TARGETDURATION:6',
        ...segments.map((s) => `#EXTINF:6.0,\n${s}`),
        '#EXT-X-ENDLIST'
      ].join('\n')

      const playlistPath = path.join(variantDir, 'index.m3u8')
      fs.writeFileSync(playlistPath, playlistContent)

      return {
        bitrate,
        playlist: playlistPath,
        segmentsDir: variantDir
      }
    })
  }
}
