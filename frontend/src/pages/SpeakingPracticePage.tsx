import { PracticeShell } from './PracticeShell'

export function SpeakingPracticePage() {
  return (
    <PracticeShell
      title="Speaking Practice"
      type="speaking"
      description="Deliver short prepared or impromptu speaking prompts."
      backTo="/practice"
    />
  )
}
