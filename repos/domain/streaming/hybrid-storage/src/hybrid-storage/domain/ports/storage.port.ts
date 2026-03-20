import type { Readable } from 'stream'

export abstract class StoragePort {
  abstract putObject(params: {
    key: string
    body: Buffer | Readable
    contentType?: string
  }): Promise<void>
}
