import type {
  PracticeSession,
  PracticeSessionType,
  Profile,
  ProgressPoint,
  Recommendation,
  ScoreMetric,
  Session,
  SessionScore,
  Statistics,
} from '../types'
import { PRACTICE_SESSION_TYPE_LABEL } from '../types'
import { practiceRepository } from './practiceRepository'
import { computeCommunicationProfile } from '../lib/communicationProfile'
import {
  SCORE_DIMENSION_LABELS,
  computeOverallScore,
  computeProgressPoints,
  computeSnapshot,
} from '../lib/progressEngine'

/**
 * Domain service for practice sessions.
 *
 * Bridges the persistence layer (practiceRepository) and the pure progress /
 * profile engines, exposing the view-model shapes the UI already consumes
 * (through services/api.ts). UI code should never touch the repository or
 * engines directly.
 */

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function toSessionViewModel(s: PracticeSession): Session {
  return {
    id: s.id,
    type: PRACTICE_SESSION_TYPE_LABEL[s.type],
    date: formatDate(s.completedAt),
    score: s.overallScore,
    durationMinutes: s.durationMinutes,
    status: 'completed',
    title: s.summary,
  }
}

export const practiceService = {
  listSessions(): Session[] {
    return practiceRepository.list().map(toSessionViewModel)
  },

  getSession(id: string): PracticeSession | undefined {
    return practiceRepository.get(id)
  },

  getSessionViewModel(id: string): Session | undefined {
    const s = practiceRepository.get(id)
    return s ? toSessionViewModel(s) : undefined
  },

  getProgress(): ProgressPoint[] {
    return computeProgressPoints(practiceRepository.list())
  },

  getStatistics(): Statistics {
    const snapshot = computeSnapshot(practiceRepository.list())
    return {
      sessionsCompleted: snapshot.sessionsCompleted,
      practiceMinutes: snapshot.practiceMinutes,
      currentStreak: snapshot.currentStreak,
      averageScore: snapshot.averageScore,
      weeklyDelta: snapshot.weeklyDelta,
    }
  },

  getScoreMetrics(): ScoreMetric[] {
    const sessions = practiceRepository.list()
    const snapshot = computeSnapshot(sessions)
    return (Object.keys(SCORE_DIMENSION_LABELS) as (keyof SessionScore)[]).map(
      (dimension) => ({
        id: dimension,
        label: SCORE_DIMENSION_LABELS[dimension],
        score: averageDimension(sessions, dimension),
        delta: snapshot.deltas[dimension],
        trend: snapshot.trends[dimension],
        description: dimensionDescription(dimension),
      }),
    )
  },

  getCommunicationProfile(): Profile {
    const profile = computeCommunicationProfile(practiceRepository.list())
    return {
      name: profile.name,
      streak: profile.streak,
      strengths: profile.strengths,
      focusAreas: profile.focusAreas,
    }
  },

  getRecommendation(): Recommendation {
    const sessions = practiceRepository.list()
    const profile = computeCommunicationProfile(sessions)
    const focus = profile.focusAreas[0]
    return {
      focusArea: focus,
      evidence:
        sessions.length === 0
          ? 'Complete your first practice session to see a personalised focus.'
          : `${focus} is an area highlighted by your recent scores.`,
      exercise: {
        id: 'rec-ex',
        title: 'Focused practice round',
        description: 'Run a short session targeting this area.',
        durationMinutes: 5,
      },
    }
  },

  createSession(input: {
    type: PracticeSessionType
    durationMinutes: number
    scores: SessionScore
    summary: string
  }): PracticeSession {
    const completedAt = new Date()
    const overallScore = computeOverallScore(input.scores)
    const session: PracticeSession = {
      id: `s-${Date.now()}`,
      type: input.type,
      startedAt: new Date(completedAt.getTime() - input.durationMinutes * 60_000).toISOString(),
      completedAt: completedAt.toISOString(),
      durationMinutes: input.durationMinutes,
      overallScore,
      scores: input.scores,
      summary: input.summary,
      recommendations: [],
    }
    practiceRepository.save(session)
    return session
  },
}

function averageDimension(
  sessions: PracticeSession[],
  dimension: keyof SessionScore,
): number {
  if (sessions.length === 0) return 0
  const sum = sessions.reduce((acc, s) => acc + s.scores[dimension], 0)
  return Math.round(sum / sessions.length)
}

function dimensionDescription(dimension: keyof SessionScore): string {
  switch (dimension) {
    case 'clarity':
      return 'How clearly your ideas come across'
    case 'fluency':
      return 'Smoothness and flow of speech'
    case 'structure':
      return 'Organization of your responses'
    case 'conciseness':
      return 'Getting to the point efficiently'
  }
}
