import axios from 'axios'
import { getSpotifyToken, invalidateToken } from './spotify-auth'
import type {
  SpotifySearchResponse,
  SpotifyApiTrack,
  SpotifyApiAlbum,
  SpotifyApiAlbumTracksResponse
} from './spotify.types'
import type {
  SpotifySearchResult,
  SpotifyTrackResult,
  SpotifyAlbumResult,
  AlbumTrackRef
} from '@chester-types/search-result.type'

const API_BASE = 'https://api.spotify.com/v1'

async function spotifyGet<T>(path: string): Promise<T> {
  const token = await getSpotifyToken()
  try {
    const response = await axios.get<T>(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10_000
    })
    return response.data
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      invalidateToken()
    }
    throw error
  }
}

function normalizeTrack(track: SpotifyApiTrack): SpotifyTrackResult {
  return {
    type: 'track',
    id: track.id,
    name: track.name,
    artists: track.artists.map((a) => a.name),
    album: track.album.name,
    albumId: track.album.id,
    albumImageUrl: track.album.images[0]?.url ?? '',
    durationMs: track.duration_ms
  }
}

async function fetchAllAlbumTracks(albumId: string): Promise<AlbumTrackRef[]> {
  const tracks: AlbumTrackRef[] = []
  let url: string | null = `/albums/${albumId}/tracks?limit=50`

  while (url) {
    const page: SpotifyApiAlbumTracksResponse =
      await spotifyGet<SpotifyApiAlbumTracksResponse>(url)
    for (const t of page.items) {
      tracks.push({ id: t.id, name: t.name, durationMs: t.duration_ms })
    }
    url = page.next ? page.next.replace(API_BASE, '') : null
  }

  return tracks
}

async function normalizeAlbum(
  album: SpotifyApiAlbum
): Promise<SpotifyAlbumResult> {
  const tracks = await fetchAllAlbumTracks(album.id)
  return {
    type: 'album',
    id: album.id,
    name: album.name,
    artists: album.artists.map((a) => a.name),
    imageUrl: album.images[0]?.url ?? '',
    releaseDate: album.release_date,
    tracks
  }
}

export async function searchTracks(
  query: string,
  limit = 5
): Promise<SpotifyTrackResult[]> {
  const data = await spotifyGet<SpotifySearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
  )
  return (data.tracks?.items ?? []).map(normalizeTrack)
}

export async function searchAlbums(
  query: string,
  limit = 5
): Promise<SpotifyAlbumResult[]> {
  const data = await spotifyGet<SpotifySearchResponse>(
    `/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}`
  )
  const albums = data.albums?.items ?? []
  return Promise.all(albums.map(normalizeAlbum))
}

export async function searchAll(
  query: string,
  limit = 5
): Promise<SpotifySearchResult[]> {
  const [tracks, albums] = await Promise.all([
    searchTracks(query, limit),
    searchAlbums(query, limit)
  ])
  return [...tracks, ...albums]
}
