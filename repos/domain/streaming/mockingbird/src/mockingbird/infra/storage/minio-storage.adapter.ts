import { Injectable } from '@nestjs/common'
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import { createWriteStream } from 'fs'

import { StoragePort } from '@domain/ports'
import { optionalStringEnv } from '@pack/env-orchestration'

@Injectable()
export class MinioStorageAdapter implements StoragePort {
  private readonly client: S3Client | null
  private readonly uploadsBucket: string
  private readonly transcodedBucket: string

  constructor() {
    const endpoint = process.env.STORAGE_ENDPOINT

    if (!endpoint) {
      this.client = null
      this.uploadsBucket = ''
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

    this.uploadsBucket = optionalStringEnv('STORAGE_UPLOADS_BUCKET', 'uploads')
    this.transcodedBucket = optionalStringEnv(
      'STORAGE_TRANSCODED_BUCKET',
      'transcoded'
    )
  }

  async download(params: { bucket: string; key: string }): Promise<string> {
    if (!this.client) {
      throw new Error('Storage not configured: STORAGE_ENDPOINT is required')
    }

    const bucket = params.bucket || this.uploadsBucket
    const key = this.normalizeKey(params.key, bucket)

    const localPath = path.join(
      '/tmp',
      `mockingbird-${Date.now()}-${path.basename(key)}`
    )

    const response = await this.client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key
      })
    )

    if (!response.Body) {
      throw new Error(`Empty response for object ${bucket}/${key}`)
    }

    const stream = response.Body as NodeJS.ReadableStream
    const writeStream = createWriteStream(localPath)

    await new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream).on('finish', resolve).on('error', reject)
    })

    return localPath
  }

  async upload(objectKey: string, filePath: string): Promise<void> {
    if (!this.client) {
      throw new Error('Storage not configured: STORAGE_ENDPOINT is required')
    }

    const body = fs.readFileSync(filePath)
    const key = this.normalizeKey(objectKey, this.transcodedBucket)

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.transcodedBucket,
        Key: key,
        Body: body,
        ContentType: 'audio/mpeg'
      })
    )

    fs.unlinkSync(filePath)
  }

  /** Strip bucket prefix from key if present (e.g. "uploads/x/y" -> "x/y") */
  private normalizeKey(objectKey: string, forBucket: string): string {
    const prefix = `${forBucket}/`
    if (objectKey.startsWith(prefix)) {
      return objectKey.slice(prefix.length)
    }
    return objectKey
  }
}
