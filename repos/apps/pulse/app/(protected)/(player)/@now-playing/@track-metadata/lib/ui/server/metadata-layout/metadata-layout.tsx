interface MetadataLayoutProps {
  children: React.ReactNode
}

export function MetadataLayout(props: MetadataLayoutProps) {
  const { children } = props

  return <div className="w-[15%] sm:w-[30%] mobile-hidden">{children}</div>
}
