import { useEffect } from 'react'

import { CurrentTrack } from '@domain'

interface MediaSessionProps {
  track: CurrentTrack
  audioRef: React.RefObject<HTMLAudioElement | null>
}

export function useMediaSession(props: MediaSessionProps) {
  const { track, audioRef } = props

  /**
   * if track becomes the dependency for the effect,
   * it will cause a infinite loop.
   * We should know that the track has changed by its unique id.
   */
  // biome-ignore lint/correctness/useExhaustiveDependencies: see above
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.album.artist.name,
      album: track.album.name,
      artwork: [
        {
          src: track.album.cover.imageUrl,
          sizes: '512x512',
          type: 'image/jpeg'
        }
      ]
    })

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play()
    })

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause()
    })
  }, [track.id])
}
