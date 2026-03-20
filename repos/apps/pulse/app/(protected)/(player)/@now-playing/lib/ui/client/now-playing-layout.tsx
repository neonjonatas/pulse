import { cn } from '@lib/template'

interface NowPlayingLayoutProps {
  children: React.ReactNode
}

export function NowPlayingLayout(props: NowPlayingLayoutProps) {
  const { children } = props

  const layout =
    'w-full sm:w-auto flex flex-row justify-center sm:justify-between items-center col-span-5 '
  const bar =
    'p-2 sticky bottom-0 h-[88px] border-none text-foreground font-bold surface glassy-surface'

  return <aside className={cn(layout, bar)}>{children}</aside>
}
