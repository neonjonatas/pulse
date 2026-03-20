export interface HLSVariant {
  bitrate: number
  playlist: string
  segmentsDir: string
}

export class HLSPackage {
  constructor(
    public readonly trackId: string,
    public readonly masterPlaylist: string,
    public readonly variants: HLSVariant[]
  ) {}
}
