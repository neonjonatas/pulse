/** Result of downloading an audio file from object storage to a temp location. */
export interface DownloadedAudio {
  filePath: string
  cleanup: () => Promise<void>
}

/** Port for downloading audio files from object storage. */
export abstract class AudioStoragePort {
  abstract download(bucket: string, key: string): Promise<DownloadedAudio>
}
