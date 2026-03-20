import { optionalNumberEnv, optionalStringEnv } from '@pack/env-orchestration'

export const UPLOAD_MAX_SIZE_BYTES_DEFAULT = 50 * 1024 * 1024 // 50MB
export const UPLOAD_STORAGE_PATH_DEFAULT = '/tmp/uploads'
export const UPLOAD_STORAGE_BUCKET_DEFAULT = 'tracks'

export function getUploadMaxSizeBytes(): number {
  return optionalNumberEnv(
    'UPLOAD_MAX_SIZE_BYTES',
    UPLOAD_MAX_SIZE_BYTES_DEFAULT
  )
}

export function getUploadStoragePath(): string {
  return optionalStringEnv('UPLOAD_STORAGE_PATH', UPLOAD_STORAGE_PATH_DEFAULT)
}

export function getUploadStorageBucket(): string {
  return optionalStringEnv(
    'UPLOAD_STORAGE_BUCKET',
    UPLOAD_STORAGE_BUCKET_DEFAULT
  )
}
