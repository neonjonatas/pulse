import { VolumeBar, BarLayout } from '@volume-bar/ui'

export default function VolumeSlot() {
  return (
    <BarLayout>
      <div className="flex items-center justify-end">
        <VolumeBar />
      </div>
    </BarLayout>
  )
}
