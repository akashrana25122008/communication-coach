import { BookOpen, Mic, MessagesSquare } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { PracticeCard } from '../components/PracticeCard'
import { practiceTypes } from '../data/demoData'

const icons = [MessagesSquare, BookOpen, Mic]

export function PracticePage() {
  return (
    <div className="flex max-w-6xl flex-col gap-8">
      <PageHeader
        title="Practice"
        description="Choose a practice mode to sharpen your communication skills."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {practiceTypes.map((p, i) => (
          <PracticeCard key={p.id} title={p.title} description={p.description} route={p.route} icon={icons[i]} />
        ))}
      </div>
    </div>
  )
}
