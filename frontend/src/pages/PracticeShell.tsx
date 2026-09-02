import { Mic } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { practiceApi } from '../services/api'
import { DIMENSIONS, SCORE_DIMENSION_LABELS } from '../lib/progressEngine'
import type { PracticeSessionType, SessionScore } from '../types'

interface PracticeShellProps {
  title: string
  type: PracticeSessionType
  description: string
  backTo: string
}

const DIMENSION_HELP: Record<keyof SessionScore, string> = {
  clarity: 'How clearly your ideas came across',
  fluency: 'Smoothness and flow of speech',
  structure: 'Organization of your response',
  conciseness: 'Getting to the point efficiently',
}

function initialScores(): SessionScore {
  return { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }
}

export function PracticeShell({ title, type, description, backTo }: PracticeShellProps) {
  const navigate = useNavigate()
  const [recording, setRecording] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState<SessionScore>(initialScores)

  const setScore = (dimension: keyof SessionScore, value: number) => {
    setScores((prev) => ({ ...prev, [dimension]: value }))
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      const session = await practiceApi.createSession({
        type,
        durationMinutes: 3,
        scores,
        summary: `${title} round`,
      })
      navigate(`/sessions/${session.id}`)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    setReviewing(false)
    setRecording(false)
  }

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        action={
          <Link to={backTo}>
            <Button variant="secondary" size="sm">
              ← Back to Practice
            </Button>
          </Link>
        }
      />

      {!reviewing ? (
        <Card className="relative flex flex-col items-center gap-6 overflow-hidden p-8 text-center">
          <p className="text-sm text-text-muted">
            Press record, speak your practice round, then rate your performance.
          </p>

          <button
            type="button"
            onClick={() => setRecording((r) => !r)}
            className={`group relative flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-200 focus-visible:shadow-ring ${
              recording
                ? 'bg-danger-strong text-white'
                : 'bg-accent text-accent-ink hover:bg-accent-strong'
            }`}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording && (
              <span
                className="absolute inset-0 -z-10 animate-ping rounded-full bg-danger/40"
                aria-hidden="true"
              />
            )}
            <Mic className="h-6 w-6" />
          </button>

          <p className="inline-flex items-center gap-2 text-sm text-text-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                recording ? 'animate-pulse bg-danger' : 'bg-accent'
              }`}
              aria-hidden="true"
            />
            {recording ? 'Recording… click the button to stop.' : 'Ready — press to start speaking'}
          </p>

          <Button variant="secondary" onClick={() => setReviewing(true)}>
            Rate my session
          </Button>
        </Card>
      ) : (
        <Card className="flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold tracking-tight text-text">How did it go?</h2>
            <p className="text-sm text-text-muted">
              Rate each dimension for this round. Your scores are saved to your history.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {DIMENSIONS.map((d) => (
              <div key={d} className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <label htmlFor={`rating-${d}`} className="text-sm font-medium text-text">
                    {SCORE_DIMENSION_LABELS[d]}
                  </label>
                  <span className="text-sm font-semibold text-accent">{scores[d]}</span>
                </div>
                <span className="text-xs text-text-faint">{DIMENSION_HELP[d]}</span>
                <input
                  id={`rating-${d}`}
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={scores[d]}
                  onChange={(e) => setScore(d, Number(e.target.value))}
                  className="accent-accent"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={handleBack} disabled={saving}>
              Back
            </Button>
            <Button onClick={handleComplete} disabled={saving}>
              {saving ? 'Saving…' : 'Complete & save'}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" aria-label="Tips">
        {[
          { heading: 'Be clear', body: 'Articulate your thoughts and pause between ideas.' },
          { heading: 'Be concise', body: 'Keep your answers focused without rambling.' },
          { heading: 'Be structured', body: 'Organise your response with a clear flow.' },
        ].map((tip) => (
          <Card key={tip.heading} className="p-4">
            <h3 className="mb-1 text-sm font-semibold text-text">{tip.heading}</h3>
            <p className="text-sm text-text-muted">{tip.body}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
