import { Flame } from 'lucide-react'
import { SpotlightCard } from './effects/SpotlightCard'

interface ProfileCardProps {
  name: string
  streak: number
  strengths: string[]
  focusAreas: string[]
}

export function ProfileCard({ name, streak, strengths, focusAreas }: ProfileCardProps) {
  return (
    <SpotlightCard className="card-hover flex flex-col gap-5 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent" aria-hidden="true">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text">{name}</span>
            <span className="text-xs text-text-muted">Communication profile</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
          <Flame className="h-3.5 w-3.5" aria-hidden="true" />
          {streak}-day streak
        </span>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
            Strengths
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {strengths.map((s) => (
              <li key={s} className="rounded-md bg-success-soft px-2.5 py-1 text-xs font-medium text-success">
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-faint">
            Focus areas
          </h4>
          <ul className="flex flex-wrap gap-1.5">
            {focusAreas.map((f) => (
              <li key={f} className="rounded-md bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SpotlightCard>
  )
}