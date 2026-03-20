export type SpotifySearchResult = SpotifyTrackResult | SpotifyAlbumResult

export interface SpotifyTrackResult {
  type: 'track'
  id: string
  name: string
  artists: string[]
  album: string
  albumId: string
  albumImageUrl: string
  durationMs: number
}

export interface SpotifyAlbumResult {
  type: 'album'
  id: string
  name: string
  artists: string[]
  imageUrl: string
  releaseDate: string
  tracks: AlbumTrackRef[]
}

export interface AlbumTrackRef {
  id: string
  name: string
  durationMs: number
}
