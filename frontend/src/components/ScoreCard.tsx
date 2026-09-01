import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import type { Trend } from '../types'
import { AnimatedNumber } from './ui/AnimatedNumber'
import { SpotlightCard } from './effects/SpotlightCard'

interface ScoreCardProps {
  title: string
  score: number
  trend?: Trend
  delta?: number
  status?: string
  icon?: ComponentType<{ className?: string }>
  showProgress?: boolean
}

const trendConfig: Record<Trend, { icon: ComponentType<{ className?: string }>; className: string }> = {
  up: { icon: ArrowUpRight, className: 'text-success' },
  down: { icon: ArrowDownRight, className: 'text-danger' },
  flat: { icon: Minus, className: 'text-text-faint' },
}

export function ScoreCard({
  title,
  score,
  trend = 'flat',
  delta = 0,
  status,
  icon: Icon,
  showProgress = true,
}: ScoreCardProps) {
  const { icon: TrendIcon, className: trendColor } = trendConfig[trend]
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <SpotlightCard className="card-hover flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-soft text-accent" aria-hidden="true">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <span className="text-sm font-medium text-text-muted">{title}</span>
        </div>
        <span
          className={`flex items-center gap-0.5 text-sm font-medium ${trendColor}`}
        >
          <TrendIcon className="h-4 w-4" aria-hidden="true" />
          {delta > 0 ? `+${delta}` : delta}
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-semibold tracking-tight text-text">
          <AnimatedNumber value={score} />
        </span>
        {status && (
          <span className="text-xs font-medium text-text-faint">{status}</span>
        )}
      </div>

      {showProgress && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle"
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${title} score`}
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-700 ease-out"
            style={{ width: `${animated ? score : 0}%` }}
          />
        </div>
      )}
    </SpotlightCard>
  )
}