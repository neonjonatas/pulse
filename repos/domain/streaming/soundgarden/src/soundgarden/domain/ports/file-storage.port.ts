export interface StoredFileInfo {
  filePath: string
  fileName: string
  fileSize: number
}

export abstract class FileStoragePort {
  abstract store(
    trackId: string,
    file: Express.Multer.File,
    basePath: string
  ): Promise<StoredFileInfo>
}
