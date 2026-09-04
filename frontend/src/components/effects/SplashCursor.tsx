import { useEffect, useRef } from 'react'
import { useMotionPreferences } from '../../hooks/useMotionPreferences'

/**
 * Liquid, velocity-reactive cursor trail — dashboard route only.
 *
 * A small bright liquid "core" under the pointer drags a connected, curved,
 * translucent purple→blue ribbon behind it. The ribbon is built from a short
 * pointer history that is Catmull-Rom interpolated every frame, so even fast
 * movement yields one continuous fluid path (no gaps, no isolated dots). The
 * ribbon tapers and fades toward the tail and is blended with overlapping
 * translucent ellipses near the head for organic deformation.
 *
 * Drawn on a fixed, viewport-level, pointer-events:none canvas with one
 * requestAnimationFrame loop and ref/closure state only — never React state
 * on pointer move. Auto-disables on touch/coarse pointers, no-hover devices,
 * and prefers-reduced-motion. The native cursor stays visible and exactly
 * under the liquid core.
 */

interface Sample {
  x: number
  y: number
  t: number
}

const MAX_POINTS = 22
const MAX_AGE_MS = 220
const IDLE_MS = 140
const SUBS = 4

// Catmull-Rom interpolation point through p1/p2 (p0/p3 are neighbours).
function cr(p0: Sample, p1: Sample, p2: Sample, p3: Sample, t: number) {
  const t2 = t * t
  const t3 = t2 * t
  return {
    x:
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y:
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  }
}

export function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { enabled } = useMotionPreferences()

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let running = false
    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    // Pointer state in viewport CSS px (matches clientX/clientY 1:1).
    let px = -100
    let py = -100
    let vx = 0
    let vy = 0
    let activity = 0
    let lastMove = 0

    const trail: Sample[] = []

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      vx = e.clientX - px
      vy = e.clientY - py
      px = e.clientX
      py = e.clientY
      lastMove = now
      activity = Math.min(1, activity + 0.5)
      // Drop near-identical samples to avoid zero-length segments; density is
      // recovered by interpolation in the draw step.
      const last = trail[trail.length - 1]
      if (last && Math.hypot(px - last.x, py - last.y) < 1.2) {
        last.x = px
        last.y = py
        last.t = now
      } else {
        trail.push({ x: px, y: py, t: now })
        if (trail.length > MAX_POINTS) trail.shift()
      }
      if (!running) {
        running = true
        raf = requestAnimationFrame(step)
      }
    }

    const forceFade = () => {
      lastMove = 0
    }

    const step = (now: number) => {
      ctx.clearRect(0, 0, w, h)

      // Velocity/activity decay for a natural idle fade-out.
      vx *= 0.85
      vy *= 0.85
      const idle = now - lastMove > IDLE_MS
      if (idle) activity *= 0.86

      // Retain only recent samples so the tail ages out and fades.
      while (trail.length > 0 && now - trail[0].t > MAX_AGE_MS) trail.shift()

      const speed = Math.hypot(vx, vy)
      const energy = Math.min(1, speed / 26)
      const n = trail.length

      if (n >= 2) {
        // Build a smooth, densely-sampled path so movement reads as a single
        // connected curved ribbon regardless of pointer speed.
        const pts: { x: number; y: number }[] = []
        for (let i = 0; i < n - 1; i++) {
          const p0 = trail[Math.max(0, i - 1)]
          const p1 = trail[i]
          const p2 = trail[i + 1]
          const p3 = trail[Math.min(n - 1, i + 2)]
          for (let s = 0; s < SUBS; s++) {
            pts.push(cr(p0, p1, p2, p3, s / SUBS))
          }
        }
        pts.push({ x: trail[n - 1].x, y: trail[n - 1].y })

        const N = pts.length
        const headW = 9 + energy * 11 // px, resolved speed-sensitive head width

        // Ribbon: draw overlapping segments head→tail with round caps so they
        // blend into a continuous fluid tube.
        for (let i = 1; i < N; i++) {
          const f = i / (N - 1) // 1 = head, 0 = tail
          const fade = Math.pow(Math.max(0, f), 1.15)
          const lw = Math.max(0.8, headW * fade)
          const alpha = (0.34 + energy * 0.4) * fade
          // Purple at the head → blue toward the tail.
          ctx.strokeStyle = `rgba(${124 + (76 - 124) * (1 - f) | 0}, ${92 + (124 - 92) * (1 - f) | 0}, 255, ${alpha})`
          ctx.lineWidth = lw
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.beginPath()
          ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
          ctx.lineTo(pts[i].x, pts[i].y)
          ctx.stroke()
        }

        // Overlapping translucent ellipses along the ribbon for liquid
        // deformation; strongest near the head, oriented with local motion.
        for (let i = N - 1; i >= Math.max(1, N - 8); i--) {
          const a = pts[i - 1]
          const b = pts[i]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dir = Math.atan2(dy, dx)
          const f = i / (N - 1)
          const stretch = Math.min(3.4, 1 + (energy * 2.6) * f)
          const bloom = (6 + energy * 9) * (0.4 + f * 0.6)

          ctx.save()
          ctx.translate(b.x, b.y)
          ctx.rotate(dir)
          ctx.scale(stretch, 1)
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, bloom)
          g.addColorStop(0, `rgba(190, 170, 255, ${0.4 * f})`)
          g.addColorStop(0.45, `rgba(124, 92, 255, ${0.3 * f})`)
          g.addColorStop(0.85, `rgba(76, 124, 255, ${0.18 * f})`)
          g.addColorStop(1, 'rgba(76, 124, 255, 0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(0, 0, bloom, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      // Compact bright liquid core directly under the pointer.
      if (px >= 0 && activity > 0.03) {
        const coreA = 0.45 + activity * 0.3 + energy * 0.15
        const coreR = 4.5 + activity * 2
        const core = ctx.createRadialGradient(px, py, 0, px, py, coreR * 2)
        core.addColorStop(0, `rgba(205, 188, 255, ${coreA})`)
        core.addColorStop(0.4, `rgba(140, 110, 255, ${coreA * 0.72})`)
        core.addColorStop(1, 'rgba(76, 124, 255, 0)')
        ctx.fillStyle = core
        ctx.beginPath()
        ctx.arc(px, py, coreR * 2, 0, Math.PI * 2)
        ctx.fill()
      }

      if (trail.length > 0 || activity > 0.03) {
        raf = requestAnimationFrame(step)
      } else {
        running = false
        ctx.clearRect(0, 0, w, h)
      }
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('blur', forceFade)
    document.addEventListener('pointerleave', forceFade)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('blur', forceFade)
      document.removeEventListener('pointerleave', forceFade)
      cancelAnimationFrame(raf)
      running = false
      ctx.clearRect(0, 0, w, h)
    }
  }, [enabled])

  if (!enabled) return null

  return <canvas ref={canvasRef} className="splash-cursor" aria-hidden="true" />
}
