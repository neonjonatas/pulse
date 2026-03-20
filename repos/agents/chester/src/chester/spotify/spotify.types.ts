export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface SpotifySearchResponse {
  tracks?: { items: SpotifyApiTrack[] }
  albums?: { items: SpotifyApiAlbum[] }
}

export interface SpotifyApiTrack {
  id: string
  name: string
  duration_ms: number
  artists: SpotifyApiArtist[]
  album: {
    id: string
    name: string
    images: SpotifyApiImage[]
  }
}

export interface SpotifyApiAlbum {
  id: string
  name: string
  artists: SpotifyApiArtist[]
  images: SpotifyApiImage[]
  release_date: string
}

export interface SpotifyApiAlbumTracksResponse {
  items: SpotifyApiSimplifiedTrack[]
  next: string | null
}

export interface SpotifyApiSimplifiedTrack {
  id: string
  name: string
  duration_ms: number
}

export interface SpotifyApiArtist {
  id: string
  name: string
}

export interface SpotifyApiImage {
  url: string
  height: number
  width: number
}
