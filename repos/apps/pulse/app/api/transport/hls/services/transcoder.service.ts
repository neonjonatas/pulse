import { spawn } from 'node:child_process'

import { AudioQuality, HlsSegmentDuration } from './transcoder.enums'

export interface TranscoderOptions {
  input: string
  output: string
  quality: AudioQuality
  segmentDuration: HlsSegmentDuration
}

export class TranscoderService {
  transcode(options: TranscoderOptions) {
    const { input, output, quality, segmentDuration } = options

    const ffmpeg = spawn('ffmpeg', [
      '-i',
      input,
      '-codec:a',
      'aac',
      '-b:a',
      quality,
      '-hls_time',
      segmentDuration.toString(),
      '-hls_playlist_type',
      'vod',
      '-hls_segment_filename',
      `${output}/segment_%03d.ts`,
      `${output}/playlist.m3u8`
    ])

    ffmpeg.on('error', this.handleError)
  }

  private handleError(error: Error) {
    console.error('ffmpeg error:', error)
  }
}
