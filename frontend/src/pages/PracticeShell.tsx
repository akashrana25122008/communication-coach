import { Mic } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { practiceApi } from '../services/api'
import { AudioCaptureController, formatDuration } from '../services/audioCapture'
import { DIMENSIONS, SCORE_DIMENSION_LABELS } from '../lib/progressEngine'
import type { PracticeSessionType, SessionScore } from '../types'

interface PracticeShellProps {
  title: string
  type: PracticeSessionType
  description: string
  backTo: string
}

type CaptureUiState =
  | 'idle'
  | 'requesting-permission'
  | 'recording'
  | 'stopping'
  | 'error'

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
  const capturerRef = useRef<AudioCaptureController | null>(null)
  if (capturerRef.current === null) {
    capturerRef.current = new AudioCaptureController()
  }

  const [captureState, setCaptureState] = useState<CaptureUiState>('idle')
  const [captureError, setCaptureError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [recording, setRecording] = useState(false)
  const [reviewing, setReviewing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState<SessionScore>(initialScores)

  // Clean up an active recording if the component unmounts mid-capture.
  useEffect(() => {
    const capturer = capturerRef.current
    return () => {
      capturer?.cancelRecording()
    }
  }, [])

  // UI display timer — duration shown to the user only; authoritative duration
  // comes from the controller's timestamps.
  useEffect(() => {
    if (captureState !== 'recording') return
    const clock = window.setInterval(() => {
      setElapsedMs(capturerRef.current?.getDuration() ?? 0)
    }, 500)
    return () => window.clearInterval(clock)
  }, [captureState])

  const handleStart = useCallback(async () => {
    setCaptureError(null)
    setElapsedMs(0)
    setCaptureState('requesting-permission')
    setRecording(false)
    try {
      await capturerRef.current?.startRecording()
      setCaptureState('recording')
      setRecording(true)
    } catch {
      const err = capturerRef.current?.getError()
      setCaptureState('error')
      setCaptureError(err?.message ?? 'Could not start the recording.')
    }
  }, [])

  const handleStop = useCallback(async () => {
    if (captureState !== 'recording') return
    setCaptureState('stopping')
    setRecording(false)
    try {
      await capturerRef.current?.stopRecording()
      setElapsedMs(capturerRef.current?.getDuration() ?? 0)
      setCaptureState('idle')
      setReviewing(true)
    } catch {
      const err = capturerRef.current?.getError()
      setCaptureState('error')
      setCaptureError(err?.message ?? 'Finishing the recording failed.')
    }
  }, [captureState])

  const handleCancel = useCallback(() => {
    capturerRef.current?.cancelRecording()
    setCaptureError(null)
    setElapsedMs(0)
    setRecording(false)
    setCaptureState('idle')
  }, [])

  const handleRateManually = useCallback(() => {
    capturerRef.current?.cancelRecording()
    setCaptureError(null)
    setElapsedMs(0)
    setRecording(false)
    setCaptureState('idle')
    setReviewing(true)
  }, [])

  const setScore = (dimension: keyof SessionScore, value: number) => {
    setScores((prev) => ({ ...prev, [dimension]: value }))
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      const capturer = capturerRef.current
      let durationMinutes = 3
      if (capturer && capturer.hasRecording()) {
        durationMinutes = Math.max(1, Math.round((capturer.getDuration() ?? 0) / 60_000))
      }
      const session = await practiceApi.createSession({
        type,
        durationMinutes,
        scores,
        summary: `${title} round`,
      })
      navigate(`/sessions/${session.id}`)
    } finally {
      setSaving(false)
    }
  }

  const stalling = captureState === 'requesting-permission' || captureState === 'stopping'
  const canRecord = captureState === 'idle' || captureState === 'error'

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
            Press record, speak your practice round, then stop to review your scores.
          </p>

          {captureError && (
            <p className="text-sm text-danger" role="alert">
              {captureError}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              if (recording) void handleStop()
              else if (canRecord) void handleStart()
            }}
            disabled={stalling}
            className={`group relative flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-200 focus-visible:shadow-ring disabled:opacity-60 ${
              recording
                ? 'bg-danger-strong text-white'
                : 'bg-accent text-accent-ink hover:bg-accent-strong'
            }`}
            aria-label={
              recording
                ? 'Stop recording'
                : stalling
                  ? captureState === 'stopping'
                    ? 'Stopping recording'
                    : 'Requesting microphone'
                  : 'Start recording'
            }
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
                recording
                  ? 'animate-pulse bg-danger'
                  : captureState === 'stopping'
                    ? 'animate-pulse bg-warning'
                    : 'bg-accent'
              }`}
              aria-hidden="true"
            />
            {recording
              ? `Recording ${formatDuration(elapsedMs)} — click to stop.`
              : captureState === 'requesting-permission'
                ? 'Requesting microphone access…'
                : captureState === 'stopping'
                  ? 'Finishing recording…'
                  : captureError
                    ? 'Recording failed.'
                    : 'Ready — press to start speaking'}
          </p>

          {captureError && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="secondary" onClick={handleStart}>
                Try again
              </Button>
              <Button variant="secondary" onClick={handleRateManually}>
                Rate manually
              </Button>
            </div>
          )}
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
            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
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
