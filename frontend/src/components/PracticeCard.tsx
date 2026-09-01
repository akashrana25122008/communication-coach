import { ArrowRight } from 'lucide-react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { Card } from './ui/Card'

interface PracticeCardProps {
  title: string
  description: string
  route: string
  icon: ComponentType<{ className?: string }>
}

export function PracticeCard({ title, description, route, icon: Icon }: PracticeCardProps) {
  return (
    <Link
      to={route}
      className="group block h-full focus-visible:shadow-ring rounded-lg"
    >
      <Card className="flex h-full flex-col gap-4 p-5 transition-colors duration-200 group-hover:border-border-strong">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-subtle text-accent transition-colors duration-200 group-hover:bg-accent-soft" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex flex-1 flex-col gap-1.5">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          <p className="text-sm text-text-muted">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
          Start Practice
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Card>
    </Link>
  )
}
