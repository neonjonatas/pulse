import { Volume } from '@domain'

export function getClosestIconVolume(value: number): Volume {
  const volumes = Object.values(Volume) as Volume[]

  return volumes.reduce((closest, current) => {
    const currentDistance = Math.abs(Number(current) - value)
    const closestDistance = Math.abs(Number(closest) - value)

    return currentDistance < closestDistance ? current : closest
  })
}
