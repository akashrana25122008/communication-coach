import type { CommunicationProfile, PracticeSession } from '../types'
import { USER_NAME } from '../data/demoData'
import {
  DIMENSIONS,
  SCORE_DIMENSION_LABELS,
  computeAverageScore,
  computeStreak,
} from './progressEngine'

/**
 * Communication profile derivation.
 *
 * The profile is derived purely from persisted, scored practice sessions. The
 * language used is neutral and descriptive ("Current strength",
 * "Area to improve") — it never makes a personality or psychological
 * diagnosis, and never fabricates observations that are not backed by scores.
 */

export function computeCommunicationProfile(
  sessions: PracticeSession[],
  now = new Date(),
): CommunicationProfile {
  if (sessions.length === 0) {
    return {
      name: USER_NAME,
      streak: 0,
      strengths: [],
      focusAreas: [],
    }
  }

  const averageScore = computeAverageScore(sessions)
  const averages: Record<keyof PracticeSession['scores'], number> =
    {} as Record<keyof PracticeSession['scores'], number>
  for (const d of DIMENSIONS) {
    const sum = sessions.reduce((acc, s) => acc + s.scores[d], 0)
    averages[d] = Math.round(sum / sessions.length)
  }

  const strengths: string[] = []
  const focusAreas: string[] = []
  for (const d of DIMENSIONS) {
    const label = SCORE_DIMENSION_LABELS[d]
    if (averages[d] >= averageScore) {
      strengths.push(`Clear ${label.toLowerCase()}`)
    } else {
      focusAreas.push(`Improve ${label.toLowerCase()}`)
    }
  }

  return {
    name: USER_NAME,
    streak: computeStreak(sessions, now),
    strengths,
    focusAreas,
  }
}
