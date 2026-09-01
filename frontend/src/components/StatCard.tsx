import type { ComponentType } from 'react'
import { SpotlightCard } from './effects/SpotlightCard'

interface StatCardProps {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  hint?: string
}

export function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <SpotlightCard className="card-hover flex items-center gap-4 p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-accent" aria-hidden="true">
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-2xl font-semibold tracking-tight text-text">
          {value}
        </span>
        <span className="truncate text-sm text-text-muted">{label}</span>
      </div>
      {hint && <span className="shrink-0 text-xs font-medium text-text-faint">{hint}</span>}
    </SpotlightCard>
  )
}