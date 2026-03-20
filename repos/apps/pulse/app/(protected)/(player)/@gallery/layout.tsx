import { AudioLinesIcon } from 'lucide-react'

import { Card } from '@shadcn/components/ui/card'

interface GalleryLayoutProps {
  children: React.ReactNode
}

export default function GalleryLayout(props: GalleryLayoutProps) {
  const { children } = props

  return (
    <Card className="sm:col-span-3 col-span-5 surface glassy-surface mx-2 sm:mx-0 sm:ml-2">
      <div className="flex items-center justify-center gap-2">
        <AudioLinesIcon className="size-6 text-(--ps-neon-08)" />
        <span className="text-2xl font-extrabold text-neon">Gallery</span>
      </div>
      {children}
    </Card>
  )
}
