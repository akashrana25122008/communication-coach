import { beforeEach, describe, expect, it } from 'vitest'
import { practiceRepository } from './practiceRepository'
import type { PracticeSession } from '../types'

function makeSession(id: string, completedAt: string): PracticeSession {
  return {
    id,
    type: 'speaking',
    startedAt: completedAt,
    completedAt,
    durationMinutes: 5,
    overallScore: 75,
    scores: { clarity: 75, fluency: 75, structure: 75, conciseness: 75 },
    summary: `Round ${id}`,
    recommendations: [],
  }
}

describe('practiceRepository', () => {
  beforeEach(() => {
    practiceRepository.clear()
  })

  it('returns empty list initially', () => {
    expect(practiceRepository.list()).toEqual([])
  })

  it('persists a saved session across reads', () => {
    const session = makeSession('s-1', '2026-09-03T10:00:00Z')
    practiceRepository.save(session)
    const all = practiceRepository.list()
    expect(all).toHaveLength(1)
    expect(all[0].id).toBe('s-1')
  })

  it('lists sessions sorted most-recent first', () => {
    practiceRepository.save(makeSession('old', '2026-09-01T10:00:00Z'))
    practiceRepository.save(makeSession('new', '2026-09-03T10:00:00Z'))
    const all = practiceRepository.list()
    expect(all[0].id).toBe('new')
    expect(all[1].id).toBe('old')
  })

  it('gets a session by id', () => {
    practiceRepository.save(makeSession('s-2', '2026-09-03T10:00:00Z'))
    expect(practiceRepository.get('s-2')?.summary).toBe('Round s-2')
    expect(practiceRepository.get('missing')).toBeUndefined()
  })

  it('updates an existing session on re-save', () => {
    const session = makeSession('s-3', '2026-09-03T10:00:00Z')
    practiceRepository.save(session)
    const updated = { ...session, summary: 'Updated' }
    practiceRepository.save(updated)
    expect(practiceRepository.get('s-3')?.summary).toBe('Updated')
    expect(practiceRepository.list()).toHaveLength(1)
  })

  it('clears all sessions', () => {
    practiceRepository.save(makeSession('s-4', '2026-09-03T10:00:00Z'))
    practiceRepository.clear()
    expect(practiceRepository.list()).toEqual([])
  })
})
