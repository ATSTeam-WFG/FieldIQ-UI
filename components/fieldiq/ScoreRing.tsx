'use client'

interface ScoreRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

export function ScoreRing({ score, size = 120, strokeWidth = 10 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const fillFraction = Math.max(0, Math.min(100, score)) / 100
  const dashOffset = circumference * (1 - fillFraction)
  const center = size / 2

  return (
    <svg
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      {/* Background ring */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      {/* Foreground arc — starts at 12 o'clock via rotation */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="#c4a574"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Score number */}
      <text
        x={center}
        y={center - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--foreground)"
        fontSize={20}
        fontWeight={700}
        fontFamily="Inter, sans-serif"
      >
        {score}
      </text>
      {/* "/ 100" label */}
      <text
        x={center}
        y={center + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--muted)"
        fontSize={11}
        fontFamily="Inter, sans-serif"
      >
        / 100
      </text>
    </svg>
  )
}
