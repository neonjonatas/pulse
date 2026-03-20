import { NowPlayingLayout } from './lib/ui'

interface PlaybackSlotProps {
  ['track-metadata']?: React.ReactNode
  playback?: React.ReactNode
  ['volume-bar']?: React.ReactNode
}

export default function PlaybackSlot(props: PlaybackSlotProps) {
  const {
    ['track-metadata']: trackMetadata,
    playback,
    ['volume-bar']: volumeBar
  } = props

  return (
    <NowPlayingLayout>
      {trackMetadata}
      {playback}
      {volumeBar}
    </NowPlayingLayout>
  )
}
