'use client'

import Image from 'next/image'
import { useImmerAtom } from 'jotai-immer'

import { currentTrackAtom } from '@atoms'

export function TrackMetadata() {
  const [track] = useImmerAtom(currentTrackAtom)

  return (
    <div className="flex grow justify-start items-center min-w-44 z-50">
      <Image
        className="rounded-sm mr-2"
        src={track.album.cover.imageUrl}
        alt={`${track.album.name} by ${track.album.artist.name}`}
        priority
        width={56}
        height={56}
      />
      <div className="flex flex-col">
        <span className="text-md/0 font-bold">{track.name}</span>
        <span className="text-sm/2 font-semibold">
          {track.album.artist.name}
        </span>
      </div>
    </div>
  )
}
