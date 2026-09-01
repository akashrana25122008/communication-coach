import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '../types'
import { SpotlightCard } from './effects/SpotlightCard'

interface SessionCardProps {
  session: Session
  icon: ComponentType<{ className?: string }>
}

const statusLabel: Record<Session['status'], string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  pending: 'Upcoming',
}

const statusClass: Record<Session['status'], string> = {
  completed: 'bg-success-soft text-success',
  'in-progress': 'bg-warning-soft text-warning',
  pending: 'bg-surface-subtle text-text-muted',
}

export function SessionCard({ session, icon: Icon }: SessionCardProps) {
  return (
    <Link
      to={`/sessions/${session.id}`}
      className="block rounded-lg focus-visible:shadow-ring"
    >
      <SpotlightCard className="card-hover flex items-center gap-4 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-accent" aria-hidden="true">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-text">{session.title}</span>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[session.status]}`}>
              {statusLabel[session.status]}
            </span>
          </div>
          <span className="text-xs text-text-muted">
            {session.type} · {session.date}
          </span>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-text">{session.score}</span>
          <span className="text-xs text-text-faint">{session.durationMinutes} min</span>
        </div>
      </SpotlightCard>
    </Link>
  )
}