interface PlaybackLayoutProps {
  children: React.ReactNode
}

export function PlaybackLayout(props: PlaybackLayoutProps) {
  const { children } = props

  return (
    <div className="w-[70%] sm:w-[40%] min-w-[300px] max-w-[700px]">
      {children}
    </div>
  )
}
