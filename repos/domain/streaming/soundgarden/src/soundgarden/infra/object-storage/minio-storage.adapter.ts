import { Injectable } from '@nestjs/common'
import {
  S3Client,
  PutObjectCommand,
  type S3ClientConfig
} from '@aws-sdk/client-s3'

import {
  ObjectStoragePort,
  type StorageRef,
  type UploadedStorageRefs
} from '@domain/ports/object-storage.port'
import { optionalStringEnv } from '@pack/env-orchestration'

interface StorageTarget {
  bucket: string
  client: S3Client | null
}

function buildS3Client(
  primaryPrefix: string,
  fallbackPrefix?: string
): S3Client | null {
  const prefix = process.env[`${primaryPrefix}ENDPOINT`]
    ? primaryPrefix
    : (fallbackPrefix ?? primaryPrefix)
  const endpoint = process.env[`${prefix}ENDPOINT`]
  if (!endpoint) return null

  const region = optionalStringEnv(`${prefix}REGION`, 'us-east-1')
  const accessKeyId = optionalStringEnv(`${prefix}ACCESS_KEY`, 'minioadmin')
  const secretAccessKey = optionalStringEnv(`${prefix}SECRET_KEY`, 'minioadmin')

  const config: S3ClientConfig = {
    region,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
    endpoint
  }

  return new S3Client(config)
}

function storageBucket(
  primaryPrefix: string,
  fallbackPrefix: string,
  defaultBucket: string
): string {
  return (
    process.env[`${primaryPrefix}BUCKET`] ??
    process.env[`${fallbackPrefix}BUCKET`] ??
    defaultBucket
  )
}

@Injectable()
export class MinioStorageAdapter extends ObjectStoragePort {
  private readonly soundgardenClient = buildS3Client('STORAGE_')
  private readonly petrifiedClient = buildS3Client(
    'PETRIFIED_STORAGE_',
    'FINGERPRINT_STORAGE_'
  )
  private readonly fortMinorClient = buildS3Client(
    'FORT_MINOR_STORAGE_',
    'TRANSCRIPTION_STORAGE_'
  )

  async upload(
    trackId: string,
    fileName: string,
    soundgardenBucket: string,
    buffer: Buffer,
    contentType: string
  ): Promise<UploadedStorageRefs> {
    const key = `uploads/${trackId}/${fileName}`
    const refs: UploadedStorageRefs = {}

    const targets: Array<[keyof UploadedStorageRefs, StorageTarget]> = [
      [
        'soundgarden',
        { bucket: soundgardenBucket, client: this.soundgardenClient }
      ],
      [
        'petrified',
        {
          bucket: storageBucket(
            'PETRIFIED_STORAGE_',
            'FINGERPRINT_STORAGE_',
            'uploads'
          ),
          client: this.petrifiedClient
        }
      ],
      [
        'fortMinor',
        {
          bucket: storageBucket(
            'FORT_MINOR_STORAGE_',
            'TRANSCRIPTION_STORAGE_',
            'uploads'
          ),
          client: this.fortMinorClient
        }
      ]
    ]

    for (const [name, target] of targets) {
      if (!target.client) continue

      await this.uploadToTarget(
        target.client,
        target.bucket,
        key,
        buffer,
        contentType
      )

      refs[name] = { bucket: target.bucket, key }
    }

    if (refs.petrified) refs.fingerprint = refs.petrified
    if (refs.fortMinor) refs.transcription = refs.fortMinor

    return refs
  }

  private async uploadToTarget(
    client: S3Client,
    bucket: string,
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<StorageRef> {
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        ContentLength: buffer.length
      })
    )

    return { bucket, key }
  }
}
