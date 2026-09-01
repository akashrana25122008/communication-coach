import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

/**
 * Base card surface. Interaction/lift behavior is added at the call site
 * via the `card-hover` utility or SpotlightCard — cards that need no hover
 * stay flat.
 */
export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}