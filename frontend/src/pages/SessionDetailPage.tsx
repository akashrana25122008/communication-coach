import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { api } from '../services/api'
import { useDemoResource } from '../hooks/useDemoResource'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: sessions, loading } = useDemoResource(api.getSessions)

  const session = sessions?.find((s) => s.id === id)

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={session ? session.title : 'Session'}
        description={session ? `${session.type} · ${session.date}` : 'Session details'}
      />

      {loading ? (
        <p className="text-sm text-text-muted">Loading session…</p>
      ) : session ? (
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-semibold text-text">{session.score}</span>
              <span className="text-sm text-text-muted">Session score</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-text">{session.durationMinutes} min</span>
              <span className="text-sm text-text-muted">Duration</span>
            </div>
          </div>
          <p className="text-sm text-text-muted">
            Full session detail and AI feedback are coming in a later milestone.
          </p>
        </Card>
      ) : (
        <p className="text-sm text-text-muted">Session not found.</p>
      )}

      <div>
        <Button variant="secondary" onClick={() => navigate('/sessions')}>
          ← Back to Sessions
        </Button>
      </div>
    </div>
  )
}
