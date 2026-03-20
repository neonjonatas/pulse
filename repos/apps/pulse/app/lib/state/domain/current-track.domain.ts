import { Album } from './album.domain'

export interface CurrentTrack {
  id: string
  name: string
  description: string
  durationMs: number
  src: string
  album: Album
}
