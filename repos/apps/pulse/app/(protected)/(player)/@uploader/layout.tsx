import { BrainCircuitIcon } from 'lucide-react'

import { Card } from '@shadcn/components/ui/card'

interface UploaderLayoutProps {
  children: React.ReactNode
}

export default function UploaderLayout(props: UploaderLayoutProps) {
  const { children } = props

  return (
    <Card className="mobile-hidden sm:col-span-0 col-span-2 surface glassy-surface mr-2">
      <div className="flex items-center justify-center gap-2 mb-4">
        <BrainCircuitIcon className="size-6 text-(--ps-neon-08)" />
        <span className="text-2xl font-extrabold text-neon">Uploader</span>
      </div>
      <div className="flex flex-col justify-center items-center h-full pb-20">
        {children}
      </div>
    </Card>
  )
}
