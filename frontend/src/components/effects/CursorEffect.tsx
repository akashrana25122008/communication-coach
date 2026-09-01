import { useEffect, useRef } from 'react'
import { useMotionPreferences } from '../../hooks/useMotionPreferences'

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, [data-cursor="interactive"]'

/**
 * Optional custom cursor: a small dot that tracks the pointer closely and a
 * larger ring that follows with slight inertia. Enabled only for fine
 * pointers on non-touch devices and gated off under reduced motion.
 *
 * The native cursor is deliberately never hidden and this layer is fully
 * pointer-events:none — clicking, selecting, scrolling, and keyboard nav are
 * never impaired. Positions are written to CSS variables through a single
 * requestAnimationFrame loop; only transform/opacity animate.
 */
export function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const { enabled } = useMotionPreferences()

  useEffect(() => {
    if (!enabled) return
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let raf = 0
    let mouseX = 0
    let mouseY = 0
    let ringX = -200
    let ringY = -200
    let visible = false

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16
      ringY += (mouseY - ringY) * 0.16
      dot.style.setProperty('--cx', String(mouseX))
      dot.style.setProperty('--cy', String(mouseY))
      ring.style.setProperty('--rx', String(ringX))
      ring.style.setProperty('--ry', String(ringY))
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (visible || raf) return
      visible = true
      dot.style.opacity = '1'
      ring.style.opacity = '1'
      raf = requestAnimationFrame(loop)
    }

    const stop = () => {
      if (!visible) return
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
      cancelAnimationFrame(raf)
      raf = 0
    }

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      start()
    }

    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null
      const interactive = target?.closest?.(INTERACTIVE_SELECTOR) != null
      ring.classList.toggle('is-active', interactive)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseleave', stop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', stop)
      cancelAnimationFrame(raf)
      raf = 0
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}