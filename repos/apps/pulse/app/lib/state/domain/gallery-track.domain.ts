import { Album } from './album.domain'

export interface GalleryTrack {
  id: string
  name: string
  description: string
  durationMs: number
  album: Album
}
