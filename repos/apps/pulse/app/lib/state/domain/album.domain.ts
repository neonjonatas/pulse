import { Artist } from './artist.domain'

export interface Album {
  id: string
  name: string
  description: string
  releaseDate: Date
  cover: {
    imageUrl: string
  }
  artist: Artist
}
