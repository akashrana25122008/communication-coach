import type {
  Exercise,
  PracticeType,
  Profile,
  ProgressPoint,
  Recommendation,
  ScoreMetric,
  Session,
  Statistics,
} from '../types'

/**
 * Centralized demo-data layer.
 *
 * All values in this module are DEMO / illustrative data used to render the
 * UI before the real Python/FastAPI backend exists. Nothing here is produced
 * by real analysis (see Milestone notes on "no fake functionality"): scores,
 * trends, and profiles are fabricated placeholders, not measurements of any
 * user's communication.
 *
 * UI components must consume this data via the service layer (services/api.ts),
 * never by importing this module directly and never hard-coding values inline.
 */

export const USER_NAME = 'Alex'

export const scoreMetrics: ScoreMetric[] = [
  {
    id: 'clarity',
    label: 'Clarity',
    score: 82,
    delta: 6,
    trend: 'up',
    description: 'How clearly your ideas come across',
  },
  {
    id: 'fluency',
    label: 'Fluency',
    score: 74,
    delta: 3,
    trend: 'up',
    description: 'Smoothness and flow of speech',
  },
  {
    id: 'structure',
    label: 'Structure',
    score: 68,
    delta: -2,
    trend: 'down',
    description: 'Organization of your responses',
  },
  {
    id: 'conciseness',
    label: 'Conciseness',
    score: 79,
    delta: 5,
    trend: 'up',
    description: 'Getting to the point efficiently',
  },
]

export const progressSeries: ProgressPoint[] = [
  { session: 1, label: 'S1', clarity: 62, fluency: 58, structure: 60, conciseness: 61 },
  { session: 2, label: 'S2', clarity: 66, fluency: 61, structure: 58, conciseness: 66 },
  { session: 3, label: 'S3', clarity: 70, fluency: 64, structure: 63, conciseness: 70 },
  { session: 4, label: 'S4', clarity: 74, fluency: 66, structure: 65, conciseness: 73 },
  { session: 5, label: 'S5', clarity: 78, fluency: 70, structure: 66, conciseness: 76 },
  { session: 6, label: 'S6', clarity: 82, fluency: 74, structure: 68, conciseness: 79 },
]

export const sessions: Session[] = [
  {
    id: 's-106',
    type: 'Free Conversation',
    date: 'Aug 30',
    score: 81,
    durationMinutes: 8,
    status: 'completed',
    title: 'Weekend plans',
  },
  {
    id: 's-105',
    type: 'Interview Practice',
    date: 'Aug 28',
    score: 76,
    durationMinutes: 12,
    status: 'completed',
    title: 'Behavioral question set',
  },
  {
    id: 's-104',
    type: 'Speaking Practice',
    date: 'Aug 26',
    score: 74,
    durationMinutes: 6,
    status: 'completed',
    title: 'Catch-up conversation',
  },
  {
    id: 's-103',
    type: 'Free Conversation',
    date: 'Aug 24',
    score: 69,
    durationMinutes: 7,
    status: 'completed',
    title: 'Hobbies and interests',
  },
  {
    id: 's-102',
    type: 'Speaking Practice',
    date: 'Aug 22',
    score: 72,
    durationMinutes: 9,
    status: 'in-progress',
    title: 'Presentation opener',
  },
]

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

export const recommendation: Recommendation = {
  focusArea: 'Reduce filler words',
  evidence: 'Your recent sessions show above-average use of "um" and "like", especially at the start of answers.',
  exercise: exercises[0],
}

export const profile: Profile = {
  name: USER_NAME,
  streak: 5,
  strengths: ['Clear vocabulary', 'Engaging tone', 'Strong pacing'],
  focusAreas: ['Filler words', 'Structured answers'],
}

export const statistics: Statistics = {
  sessionsCompleted: 14,
  practiceMinutes: 96,
  currentStreak: 5,
  averageScore: 77,
  weeklyDelta: 5,
}

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
