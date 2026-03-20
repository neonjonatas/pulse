import { Inject, Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import * as fs from 'node:fs'
import * as path from 'node:path'

import { UPLOAD_STORAGE_PATH } from '@infra/upload-config.provider'

const UPLOAD_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

/// Removes upload directories that have exceeded the 24-hour TTL.
@Injectable()
export class UploadCleanupService {
  constructor(
    @Inject(UPLOAD_STORAGE_PATH)
    private readonly storagePath: string
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async removeExpiredUploads(): Promise<void> {
    const cutoff = Date.now() - UPLOAD_TTL_MS

    try {
      const entries = await fs.promises.readdir(this.storagePath, {
        withFileTypes: true
      })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const dirPath = path.join(this.storagePath, entry.name)

        try {
          const stat = await fs.promises.stat(dirPath)

          if (stat.mtimeMs < cutoff) {
            await fs.promises.rm(dirPath, { recursive: true, force: true })
          }
        } catch {
          // Skip entries that cannot be stat'd or removed.
        }
      }
    } catch {
      // Cleanup failures are non-fatal.
    }
  }
}
