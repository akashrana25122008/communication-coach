import { describe, expect, it } from 'vitest'
import type { PracticeSession } from '../types'
import { computeOverallScore } from './progressEngine'
import { computeCommunicationProfile } from './communicationProfile'

function makeSession(
  id: string,
  completedAt: string,
  scores: PracticeSession['scores'],
): PracticeSession {
  return {
    id,
    type: 'interview',
    startedAt: completedAt,
    completedAt,
    durationMinutes: 5,
    overallScore: computeOverallScore(scores),
    scores,
    summary: `Round ${id}`,
    recommendations: [],
  }
}

describe('computeCommunicationProfile', () => {
  it('returns an empty profile for a new user', () => {
    const profile = computeCommunicationProfile([])
    expect(profile.streak).toBe(0)
    expect(profile.strengths).toEqual([])
    expect(profile.focusAreas).toEqual([])
    expect(profile.name).toBeTruthy()
  })

  it('labels dimensions above the average as strengths', () => {
    const sessions = [
      makeSession('a', '2026-09-03T10:00:00Z', {
        clarity: 90,
        fluency: 50,
        structure: 50,
        conciseness: 50,
      }),
    ]
    const profile = computeCommunicationProfile(sessions)
    expect(profile.strengths.some((s) => /clarity/i.test(s))).toBe(true)
    expect(profile.focusAreas.length).toBeGreaterThan(0)
  })

  it('derives strengths and focus areas from real scores only', () => {
    const sessions = [
      makeSession('a', '2026-09-03T10:00:00Z', {
        clarity: 80,
        fluency: 80,
        structure: 60,
        conciseness: 60,
      }),
    ]
    const profile = computeCommunicationProfile(sessions)
    for (const strength of profile.strengths) {
      expect(strength.toLowerCase()).toMatch(
        /(clarity|fluency|structure|conciseness)/,
      )
    }
    for (const focus of profile.focusAreas) {
      expect(focus.toLowerCase()).toMatch(
        /(clarity|fluency|structure|conciseness)/,
      )
    }
  })
})
