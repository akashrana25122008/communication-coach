import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  action?: ReactNode
}

export function SectionHeading({ title, action }: SectionHeadingProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold tracking-tight text-text">{title}</h2>
      {action}
    </div>
  )
}
