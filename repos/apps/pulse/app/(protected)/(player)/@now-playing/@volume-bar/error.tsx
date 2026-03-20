'use client'

import type { PageErrorProps } from '@infra/next'

export default function VolumeBarError(props: PageErrorProps) {
  const { error, reset } = props

  function handleReset() {
    reset()
  }

  return (
    <div>
      <h2>Now playing volume bar failed to load.</h2>
      <p>{error.message}</p>
      <button
        className="mt-2 rounded-md border border-border px-3 py-1 text-sm font-medium"
        type="button"
        onClick={handleReset}
      >
        Try again
      </button>
    </div>
  )
}
