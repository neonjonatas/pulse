'use client'

import { PlayIcon, PauseIcon } from 'lucide-react'
import { useAtom } from 'jotai'

import { isPausedAtom } from '@atoms'
import { Button } from '@shadcn/components/ui/button'

export function PlayPauseButton() {
  const [isPaused, setIsPaused] = useAtom(isPausedAtom)

  function handlePlayPause() {
    setIsPaused((prev) => !prev)
  }

  return (
    <Button
      className="cursor-pointer"
      variant="ghost"
      aria-label={isPaused ? 'Play' : 'Pause'}
      onClick={handlePlayPause}
      size="icon"
    >
      {!isPaused ? (
        <PauseIcon height={24} width={24} />
      ) : (
        <PlayIcon height={24} width={24} />
      )}
    </Button>
  )
}
