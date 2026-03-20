export abstract class TranscoderPort {
  abstract transcode(inputFile: string, bitrate: number): Promise<string>
  abstract generateHls(
    inputFile: string,
    bitrate: number,
    outputRoot: string
  ): Promise<{
    playlist: string
    segmentsDir: string
  }>
}
