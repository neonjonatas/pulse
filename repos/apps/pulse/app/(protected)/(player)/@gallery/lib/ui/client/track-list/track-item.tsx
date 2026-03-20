'use client'

import Image from 'next/image'
import { PlayCircleIcon } from 'lucide-react'

import type { GalleryTrack } from '@domain'
import { msToTime } from '@lib/template'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from '@shadcn/components/ui/item'

interface TrackItemProps {
  track: GalleryTrack
}

export function TrackItem(props: TrackItemProps) {
  const { track } = props

  return (
    <Item variant="outline" className="mb-2 h-16 hover:bg-[--ps-neon-25]">
      <ItemMedia>
        <Image
          className="rounded-sm mr-2"
          src={track.album.cover.imageUrl}
          alt={`${track.album.name} by ${track.album.artist.name}`}
          width={38}
          height={38}
        />
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-lg/tight leading-tight font-bold">
          {track.name}
        </ItemTitle>
        <ItemDescription className="flex items-center justify-between text-sm/tight font-semibold">
          {`${track.album.name} by ${track.album.artist.name} - ${msToTime(track.durationMs)}`}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <PlayCircleIcon
          aria-hidden="true"
          className="size-6 text-[--ps-neon-08]"
        />
      </ItemActions>
    </Item>
  )
}
