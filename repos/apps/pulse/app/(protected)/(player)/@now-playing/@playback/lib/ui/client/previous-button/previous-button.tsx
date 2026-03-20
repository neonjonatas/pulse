'use client'

import { SkipBackIcon } from 'lucide-react'

import { Button } from '@shadcn/components/ui/button'

export function PreviousButton() {
  function handlePrevious() {
    // TODO: Implement previous track logic
  }

  return (
    <Button
      variant="ghost"
      className="cursor-pointer"
      aria-label="Previous track"
      size="icon"
      onClick={handlePrevious}
    >
      <SkipBackIcon height={20} width={20} />
    </Button>
  )
}
