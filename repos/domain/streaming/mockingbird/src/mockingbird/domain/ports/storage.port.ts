export abstract class StoragePort {
  abstract download(params: { bucket: string; key: string }): Promise<string>
  abstract upload(objectKey: string, filePath: string): Promise<void>
}
