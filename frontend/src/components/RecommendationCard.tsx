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
    <section className="overflow-hidden rounded-2xl bg-accent p-6 text-accent-ink shadow-card sm:p-7">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
        <span className="text-sm font-semibold">Today's focus</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold leading-snug text-accent-ink">
        {focusArea}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-accent-ink/80">
        {evidence}
      </p>

      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-accent-strong p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium uppercase tracking-wide text-accent-ink/70">
            Recommended exercise
          </span>
          <span className="text-sm font-semibold text-accent-ink">
            {exerciseTitle}
          </span>
          <span className="text-xs text-accent-ink/70">
            {exerciseDuration} min
          </span>
        </div>
        <Link
          to={exerciseRoute}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-accent transition-colors duration-200 hover:bg-accent-soft focus-visible:shadow-ring"
        >
          Start
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
