import { ArrowRight, Clock3 } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState, LoadingState, ErrorState } from '../components/ui/states'
import { api } from '../services/api'
import { useDemoResource } from '../hooks/useDemoResource'

export function ExercisesPage() {
  const { data, loading, error, reload } = useDemoResource(api.getExercises)

  if (loading) return <LoadingState message="Loading exercises…" />
  if (error) return <ErrorState onRetry={reload} />

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Exercises"
        description="Focused drills to build specific communication skills."
      />

      {data && data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {data.map((ex) => (
            <Card key={ex.id} className="flex flex-col gap-3 p-5 transition-colors hover:border-border-strong">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-text">{ex.title}</h3>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-text-faint">
                  <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                  {ex.durationMinutes} min
                </span>
              </div>
              <p className="text-sm text-text-muted">{ex.description}</p>
              <a href="/practice" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-strong">
                Start exercise
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No exercises yet"
          description="New exercises will be added soon."
        />
      )}
    </div>
  )
}
