'use client'

import { useImmerAtom } from 'jotai-immer'
import { currentTrackAtom } from '@atoms'

import { useHlsLoader } from './hls-loader.hook'
import { useMediaSession } from './hls-media-session.hook'

export function Hls() {
  const [track] = useImmerAtom(currentTrackAtom)

  const { audioRef } = useHlsLoader(track.src)

  useMediaSession({
    track,
    audioRef
  })

  // biome-ignore lint/a11y/useMediaCaption: This hidden player streams music rather than spoken media.
  return <audio ref={audioRef} className="invisible" controls />
}
