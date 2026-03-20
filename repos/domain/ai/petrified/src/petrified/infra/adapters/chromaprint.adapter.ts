import { Injectable } from '@nestjs/common'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import * as fs from 'node:fs'

import {
  PetrifiedGeneratorPort,
  type FingerprintResult
} from 'src/petrified/application/ports/petrified-generator.port'

const execFileAsync = promisify(execFile)

interface FpcalcOutput {
  FINGERPRINT: string
  DURATION: number
}

/**
 * Generates acoustic fingerprints using the `fpcalc` CLI (Chromaprint).
 * Also computes a SHA-256 audio hash for duplicate detection.
 */
@Injectable()
export class ChromaprintAdapter extends PetrifiedGeneratorPort {
  async generate(filePath: string): Promise<FingerprintResult> {
    const { stdout } = await execFileAsync('fpcalc', ['-json', filePath], {
      timeout: 30_000
    })

    const parsed = JSON.parse(stdout) as FpcalcOutput
    const fingerprintHash = parsed.FINGERPRINT

    const buffer = await fs.promises.readFile(filePath)
    const audioHash = createHash('sha256').update(buffer).digest('hex')

    return { fingerprintHash, audioHash }
  }
}
