'use client'

import { useEffect } from 'react'
import { useSetImmerAtom, useImmerAtom } from 'jotai-immer'

import { currentTrackAtom, progressAtom } from '@atoms'
import { cn, msToTime } from '@lib/template'
import { Progress } from '@shadcn/components/ui/progress'

export function ProgressBar() {
  const [track] = useImmerAtom(currentTrackAtom)
  const [progress] = useImmerAtom(progressAtom)
  const setProgress = useSetImmerAtom(progressAtom)
  // const [isPaused, setIsPaused] = useAtom(isPausedAtom)

  const duration = track.durationMs

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => ({ milliseconds: prev.milliseconds + 1000 }))
    }, 1000)

    if (progress.milliseconds > duration - 1000) {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [setProgress, duration, progress.milliseconds])

  if (!track) return null

  const percentage = (progress.milliseconds / duration) * 100

  return (
    <div className="grid grid-cols-[48px_1fr_48px] items-center gap-3">
      <span className="h-4 text-sm">{msToTime(progress.milliseconds)}</span>
      <Progress
        value={progress.milliseconds}
        id="progress-upload"
        className={cn(
          'h-1.5 bg-neon transition-all',
          percentage > 50 ? 'bg-neon-warm' : '',
          percentage > 80 ? 'bg-neon-cool' : ''
        )}
        style={{ width: `${percentage}%`, transition: 'width 100ms linear' }}
      />
      <span className="h-4 text-sm">{msToTime(duration)}</span>
      {/* <Hls /> */}
    </div>
  )
}
