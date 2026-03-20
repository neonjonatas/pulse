import { cn } from '@lib/template'

interface PlayerGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function PlayerGrid(props: PlayerGridProps) {
  const { children, className } = props

  const layout = 'grid grid-rows-[auto_1fr_auto] sm:grid-cols-5'
  const spacing = 'h-screen overflow-hidden gap-2'
  const mobile = 'grid-cols-1'

  return (
    <div className={cn(layout, spacing, mobile, className)}>{children}</div>
  )
}
