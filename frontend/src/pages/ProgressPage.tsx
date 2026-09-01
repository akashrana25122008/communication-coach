import { api } from '../services/api'
import { PageHeader } from '../components/ui/PageHeader'
import { ProgressChart } from '../components/ProgressChart'
import { useDemoResource } from '../hooks/useDemoResource'
import { LoadingState, ErrorState } from '../components/ui/states'

export function ProgressPage() {
  const { data, loading, error, reload } = useDemoResource(api.getProgress)

  if (loading) return <LoadingState message="Loading your progress…" />
  if (error) return <ErrorState onRetry={reload} />

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <PageHeader
        title="Progress"
        description="Your communication skills across recent sessions."
      />
      {data && (
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
          <ProgressChart data={data} />
        </div>
      )}
    </div>
  )
}
