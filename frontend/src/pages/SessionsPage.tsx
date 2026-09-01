import { BookOpen, MessagesSquare, Mic } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SessionCard } from '../components/SessionCard'
import { EmptyState, LoadingState, ErrorState } from '../components/ui/states'
import { api } from '../services/api'
import { useDemoResource } from '../hooks/useDemoResource'

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Free Conversation': MessagesSquare,
  'Interview Practice': BookOpen,
  'Speaking Practice': Mic,
}

export function SessionsPage() {
  const { data, loading, error, reload } = useDemoResource(api.getSessions)

  if (loading) return <LoadingState message="Loading your sessions…" />
  if (error) return <ErrorState onRetry={reload} />

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Sessions"
        description="A log of your recent practice sessions."
      />

      {data && data.length > 0 ? (
        <div className="flex flex-col gap-3">
          {data.map((s) => (
            <SessionCard key={s.id} session={s} icon={typeIcons[s.type] ?? MessagesSquare} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No sessions yet"
          description="Complete a practice session to see it here."
          action={
            <a href="/practice" className="text-sm font-medium text-accent hover:text-accent-strong">
              Start practicing →
            </a>
          }
        />
      )}
    </div>
  )
}
