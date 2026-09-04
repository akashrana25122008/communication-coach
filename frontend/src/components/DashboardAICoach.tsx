import { useMotionPreferences } from '../hooks/useMotionPreferences'

/**
 * "Your AI Coach" panel for the dashboard. Presents a futuristic local SVG
 * robot with elegant purple/blue ambient lighting. The copy is presentational
 * only — it frames the product concept and does not claim to perform live
 * analysis the app does not actually carry out.
 *
 * The robot performs a one-time Y-axis 3D flip when the panel mounts, then a
 * subtle idle float. Both are CSS-only and fully disabled under
 * prefers-reduced-motion (content appears immediately).
 */

function CoachRobot() {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Futuristic AI coach robot"
      className="h-32 w-32 sm:h-40 sm:w-40"
    >
      <defs>
        <linearGradient id="coach-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#24242f" />
          <stop offset="1" stopColor="#12121a" />
        </linearGradient>
        <linearGradient id="coach-face" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0c0c12" />
          <stop offset="1" stopColor="#1a1626" />
        </linearGradient>
        <linearGradient id="coach-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#4c7cff" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="coach-ambient" cx="0.5" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#7c5cff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#4c7cff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ambient aura */}
      <circle cx="60" cy="60" r="56" fill="url(#coach-ambient)" />

      {/* antenna */}
      <line x1="60" y1="16" x2="60" y2="8" stroke="#7c5cff" strokeWidth="2" strokeLinecap="round" />
      <circle cx="60" cy="7" r="3" fill="#8f72ff" />

      {/* head */}
      <rect x="34" y="20" width="52" height="44" rx="12" fill="url(#coach-body)" stroke="#3a3a4a" strokeWidth="1.5" />

      {/* face visor */}
      <rect x="41" y="30" width="38" height="24" rx="9" fill="url(#coach-face)" stroke="rgba(124,92,255,0.5)" strokeWidth="1" />

      {/* eyes */}
      <circle cx="52" cy="41" r="4" fill="#7c5cff" />
      <circle cx="68" cy="41" r="4" fill="#4c7cff" />

      {/* neck */}
      <rect x="54" y="64" width="12" height="7" rx="2" fill="#1a1a24" />

      {/* body/torso */}
      <rect x="38" y="71" width="44" height="34" rx="11" fill="url(#coach-body)" stroke="#3a3a4a" strokeWidth="1.5" />
      <circle cx="60" cy="84" r="7" fill="url(#coach-glow)" fillOpacity="0.85" />
      <circle cx="60" cy="84" r="3" fill="#fff" fillOpacity="0.9" />

      {/* shoulders */}
      <rect x="30" y="70" width="10" height="16" rx="5" fill="url(#coach-body)" stroke="#3a3a4a" strokeWidth="1.5" />
      <rect x="80" y="70" width="10" height="16" rx="5" fill="url(#coach-body)" stroke="#3a3a4a" strokeWidth="1.5" />

      {/* glow outline around body for neon feel */}
      <rect x="38" y="71" width="44" height="34" rx="11" fill="none" stroke="url(#coach-glow)" strokeWidth="1.25" strokeOpacity="0.6" />
      <rect x="34" y="20" width="52" height="44" rx="12" fill="none" stroke="url(#coach-glow)" strokeWidth="1.25" strokeOpacity="0.4" />
    </svg>
  )
}

export function DashboardAICoach() {
  const { reducedMotion } = useMotionPreferences()

  return (
    <section
      className="card-hover relative flex flex-col overflow-hidden rounded-lg border border-border bg-surface p-5 shadow-card"
      aria-label="Your AI coach"
    >
      <div
        className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-accent/15 blur-[60px]"
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong/60 bg-surface-subtle px-3 py-1.5 text-xs font-medium text-text-muted">
          <span className="ai-coach-online-dot" aria-hidden="true" />
          AI Coach Online
        </span>
      </div>

      <div className="relative mt-3 flex items-center justify-center">
        <div className={`ai-coach-robot ${reducedMotion ? 'is-reduced' : ''}`} aria-hidden="true">
          <CoachRobot />
        </div>
      </div>

      <div className="relative mt-auto flex flex-col pt-5">
        <h3 className="text-center text-base font-semibold tracking-tight text-text">
          Your AI Coach
        </h3>
        <p className="mt-1.5 text-center text-sm leading-relaxed text-text-muted">
          A dedicated practice partner ready to help you build confidence in every conversation.
        </p>
      </div>
    </section>
  )
}
