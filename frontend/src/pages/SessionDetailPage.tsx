import { useParams, useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, EmptyState } from '../components/ui/states'
import { practiceApi } from '../services/api'
import { useDemoResource } from '../hooks/useDemoResource'
import { PRACTICE_SESSION_TYPE_LABEL } from '../types'
import { DIMENSIONS, SCORE_DIMENSION_LABELS } from '../lib/progressEngine'
import type { SessionScore } from '../types'

const dimensionDescription: Record<keyof SessionScore, string> = {
  clarity: 'How clearly your ideas come across',
  fluency: 'Smoothness and flow of speech',
  structure: 'Organization of your responses',
  conciseness: 'Getting to the point efficiently',
}

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: session, loading } = useDemoResource(() =>
    practiceApi.getSession(id ?? ''),
  )

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={session ? session.summary : 'Session'}
        description={
          session
            ? `${PRACTICE_SESSION_TYPE_LABEL[session.type]} · ${formatDate(session.completedAt)}`
            : 'Session details'
        }
      />

      {loading ? (
        <LoadingState message="Loading session…" />
      ) : session ? (
        <>
          <Card className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-3xl font-semibold text-text">{session.overallScore}</span>
                <span className="text-sm text-text-muted">Session score</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-medium text-text">{session.durationMinutes} min</span>
                <span className="text-sm text-text-muted">Duration</span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <h2 className="text-sm font-semibold text-text">Per-dimension scores</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {DIMENSIONS.map((d) => (
                <div key={d} className="flex flex-col gap-1 rounded-lg border border-border bg-surface-elevated p-4">
                  <span className="text-2xl font-semibold text-text">{session.scores[d]}</span>
                  <span className="text-sm font-medium text-text-muted">
                    {SCORE_DIMENSION_LABELS[d]}
                  </span>
                  <span className="text-xs text-text-faint">{dimensionDescription[d]}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <EmptyState
          title="Session not found"
          description="This session may have been removed or the link is invalid."
        />
      )}

      <div>
        <Button variant="secondary" onClick={() => navigate('/sessions')}>
          ← Back to Sessions
        </Button>
      </div>
    </div>
  )
}
