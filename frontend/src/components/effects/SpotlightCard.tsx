import { useEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { useMotionPreferences } from '../../hooks/useMotionPreferences'

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

/**
 * Card variant with a cursor-following radial light.
 * Position is written to CSS variables (--mx/--my) via a single
 * requestAnimationFrame per mouse event — no React state on pointer move,
 * and only composited/opacity-affecting styles change.
 */
export function SpotlightCard({ children, className = '', ...rest }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { enabled } = useMotionPreferences()

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let rect: DOMRect | null = null

    const invalidate = () => {
      rect = null
    }

    const onMove = (e: MouseEvent) => {
      if (!rect) rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${x}px`)
        el.style.setProperty('--my', `${y}px`)
      })
    }

    el.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)

    return () => {
      el.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  return (
    <div
      ref={ref}
      className={`spotlight-card rounded-lg border border-border bg-surface shadow-card ${className}`}
      {...rest}
    >
      {children}
      {enabled && <div className="spotlight-overlay" aria-hidden="true" />}
    </div>
  )
}