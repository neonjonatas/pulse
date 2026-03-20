import { cn } from '@lib/template'

interface HeaderProps {
  children?: React.ReactNode
  className?: string
}

export function Header(props: HeaderProps) {
  const { children, className = '' } = props

  const layout = 'sm:justify-normal sm:grid sm:grid-cols-[170px_auto_32px]'
  const mobile = 'h-16 flex justify-between items-center'
  const position = 'sticky top-0'
  const spacing = 'px-2'

  const tw = cn(layout, position, spacing, mobile, className)

  if (!children) {
    return <header className={tw} />
  }

  return <header className={tw}>{children}</header>
}
