import { Injectable } from '@nestjs/common'
import { spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'

import { TranscoderPort } from '@domain/ports'

@Injectable()
export class FfmpegTranscoderAdapter implements TranscoderPort {
  async transcode(inputFile: string, bitrate: number): Promise<string> {
    const ext = path.extname(inputFile) || '.mp3'
    const outputFile = path.join(
      '/tmp',
      `mockingbird-${Date.now()}-${bitrate}${ext}`
    )

    await new Promise<void>((resolve, reject) => {
      const proc = spawn('ffmpeg', [
        '-y',
        '-i',
        inputFile,
        '-b:a',
        `${bitrate}k`,
        outputFile
      ])

      let stderr = ''
      proc.stderr?.on('data', (chunk) => {
        stderr += chunk.toString()
      })

      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(outputFile)) {
          resolve()
        } else {
          reject(new Error(`FFmpeg exited ${code}: ${stderr.slice(-500)}`))
        }
      })

      proc.on('error', reject)
    })

    return outputFile
  }

  async generateHls(
    inputFile: string,
    bitrate: number,
    outputRoot: string
  ): Promise<{
    playlist: string
    segmentsDir: string
  }> {
    const variantDir = path.join(outputRoot, String(bitrate))
    const playlist = path.join(variantDir, 'index.m3u8')
    const segmentPattern = path.join(variantDir, 'seg-%03d.ts')

    fs.mkdirSync(variantDir, { recursive: true })

    await new Promise<void>((resolve, reject) => {
      const proc = spawn('ffmpeg', [
        '-y',
        '-i',
        inputFile,
        '-vn',
        '-b:a',
        `${bitrate}k`,
        '-f',
        'hls',
        '-hls_time',
        '6',
        '-hls_playlist_type',
        'vod',
        '-hls_segment_filename',
        segmentPattern,
        playlist
      ])

      let stderr = ''
      proc.stderr?.on('data', (chunk) => {
        stderr += chunk.toString()
      })

      proc.on('close', (code) => {
        if (code === 0 && fs.existsSync(playlist)) {
          resolve()
        } else {
          reject(new Error(`FFmpeg HLS exited ${code}: ${stderr.slice(-500)}`))
        }
      })

      proc.on('error', reject)
    })

    return {
      playlist,
      segmentsDir: variantDir
    }
  }
}
