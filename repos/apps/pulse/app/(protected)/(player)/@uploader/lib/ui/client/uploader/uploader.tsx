import { FolderUpIcon } from 'lucide-react'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia
} from '@shadcn/components/ui/empty'

export function Uploader() {
  return (
    <Empty className="relative border-dashed border-4 border-slate-400 w-[80%] h-9">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FolderUpIcon className="size-11 text-(--ps-neon-10)" />
        </EmptyMedia>
        <EmptyDescription className="text-2xl font-extrabold text-neon">
          Upload your music.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
