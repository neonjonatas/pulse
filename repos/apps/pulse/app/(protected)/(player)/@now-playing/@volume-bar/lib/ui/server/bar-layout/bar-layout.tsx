interface BarLayoutProps {
  children: React.ReactNode
}

export function BarLayout(props: BarLayoutProps) {
  const { children } = props

  return <div className="w-[15%] sm:w-[30%] mobile-hidden">{children}</div>
}
