'use client'

import { useImmerAtom } from 'jotai-immer'
import { currentTrackAtom } from '@atoms'

import { useHlsLoader } from './hls-loader.hook'
import { useMediaSession } from './hls-media-session.hook'

export function Hls() {
  const [track] = useImmerAtom(currentTrackAtom)

  const { audioRef, hls } = useHlsLoader(track.src)

  useMediaSession({
    track,
    audioRef
  })

  return <audio ref={audioRef} className="invisible" controls />
}
