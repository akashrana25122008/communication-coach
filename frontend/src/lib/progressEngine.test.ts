import { describe, expect, it } from 'vitest'
import type { PracticeSession } from '../types'
import {
  computeOverallScore,
  computeProgressPoints,
  computeSnapshot,
  computeStreak,
  computeTotalPracticeMinutes,
  computeAverageScore,
  roundScore,
} from './progressEngine'

function makeSession(
  id: string,
  completedAt: string,
  scores: PracticeSession['scores'],
  durationMinutes = 5,
): PracticeSession {
  return {
    id,
    type: 'free-conversation',
    startedAt: completedAt,
    completedAt,
    durationMinutes,
    overallScore: computeOverallScore(scores),
    scores,
    summary: `Round ${id}`,
    recommendations: [],
  }
}

describe('progressEngine', () => {
  describe('computeOverallScore', () => {
    it('averages the four dimensions and rounds', () => {
      expect(computeOverallScore({ clarity: 82, fluency: 74, structure: 68, conciseness: 79 })).toBe(76)
    })

    it('handles identical scores', () => {
      expect(computeOverallScore({ clarity: 70, fluency: 70, structure: 70, conciseness: 70 })).toBe(70)
    })
  })

  describe('computeStreak', () => {
    it('returns 0 for no sessions', () => {
      expect(computeStreak([])).toBe(0)
    })

    it('counts consecutive days ending today', () => {
      const now = new Date('2026-09-03T12:00:00Z')
      const sessions = [
        makeSession('a', '2026-09-03T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }),
        makeSession('b', '2026-09-02T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }),
        makeSession('c', '2026-09-01T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }),
      ]
      expect(computeStreak(sessions, now)).toBe(3)
    })

    it('resets the streak when there is a gap', () => {
      const now = new Date('2026-09-03T12:00:00Z')
      const sessions = [
        makeSession('a', '2026-09-03T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }),
        makeSession('b', '2026-08-30T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }),
      ]
      expect(computeStreak(sessions, now)).toBe(1)
    })

    it('counts a streak ending yesterday as valid', () => {
      const now = new Date('2026-09-03T12:00:00Z')
      const sessions = [
        makeSession('a', '2026-09-02T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }),
        makeSession('b', '2026-09-01T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }),
      ]
      expect(computeStreak(sessions, now)).toBe(2)
    })
  })

  describe('totals and averages', () => {
    it('sums practice minutes', () => {
      const sessions = [
        makeSession('a', '2026-09-03T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }, 8),
        makeSession('b', '2026-09-02T10:00:00Z', { clarity: 70, fluency: 70, structure: 70, conciseness: 70 }, 12),
      ]
      expect(computeTotalPracticeMinutes(sessions)).toBe(20)
    })

    it('averages overall scores', () => {
      const sessions = [
        makeSession('a', '2026-09-03T10:00:00Z', { clarity: 80, fluency: 80, structure: 80, conciseness: 80 }),
        makeSession('b', '2026-09-02T10:00:00Z', { clarity: 60, fluency: 60, structure: 60, conciseness: 60 }),
      ]
      expect(computeAverageScore(sessions)).toBe(70)
    })

    it('returns 0 average for empty history', () => {
      expect(computeAverageScore([])).toBe(0)
    })
  })

  describe('computeSnapshot', () => {
    it('produces all-zero metrics for empty history', () => {
      const snapshot = computeSnapshot([])
      expect(snapshot.sessionsCompleted).toBe(0)
      expect(snapshot.practiceMinutes).toBe(0)
      expect(snapshot.currentStreak).toBe(0)
      expect(snapshot.averageScore).toBe(0)
    })

    it('computes deltas and trends across sessions', () => {
      const sessions = [
        makeSession('a', '2026-09-03T10:00:00Z', { clarity: 90, fluency: 70, structure: 70, conciseness: 70 }),
        makeSession('b', '2026-09-02T10:00:00Z', { clarity: 60, fluency: 60, structure: 60, conciseness: 60 }),
      ]
      const snapshot = computeSnapshot(sessions, new Date('2026-09-03T12:00:00Z'))
      expect(snapshot.sessionsCompleted).toBe(2)
      expect(snapshot.deltas.clarity).toBeGreaterThan(0)
      expect(snapshot.trends.clarity).toBe('up')
      expect(snapshot.currentStreak).toBe(2)
    })
  })

  describe('computeProgressPoints', () => {
    it('maps sessions in chronological order to points', () => {
      const sessions = [
        makeSession('a', '2026-09-02T10:00:00Z', { clarity: 60, fluency: 60, structure: 60, conciseness: 60 }),
        makeSession('b', '2026-09-03T10:00:00Z', { clarity: 80, fluency: 80, structure: 80, conciseness: 80 }),
      ]
      const points = computeProgressPoints(sessions)
      expect(points).toHaveLength(2)
      expect(points[0].label).toBe('S1')
      expect(points[0].clarity).toBe(60)
      expect(points[1].label).toBe('S2')
      expect(points[1].clarity).toBe(80)
    })

    it('returns empty array for no sessions', () => {
      expect(computeProgressPoints([])).toEqual([])
    })
  })

  it('roundScore rounds to nearest integer', () => {
    expect(roundScore(80.5)).toBe(81)
    expect(roundScore(79.4)).toBe(79)
  })
})
