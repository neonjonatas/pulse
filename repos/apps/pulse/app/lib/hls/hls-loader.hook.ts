import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

import { loadMedia } from './load-media.compute'

interface UseLoadMediaResult {
  audioRef: React.RefObject<HTMLAudioElement | null>
  hls: Hls | null
}

export function useHlsLoader(src: string): UseLoadMediaResult {
  const [hls, setHls] = useState<Hls | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    if (audio.canPlayType('application/vnd.apple.mpegurl')) {
      audio.src = src
    }

    const hls = loadMedia(audio, src)

    setHls(hls)

    return () => {
      if (hls) hls.destroy()
    }
  }, [src])

  return { audioRef, hls }
}
