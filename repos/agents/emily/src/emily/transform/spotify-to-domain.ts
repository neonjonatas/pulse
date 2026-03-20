import type {
  DomainGalleryTrack,
  DomainAlbum,
  DomainArtist
} from '@emily-types/domain-result.type'

interface SpotifyTrackInput {
  type: 'track'
  id: string
  name: string
  artists: string[]
  album: string
  albumId: string
  albumImageUrl: string
  durationMs: number
}

interface SpotifyAlbumInput {
  type: 'album'
  id: string
  name: string
  artists: string[]
  imageUrl: string
  releaseDate: string
  tracks: { id: string; name: string; durationMs: number }[]
}

type SpotifyInput = SpotifyTrackInput | SpotifyAlbumInput

function buildArtist(name: string): DomainArtist {
  return { id: name.toLowerCase().replace(/\s+/g, '-'), name }
}

function buildAlbumFromTrack(input: SpotifyTrackInput): DomainAlbum {
  const artist = buildArtist(input.artists[0] ?? 'Unknown')
  return {
    id: input.albumId,
    name: input.album,
    description: '',
    releaseDate: new Date(),
    cover: { imageUrl: input.albumImageUrl },
    artist
  }
}

function buildAlbumFromAlbum(input: SpotifyAlbumInput): DomainAlbum {
  const artist = buildArtist(input.artists[0] ?? 'Unknown')
  return {
    id: input.id,
    name: input.name,
    description: `${input.tracks.length} tracks`,
    releaseDate: new Date(input.releaseDate),
    cover: { imageUrl: input.imageUrl },
    artist
  }
}

export function spotifyTrackToDomain(
  input: SpotifyTrackInput
): DomainGalleryTrack {
  return {
    id: input.id,
    name: input.name,
    description: `by ${input.artists.join(', ')}`,
    durationMs: input.durationMs,
    album: buildAlbumFromTrack(input)
  }
}

export function spotifyAlbumToDomain(
  input: SpotifyAlbumInput
): DomainGalleryTrack[] {
  const album = buildAlbumFromAlbum(input)
  return input.tracks.map((track) => ({
    id: track.id,
    name: track.name,
    description: `by ${input.artists.join(', ')} — from ${input.name}`,
    durationMs: track.durationMs,
    album
  }))
}

export function spotifyToDomain(input: SpotifyInput): DomainGalleryTrack[] {
  if (input.type === 'track') {
    return [spotifyTrackToDomain(input)]
  }
  return spotifyAlbumToDomain(input)
}

export function transformAll(inputs: SpotifyInput[]): DomainGalleryTrack[] {
  return inputs.flatMap(spotifyToDomain)
}
