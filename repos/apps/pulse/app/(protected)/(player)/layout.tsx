import { Metadata } from 'next'

import { description } from '@state'
import { Header, Logo } from '@lib/ui'

import { PlayerGrid, Search } from './lib/ui'

export const metadata: Metadata = {
  title: 'Pulse - (Dynamic by song playing metadata)',
  description
}

interface PlayerLayoutProps {
  'user-menu'?: React.ReactNode
  'now-playing'?: React.ReactNode
  gallery?: React.ReactNode
  uploader?: React.ReactNode
}

export default function PlayerLayout(props: PlayerLayoutProps) {
  const {
    gallery,
    uploader,
    ['now-playing']: nowPlaying,
    ['user-menu']: userMenu
  } = props

  return (
    <PlayerGrid className="bg-neon">
      <Header className="col-span-5">
        <Logo />
        <Search />
        {userMenu}
      </Header>
      <main id="main-content" className="contents" tabIndex={-1}>
        {gallery}
        {uploader}
        {nowPlaying}
      </main>
    </PlayerGrid>
  )
}
