import { useEffect, useState } from 'react'

interface MotionPreferences {
  reducedMotion: boolean
  finePointer: boolean
  enabled: boolean
}

const queries = () => ({
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
  finePointer: window.matchMedia('(hover: hover) and (pointer: fine)'),
})

/**
 * Central matchMedia check for motion/pointer capabilities.
 * JS-driven effects (cursor, magnetic, spotlight) consult this once
 * instead of scattering per-component checks. CSS animations are handled
 * by the global prefers-reduced-motion block in index.css.
 */
export function useMotionPreferences(): MotionPreferences {
  const [prefs, setPrefs] = useState<Omit<MotionPreferences, 'enabled'>>(() => {
    const { reducedMotion, finePointer } = queries()
    return {
      reducedMotion: reducedMotion.matches,
      finePointer: finePointer.matches,
    }
  })

  useEffect(() => {
    const { reducedMotion, finePointer } = queries()
    const onReduced = (e: MediaQueryListEvent) =>
      setPrefs((p) => ({ ...p, reducedMotion: e.matches }))
    const onPointer = (e: MediaQueryListEvent) =>
      setPrefs((p) => ({ ...p, finePointer: e.matches }))

    reducedMotion.addEventListener('change', onReduced)
    finePointer.addEventListener('change', onPointer)
    return () => {
      reducedMotion.removeEventListener('change', onReduced)
      finePointer.removeEventListener('change', onPointer)
    }
  }, [])

  return { ...prefs, enabled: prefs.finePointer && !prefs.reducedMotion }
}