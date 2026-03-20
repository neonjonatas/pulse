'use client'

import { SkipForwardIcon } from 'lucide-react'

import { Button } from '@shadcn/components/ui/button'

export function NextButton() {
  function handleNext() {
    // TODO: Implement next track logic
  }

  return (
    <Button
      variant="ghost"
      className="cursor-pointer"
      aria-label="Next track"
      size="icon"
      onClick={handleNext}
    >
      <SkipForwardIcon height={20} width={20} />
    </Button>
  )
}
