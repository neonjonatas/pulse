'use client'

import type { PageErrorProps } from '@infra/next'

export default function LoginError(props: PageErrorProps) {
  const { error, reset } = props

  function handleReset() {
    reset()
  }

  return (
    <div>
      <h2>Login failed to load.</h2>
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
