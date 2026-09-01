import { Mic } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'

interface PracticeShellProps {
  title: string
  description: string
  backTo: string
}

export function PracticeShell({ title, description, backTo }: PracticeShellProps) {
  const [recording, setRecording] = useState(false)

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

      <Card className="flex flex-col items-center gap-6 p-8 text-center">
        <p className="text-sm text-text-muted">
          Demo UI — voice and analysis features are coming in a later milestone.
        </p>

        <button
          type="button"
          onClick={() => setRecording((r) => !r)}
          className={`group flex h-16 w-16 items-center justify-center rounded-full transition-all duration-200 focus-visible:shadow-ring ${
            recording
              ? 'bg-danger text-white animate-pulse'
              : 'bg-accent text-accent-ink hover:bg-accent-strong'
          }`}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
        >
          <Mic className="h-6 w-6" />
        </button>

        <p className="text-sm text-text-muted">
          {recording ? 'Recording… click the button to stop.' : 'Press to start speaking'}
        </p>
      </Card>

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
