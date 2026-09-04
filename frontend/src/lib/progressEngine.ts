import type {
  PracticeSession,
  ProgressPoint,
  ProgressSnapshot,
  SessionScore,
  Trend,
} from '../types'

/**
 * Deterministic progress and statistics engine.
 *
 * These functions are pure: given a list of practice sessions they produce the
 * derived metrics shown across the app (overall / per-dimension scores, change,
 * trend, totals, streak). No machine learning, no randomness, no side effects.
 */

export const DIMENSIONS: (keyof SessionScore)[] = [
  'clarity',
  'fluency',
  'structure',
  'conciseness',
]

export const SCORE_DIMENSION_LABELS: Record<keyof SessionScore, string> = {
  clarity: 'Clarity',
  fluency: 'Fluency',
  structure: 'Structure',
  conciseness: 'Conciseness',
}

const DAY_MS = 24 * 60 * 60 * 1000

export function roundScore(n: number): number {
  return Math.round(n)
}

export function computeOverallScore(scores: SessionScore): number {
  const values = DIMENSIONS.map((d) => scores[d])
  const sum = values.reduce((acc, v) => acc + v, 0)
  return roundScore(values.length > 0 ? sum / values.length : 0)
}

export function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

export function todayKey(now = new Date()): string {
  return dayKey(now.toISOString())
}

function absDay(key: string): number {
  return new Date(`${key}T00:00:00Z`).getTime() / DAY_MS
}

export function computeStreak(sessions: PracticeSession[], now = new Date()): number {
  if (sessions.length === 0) return 0

  const days = new Set<number>()
  for (const s of sessions) {
    days.add(absDay(dayKey(s.completedAt)))
  }

  let cursor = absDay(todayKey(now))
  if (!days.has(cursor)) cursor -= 1

  let streak = 0
  while (days.has(cursor)) {
    streak += 1
    cursor -= 1
  }
  return streak
}

export function computeTotalPracticeMinutes(sessions: PracticeSession[]): number {
  return sessions.reduce((acc, s) => acc + s.durationMinutes, 0)
}

export function computeAverageScore(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0
  const sum = sessions.reduce((acc, s) => acc + s.overallScore, 0)
  return roundScore(sum / sessions.length)
}

function dimensionAverage(sessions: PracticeSession[], dimension: keyof SessionScore): number {
  if (sessions.length === 0) return 0
  const sum = sessions.reduce((acc, s) => acc + s.scores[dimension], 0)
  return roundScore(sum / sessions.length)
}

function deltaBetween(last: number, previous: number): number {
  return last - previous
}

function toTrend(delta: number): Trend {
  if (delta > 0) return 'up'
  if (delta < 0) return 'down'
  return 'flat'
}

function averageOverallBefore(sessions: PracticeSession[], beforeDayKey: string): number {
  const earlier = sessions.filter((s) => dayKey(s.completedAt) < beforeDayKey)
  return computeAverageScore(earlier)
}

export function computeSnapshot(
  sessions: PracticeSession[],
  now = new Date(),
): ProgressSnapshot {
  const sorted = [...sessions].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  )
  const latest = sorted[0]
  const rest = sorted.slice(1)

  const deltas = {} as Record<keyof SessionScore, number>
  const trends = {} as Record<keyof SessionScore, Trend>

  for (const d of DIMENSIONS) {
    const last = latest !== undefined ? latest.scores[d] : 0
    const previous = rest.length > 0 ? dimensionAverage(rest, d) : last
    deltas[d] = deltaBetween(last, previous)
    trends[d] = toTrend(deltas[d])
  }

  const latestOverall = latest !== undefined ? latest.overallScore : 0
  const lastWeekMean = averageOverallBefore(sessions, todayKey(now))
  const weeklyDelta = deltaBetween(latestOverall, lastWeekMean)

  return {
    sessionsCompleted: sessions.length,
    practiceMinutes: computeTotalPracticeMinutes(sessions),
    currentStreak: computeStreak(sessions, now),
    averageScore: computeAverageScore(sessions),
    weeklyDelta,
    deltas,
    trends,
  }
}

export function computeProgressPoints(
  sessions: PracticeSession[],
): ProgressPoint[] {
  const sorted = [...sessions].sort((a, b) =>
    a.completedAt.localeCompare(b.completedAt),
  )
  return sorted.map((s, i) => ({
    session: i + 1,
    label: `S${i + 1}`,
    clarity: s.scores.clarity,
    fluency: s.scores.fluency,
    structure: s.scores.structure,
    conciseness: s.scores.conciseness,
  }))
}
