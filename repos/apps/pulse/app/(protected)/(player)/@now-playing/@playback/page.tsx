import {
  NextButton,
  PlaybackLayout,
  PlayPauseButton,
  PreviousButton,
  ProgressBar
} from '@playback/ui'

export default function PlaybackSlot() {
  return (
    <PlaybackLayout>
      <div className="flex items-center justify-center gap-4">
        <PreviousButton />
        <PlayPauseButton />
        <NextButton />
      </div>
      <ProgressBar />
    </PlaybackLayout>
  )
}
