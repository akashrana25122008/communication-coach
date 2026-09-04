import type { Exercise, PracticeType } from '../types'

/**
 * Static catalogue data (not user activity).
 *
 * This module contains ONLY static, non-user content: the app user's name and
 * the curated exercise / practice-type catalogues. It intentionally holds NO
 * fabricated sessions, scores, trends, statistics, or profile content — those
 * are now derived from the user's own persisted practice sessions via
 * services/practiceService.ts and the lib/ progress & profile engines.
 *
 * UI must consume data through the service layer (services/api.ts /
 * services/practiceService.ts), never by importing this module directly for
 * live data.
 */

export const USER_NAME = 'Alex'

export const exercises: Exercise[] = [
  {
    id: 'ex-1',
    title: 'Filler word reduction',
    description: 'Practise answering prompts while limiting "um" and "like".',
    durationMinutes: 5,
  },
  {
    id: 'ex-2',
    title: 'Structured storytelling',
    description: 'Frame short answers using a clear beginning, middle, and end.',
    durationMinutes: 7,
  },
  {
    id: 'ex-3',
    title: 'Concise summarising',
    description: 'Deliver a 60-second summary of a longer idea.',
    durationMinutes: 4,
  },
  {
    id: 'ex-4',
    title: 'Fluent run-through',
    description: 'Repeat a passage to build smoothness without pausing.',
    durationMinutes: 6,
  },
]

export const practiceTypes: PracticeType[] = [
  {
    id: 'free-conversation',
    title: 'Free Conversation',
    description: 'Talk naturally about a topic and build everyday fluency.',
    route: '/practice/free-conversation',
  },
  {
    id: 'interview',
    title: 'Interview Practice',
    description: 'Answer common interview questions with structured responses.',
    route: '/practice/interview',
  },
  {
    id: 'speaking',
    title: 'Speaking Practice',
    description: 'Deliver short prepared or impromptu speaking prompts.',
    route: '/practice/speaking',
  },
]
