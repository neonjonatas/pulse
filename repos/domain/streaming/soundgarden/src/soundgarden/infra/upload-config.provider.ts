import type { Provider } from '@nestjs/common'

import {
  getUploadMaxSizeBytes,
  getUploadStorageBucket,
  getUploadStoragePath
} from './upload-config'

export const UPLOAD_MAX_SIZE_BYTES = Symbol('UPLOAD_MAX_SIZE_BYTES')
export const UPLOAD_STORAGE_PATH = Symbol('UPLOAD_STORAGE_PATH')
export const UPLOAD_STORAGE_BUCKET = Symbol('UPLOAD_STORAGE_BUCKET')

export const uploadConfigProviders: Provider[] = [
  {
    provide: UPLOAD_MAX_SIZE_BYTES,
    useFactory: getUploadMaxSizeBytes
  },
  {
    provide: UPLOAD_STORAGE_PATH,
    useFactory: getUploadStoragePath
  },
  {
    provide: UPLOAD_STORAGE_BUCKET,
    useFactory: getUploadStorageBucket
  }
]
