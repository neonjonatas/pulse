import { Album } from '@domain'
import { artistMock } from '@mocks'

export const hybridTheoryAlbumMock = {
  id: '9d9bd837-d331-4679-bf59-08ac9d8cf3f3',
  name: 'Hybrid Theory',
  description:
    'Hybrid Theory is the debut studio album by American rock band Linkin Park, released on October 24, 2000.',
  releaseDate: new Date('2000-10-24'),
  cover: {
    imageUrl: 'https://i.scdn.co/image/ab67616d000048512cd7568f8895a3c031c2e2fb'
  },
  artist: artistMock
} satisfies Album

export const meteoraAlbumMock = {
  id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  name: 'Meteora',
  description:
    'Meteora is the second studio album by American rock band Linkin Park, released on March 25, 2003.',
  releaseDate: new Date('2003-03-25'),
  cover: {
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/pt/thumb/8/83/Linkin_park-meteora_a.jpg/250px-Linkin_park-meteora_a.jpg'
  },
  artist: artistMock
} satisfies Album

export const minutesToMidnightAlbumMock = {
  id: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  name: 'Minutes to Midnight',
  description:
    'Minutes to Midnight is the third studio album by American rock band Linkin Park, released on May 14, 2007.',
  releaseDate: new Date('2007-05-14'),
  cover: {
    imageUrl: 'https://i.scdn.co/image/ab67616d000048516f4e5f5e8d9c0a1b2c3d4e5f'
  },
  artist: artistMock
} satisfies Album

export const aThousandSunsAlbumMock = {
  id: 'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  name: 'A Thousand Suns',
  description:
    'A Thousand Suns is the fourth studio album by American rock band Linkin Park, released on September 10, 2010.',
  releaseDate: new Date('2010-09-10'),
  cover: {
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/en/a/af/A_Thousand_Suns_Cover2.jpg'
  },
  artist: artistMock
} satisfies Album

export const livingThingsAlbumMock = {
  id: 'd4e5f6a7-b8c9-4012-d345-6789abcdef01',
  name: 'Living Things',
  description:
    'Living Things is the fifth studio album by American rock band Linkin Park, released on June 20, 2012.',
  releaseDate: new Date('2012-06-20'),
  cover: {
    imageUrl: 'https://i.scdn.co/image/ab67616d0000485181f7f8e9e0a1b2c3d4e5f607'
  },
  artist: artistMock
} satisfies Album

export const theHuntingPartyAlbumMock = {
  id: 'e5f6a7b8-c9d0-4123-e456-789abcdef012',
  name: 'The Hunting Party',
  description:
    'The Hunting Party is the sixth studio album by American rock band Linkin Park, released on June 13, 2014.',
  releaseDate: new Date('2014-06-13'),
  cover: {
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/en/f/fa/Linkin_Park%2C_The_Hunting_Party%2C_album_art_final.jpg'
  },
  artist: artistMock
} satisfies Album

export const oneMoreLightAlbumMock = {
  id: 'f6a7b8c9-d0e1-4234-f567-89abcdef0123',
  name: 'One More Light',
  description:
    'One More Light is the seventh and final studio album by American rock band Linkin Park, released on May 19, 2017.',
  releaseDate: new Date('2017-05-19'),
  cover: {
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/en/b/b2/Linkin_Park%2C_One_More_Light%2C_album_art_final.jpeg'
  },
  artist: artistMock
} satisfies Album
