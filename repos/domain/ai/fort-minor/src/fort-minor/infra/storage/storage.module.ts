import { Module } from '@nestjs/common'
import type { Provider } from '@nestjs/common'
import { AudioStoragePort } from '@domain/ports/audio-storage.port'
import { MinioAudioStorageAdapter } from './minio-audio-storage.adapter'

const storageProvider: Provider = {
  provide: AudioStoragePort,
  useClass: MinioAudioStorageAdapter
}

/** Provides the AudioStoragePort bound to this micro's own MinIO instance. */
@Module({
  providers: [storageProvider],
  exports: [AudioStoragePort]
})
export class StorageModule {}
