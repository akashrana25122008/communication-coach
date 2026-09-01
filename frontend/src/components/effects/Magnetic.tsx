import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useMotionPreferences } from '../../hooks/useMotionPreferences'

interface MagneticProps {
  children: ReactNode
  className?: string
  /** Max displacement in px. Kept small deliberately. */
  strength?: number
  /** Activation radius from the element's center, in px. */
  radius?: number
}

/**
 * Pulls a primary CTA gently toward the cursor within `radius` px of its
 * center, max `strength` px. Driven entirely by refs + requestAnimationFrame
 * writing to `transform` (composited) — never React state. Disabled for
 * touch/coarse pointers and reduced-motion users.
 */
export function Magnetic({ children, className = '', strength = 4, radius = 72 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { enabled } = useMotionPreferences()

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    let raf = 0
    let running = false
    let currentX = 0
    let currentY = 0
    let targetX = 0
    let targetY = 0
    let rect: DOMRect | null = null

    const invalidate = () => {
      rect = null
    }

    const loop = () => {
      currentX += (targetX - currentX) * 0.22
      currentY += (targetY - currentY) * 0.22
      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`

      const settled = Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05
      if (settled && targetX === 0 && targetY === 0) {
        el.style.transform = ''
        running = false
        return
      }
      raf = requestAnimationFrame(loop)
    }

    const startLoop = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(loop)
    }

    const onMove = (e: MouseEvent) => {
      if (!rect) rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy)

      if (dist < radius) {
        const k = (radius - dist) / radius
        targetX = -dx * k * (strength / radius)
        targetY = -dy * k * (strength / radius)
      } else {
        targetX = 0
        targetY = 0
      }
      startLoop()
    }

    const onLeave = () => {
      targetX = 0
      targetY = 0
      startLoop()
    }

    window.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)

    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
      cancelAnimationFrame(raf)
      running = false
    }
  }, [enabled, strength, radius])

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  )
}