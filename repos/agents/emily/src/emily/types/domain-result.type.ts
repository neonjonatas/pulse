export interface DomainArtist {
  id: string
  name: string
}

export interface DomainAlbum {
  id: string
  name: string
  description: string
  releaseDate: Date
  cover: { imageUrl: string }
  artist: DomainArtist
}

export interface DomainGalleryTrack {
  id: string
  name: string
  description: string
  durationMs: number
  album: DomainAlbum
}

export type DomainSearchResult = DomainGalleryTrack
