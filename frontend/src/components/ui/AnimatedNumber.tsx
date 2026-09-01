import { useEffect, useRef } from 'react'
import { useMotionPreferences } from '../../hooks/useMotionPreferences'

interface AnimatedNumberProps {
  value: number
  duration?: number
}

/**
 * Counts from 0 to `value` via requestAnimationFrame on first appearance
 * (once, when scrolled into view). The animation is purely visual — the
 * underlying value is rendered once into a visually-hidden span for
 * screen readers, and reduced-motion users get the final value directly.
 */
export function AnimatedNumber({ value, duration = 900 }: AnimatedNumberProps) {
  const { reducedMotion } = useMotionPreferences()
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducedMotion) {
      if (spanRef.current) spanRef.current.textContent = String(value)
      return
    }

    const el = spanRef.current
    if (!el) return

    let raf = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect()
          const start = performance.now()
          const step = (now: number) => {
            const progress = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - progress, 3)
            el.textContent = String(Math.round(value * eased))
            if (progress < 1) raf = requestAnimationFrame(step)
            else el.textContent = String(value)
          }
          raf = requestAnimationFrame(step)
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration, reducedMotion])

  return (
    <span>
      <span ref={spanRef} aria-hidden="true">
        {reducedMotion ? value : 0}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}