import {
  Volume1Icon,
  Volume2Icon,
  VolumeOffIcon,
  VolumeIcon
} from 'lucide-react'

import { Volume } from '@domain'

import { getClosestIconVolume } from './get-closest-icon-volume.compute'

export function getIconByVolume(volume: number) {
  const closestVolume = getClosestIconVolume(volume)

  const icon = {
    [Volume.Loud]: <Volume2Icon aria-hidden="true" />,
    [Volume.Moderate]: <Volume1Icon aria-hidden="true" />,
    [Volume.Quiet]: <VolumeIcon aria-hidden="true" />,
    [Volume.Off]: <VolumeOffIcon aria-hidden="true" />
  }[closestVolume]

  return icon ?? <Volume1Icon aria-hidden="true" />
}
