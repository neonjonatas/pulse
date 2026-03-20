import { Injectable } from '@nestjs/common'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { Readable } from 'stream'

import { StoragePort } from '@domain/ports'
import { optionalStringEnv } from '@infra/env'

@Injectable()
export class MinioStorageAdapter implements StoragePort {
  private readonly client: S3Client | null
  private readonly transcodedBucket: string

  constructor() {
    const endpoint = process.env.STORAGE_ENDPOINT

    if (!endpoint) {
      this.client = null
      this.transcodedBucket = ''
      return
    }

    this.client = new S3Client({
      region: optionalStringEnv('STORAGE_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: optionalStringEnv('STORAGE_ACCESS_KEY', 'minioadmin'),
        secretAccessKey: optionalStringEnv('STORAGE_SECRET_KEY', 'minioadmin')
      },
      forcePathStyle: true,
      endpoint
    })

    this.transcodedBucket = optionalStringEnv(
      'STORAGE_TRANSCODED_BUCKET',
      'transcoded'
    )
  }

  async putObject(params: {
    key: string
    body: Buffer | Readable
    contentType?: string
  }): Promise<void> {
    if (!this.client) {
      throw new Error('Storage not configured: STORAGE_ENDPOINT is required')
    }

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.transcodedBucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType
      })
    )
  }
}
