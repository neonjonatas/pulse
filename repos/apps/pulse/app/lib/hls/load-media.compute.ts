import Hls from 'hls.js'

export function loadMedia(audio: HTMLAudioElement, src: string): Hls | null {
  if (!Hls.isSupported()) return null

  const hls = new Hls()

  hls.loadSource(src)
  hls.attachMedia(audio)

  return hls
}
