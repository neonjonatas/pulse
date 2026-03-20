/// Port for checking and storing known audio content hashes.
export abstract class AudioHashPort {
  /// Returns the trackId of the original track if this hash is a duplicate.
  abstract findByHash(audioHash: string): Promise<string | null>
  abstract store(trackId: string, audioHash: string): Promise<void>
}
