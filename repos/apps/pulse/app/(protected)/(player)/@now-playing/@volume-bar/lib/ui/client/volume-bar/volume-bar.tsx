'use client'

import { useAtomValue, useSetAtom } from 'jotai'

import { Slider } from '@shadcn/components/ui/slider'
import { volumeAtom } from '@atoms'
import { Volume } from '@domain'

import { getIconByVolume } from './get-icon-by-volume.map'

export function VolumeBar() {
  const volume = useAtomValue(volumeAtom)
  const setVolume = useSetAtom(volumeAtom)
  const icon = getIconByVolume(volume)

  function handleVolumeChange(value: number[]) {
    setVolume(value[0])
  }

  return (
    <label className="flex items-center sm:gap-2 gap-1" htmlFor="volume-bar">
      {icon}
      <Slider
        id="volume-bar"
        aria-label="Sound volume"
        defaultValue={[Number(Volume.Moderate)]}
        max={Number(Volume.Loud)}
        className="mx-auto w-36 bg-neon bg-neon-cool"
        onValueChange={handleVolumeChange}
      />
    </label>
  )
}
