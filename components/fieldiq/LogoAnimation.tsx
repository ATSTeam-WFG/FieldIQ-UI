'use client'

import { useId } from 'react'

interface LogoAnimationProps {
  size?: number          // width in px — height is calculated from 200:260 viewBox ratio
  className?: string
}

export function LogoAnimation({ size = 80, className }: LogoAnimationProps) {
  const uid = useId()
  const clipId = `fiq-clip-${uid.replace(/:/g, '')}`
  const height = Math.round(size * 260 / 200)

  return (
    <svg
      viewBox="0 0 200 260"
      width={size}
      height={height}
      style={{ display: 'block' }}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M100,248 C72,198 28,150 28,88 A72,72,0,1,1,172,88 C172,150 128,198 100,248Z" />
        </clipPath>
      </defs>

      {/* Pin body */}
      <path
        d="M100,248 C72,198 28,150 28,88 A72,72,0,1,1,172,88 C172,150 128,198 100,248Z"
        fill="#171717"
      />

      <g clipPath={`url(#${clipId})`}>
        {/* Fan polygons */}
        <polygon points="100,22 -10,280 22,280"  fill="#c4a574" opacity="0.3" />
        <polygon points="100,22 48,280 72,280"   fill="#c4a574" opacity="0.65" />
        <polygon points="100,22 86,280 114,280"  fill="#c4a574" />
        <polygon points="100,22 128,280 152,280" fill="#c4a574" opacity="0.65" />
        <polygon points="100,22 178,280 210,280" fill="#c4a574" opacity="0.3" />

        {/* Radial lines */}
        <line x1="100" y1="22" x2="100" y2="280" stroke="#c4a574" strokeWidth="1.5" opacity="0.2" />
        <line x1="100" y1="22" x2="-10" y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.15" />
        <line x1="100" y1="22" x2="48"  y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.15" />
        <line x1="100" y1="22" x2="72"  y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.15" />
        <line x1="100" y1="22" x2="86"  y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.12" />
        <line x1="100" y1="22" x2="114" y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.12" />
        <line x1="100" y1="22" x2="128" y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.15" />
        <line x1="100" y1="22" x2="152" y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.15" />
        <line x1="100" y1="22" x2="210" y2="280" stroke="#c4a574" strokeWidth="0.6" opacity="0.15" />

        {/* Animated horizontal grid lines — staggered */}
        <line className="fiq-grid-line" x1="-20" y1="30" x2="220" y2="30" stroke="#c4a574" strokeWidth="1.2" style={{ animationDelay: '0s' }} />
        <line className="fiq-grid-line" x1="-20" y1="30" x2="220" y2="30" stroke="#c4a574" strokeWidth="1.2" style={{ animationDelay: '0.45s' }} />
        <line className="fiq-grid-line" x1="-20" y1="30" x2="220" y2="30" stroke="#c4a574" strokeWidth="1.2" style={{ animationDelay: '0.9s' }} />
        <line className="fiq-grid-line" x1="-20" y1="30" x2="220" y2="30" stroke="#c4a574" strokeWidth="1.2" style={{ animationDelay: '1.35s' }} />

        {/* Vanishing-point dot */}
        <circle className="fiq-vp-dot" cx="100" cy="22" r="3" fill="#c4a574" />
      </g>

      {/* Pin outline with glow pulse */}
      <path
        className="fiq-pin-outline"
        d="M100,248 C72,198 28,150 28,88 A72,72,0,1,1,172,88 C172,150 128,198 100,248Z"
        fill="none"
        stroke="#c4a574"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
