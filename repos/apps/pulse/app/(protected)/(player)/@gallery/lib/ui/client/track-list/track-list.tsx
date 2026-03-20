'use client'

import { useImmerAtom } from 'jotai-immer'
import { ScrollArea } from '@shadcn/components/ui/scroll-area'
import { galleryAtom } from '@atoms'

import { TrackItem } from './track-item'

export function TrackList() {
  const [tracks] = useImmerAtom(galleryAtom)

  return (
    <ScrollArea className="h-full w-full rounded-sm pb-12">
      <div className="pl-2">
        {tracks.map((track) => (
          <TrackItem key={track.id} track={track} />
        ))}
      </div>
    </ScrollArea>
  )
}
