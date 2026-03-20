import { Injectable } from '@nestjs/common'
import * as fs from 'node:fs'
import * as path from 'node:path'

import { FileStoragePort, type StoredFileInfo } from '@domain/ports'

@Injectable()
export class FileStorageAdapter extends FileStoragePort {
  async store(
    trackId: string,
    file: Express.Multer.File,
    basePath: string
  ): Promise<StoredFileInfo> {
    const dir = path.join(basePath, trackId)
    await fs.promises.mkdir(dir, { recursive: true })

    const fileName = file.originalname ?? 'audio.mp3'
    const filePath = path.join(dir, fileName)

    const buffer = file.buffer ?? Buffer.from([])
    await fs.promises.writeFile(filePath, buffer)

    const stat = await fs.promises.stat(filePath)

    return {
      filePath,
      fileName,
      fileSize: stat.size
    }
  }
}
