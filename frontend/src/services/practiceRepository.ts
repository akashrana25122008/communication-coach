import type { PracticeSession } from '../types'

/**
 * Persistence layer for practice sessions.
 *
 * Sessions are stored in browser localStorage (this app is frontend-only; the
 * backend/ directory is currently an empty placeholder). UI and domain code
 * must consume sessions through the service layer (practiceService.ts / api.ts),
 * never importing this module directly or touching localStorage themselves.
 *
 * All access is guarded so a disabled or unavailable localStorage never throws
 * into the UI.
 */

const STORAGE_KEY = 'communication-coach.practice-sessions'

const memoryFallback = new Map<string, PracticeSession>()

function read(): PracticeSession[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as PracticeSession[]) : []
  } catch {
    return Array.from(memoryFallback.values())
  }
}

function write(sessions: PracticeSession[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    memoryFallback.clear()
    for (const s of sessions) memoryFallback.set(s.id, s)
  }
}

export const practiceRepository = {
  list(): PracticeSession[] {
    const sessions = read()
    return [...sessions].sort((a, b) =>
      b.completedAt.localeCompare(a.completedAt),
    )
  },

  get(id: string): PracticeSession | undefined {
    return read().find((s) => s.id === id)
  },

  save(session: PracticeSession): void {
    const sessions = read()
    const index = sessions.findIndex((s) => s.id === session.id)
    if (index >= 0) {
      sessions[index] = session
    } else {
      sessions.push(session)
    }
    write(sessions)
  },

  clear(): void {
    memoryFallback.clear()
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* no-op */
    }
  },
}
