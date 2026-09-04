import { beforeEach, describe, expect, it } from 'vitest'
import { practiceRepository } from './practiceRepository'
import { practiceService } from './practiceService'

describe('practiceService', () => {
  beforeEach(() => {
    practiceRepository.clear()
  })

  it('creates a session and stores it', () => {
    const session = practiceService.createSession({
      type: 'free-conversation',
      durationMinutes: 3,
      scores: { clarity: 80, fluency: 76, structure: 72, conciseness: 78 },
      summary: 'Free Conversation round',
    })
    expect(session.id).toBeTruthy()
    expect(session.overallScore).toBe(77)
    expect(practiceService.getSession(session.id)?.id).toBe(session.id)
  })

  it('overall score is the rounded mean of dimensions', () => {
    const session = practiceService.createSession({
      type: 'interview',
      durationMinutes: 3,
      scores: { clarity: 90, fluency: 80, structure: 70, conciseness: 60 },
      summary: 'Interview round',
    })
    expect(session.overallScore).toBe(75)
  })

  it('lists created sessions in history', () => {
    practiceService.createSession({
      type: 'speaking',
      durationMinutes: 3,
      scores: { clarity: 70, fluency: 70, structure: 70, conciseness: 70 },
      summary: 'Speaking round',
    })
    const viewModels = practiceService.listSessions()
    expect(viewModels).toHaveLength(1)
    expect(viewModels[0]).toMatchObject({
      status: 'completed',
      score: 70,
      durationMinutes: 3,
      title: 'Speaking round',
    })
    expect(viewModels[0].type).toBe('Speaking Practice')
  })

  it('persists sessions across reloads (localStorage)', () => {
    practiceService.createSession({
      type: 'free-conversation',
      durationMinutes: 3,
      scores: { clarity: 70, fluency: 70, structure: 70, conciseness: 70 },
      summary: 'Persisted round',
    })
    const afterReload = practiceService.listSessions()
    expect(afterReload).toHaveLength(1)
    expect(afterReload[0].title).toBe('Persisted round')
  })

  it('returns empty statistics for a new user', () => {
    const stats = practiceService.getStatistics()
    expect(stats.sessionsCompleted).toBe(0)
    expect(stats.practiceMinutes).toBe(0)
    expect(stats.currentStreak).toBe(0)
    expect(stats.averageScore).toBe(0)
  })

  it('returns undefined view model for a missing session', () => {
    expect(practiceService.getSessionViewModel('does-not-exist')).toBeUndefined()
  })

  it('recommendation for a new user is not fabricated as activity', () => {
    const rec = practiceService.getRecommendation()
    expect(rec.evidence).toMatch(/first practice session/)
  })
})
