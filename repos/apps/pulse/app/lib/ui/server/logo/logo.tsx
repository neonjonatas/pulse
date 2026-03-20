'use client'

interface LogoProps {
  width?: string
  height?: string
  noLabel?: boolean
}

export function Logo(LogoProps: LogoProps) {
  const { width = '32', height = '32', noLabel = false } = LogoProps

  return (
    <div className="flex items-center gap-2">
      <svg
        aria-label="Pulse Logo"
        width={width}
        height={height}
        viewBox="0 0 32 32"
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>Pulse</title>
        <defs>
          {/* Base iridescent gradient */}
          <radialGradient id="baseGradient" cx="30%" cy="25%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#f8a8ff" />
            <stop offset="50%" stopColor="#b388ff" />
            <stop offset="75%" stopColor="#5e7bff" />
            <stop offset="100%" stopColor="#4fd1c5" />
          </radialGradient>

          {/* Warm edge tint */}
          <radialGradient id="warmEdge" cx="15%" cy="20%" r="80%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="40%" stopColor="rgba(255,170,120,0.4)" />
            <stop offset="100%" stopColor="rgba(255,220,120,0.25)" />
          </radialGradient>

          {/* Subtle glow */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow layer */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="url(#baseGradient)"
          filter="url(#softGlow)"
        />

        {/* Warm tint overlay */}
        <circle cx="16" cy="16" r="14" fill="url(#warmEdge)" />

        {/* Highlight */}
        <ellipse cx="11" cy="9" rx="6" ry="4" fill="rgba(255,255,255,0.35)" />
      </svg>
      {!noLabel && <span className="text-2xl font-bold">Pulse</span>}
    </div>
  )
}
