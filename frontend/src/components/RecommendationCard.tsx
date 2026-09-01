import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface RecommendationCardProps {
  focusArea: string
  evidence: string
  exerciseTitle: string
  exerciseDuration: number
  exerciseRoute: string
}

export function RecommendationCard({
  focusArea,
  evidence,
  exerciseTitle,
  exerciseDuration,
  exerciseRoute,
}: RecommendationCardProps) {
  return (
    <section className="card-hover relative overflow-hidden rounded-2xl border border-accent/25 bg-surface p-6 shadow-card sm:p-7">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-[64px]"
        aria-hidden="true"
      />

      <div className="relative flex items-center gap-2 text-accent">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-semibold">Today's focus</span>
      </div>

      <h3 className="relative mt-3 text-lg font-semibold leading-snug text-text">
        {focusArea}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-text-muted">
        {evidence}
      </p>

      <div className="relative mt-5 flex flex-col gap-3 rounded-xl border border-border-strong bg-surface-elevated p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wide text-text-faint">
            Recommended exercise
          </span>
          <span className="text-sm font-semibold text-text">
            {exerciseTitle}
          </span>
          <span className="text-xs text-text-muted">
            {exerciseDuration} min
          </span>
        </div>
        <Link
          to={exerciseRoute}
          className="btn group inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink shadow-card transition duration-200 hover:bg-accent-strong hover:shadow-glow hover:-translate-y-px active:scale-[0.98] focus-visible:shadow-ring"
        >
          Start
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}