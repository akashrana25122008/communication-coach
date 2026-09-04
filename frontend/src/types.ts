export type Trend = 'up' | 'down' | 'flat'

export type Status = 'completed' | 'in-progress' | 'pending'

export interface ScoreMetric {
  id: string
  label: string
  score: number
  delta: number
  trend: Trend
  description: string
}

export interface ProgressPoint {
  session: number
  label: string
  clarity: number
  fluency: number
  structure: number
  conciseness: number
}

export interface Session {
  id: string
  type: string
  date: string
  score: number
  durationMinutes: number
  status: Status
  title: string
}

export interface Exercise {
  id: string
  title: string
  description: string
  durationMinutes: number
}

export interface Recommendation {
  focusArea: string
  evidence: string
  exercise: Exercise
}

export interface Profile {
  name: string
  streak: number
  strengths: string[]
  focusAreas: string[]
}

export interface Statistics {
  sessionsCompleted: number
  practiceMinutes: number
  currentStreak: number
  averageScore: number
  weeklyDelta: number
}

export interface PracticeType {
  id: string
  title: string
  description: string
  route: string
}

export interface SessionDetail {
  totalTurns: number
  fillerWordCount: number
  longestPauseSeconds: number
  speakingPace: string
}

export type PracticeSessionType = 'free-conversation' | 'interview' | 'speaking'

export const PRACTICE_SESSION_TYPE_LABEL: Record<PracticeSessionType, string> = {
  'free-conversation': 'Free Conversation',
  interview: 'Interview Practice',
  speaking: 'Speaking Practice',
}

export interface SessionScore {
  clarity: number
  fluency: number
  structure: number
  conciseness: number
}

export interface PracticeSession {
  id: string
  type: PracticeSessionType
  startedAt: string
  completedAt: string
  durationMinutes: number
  overallScore: number
  scores: SessionScore
  summary: string
  recommendations: Recommendation[]
}

export interface ProgressSnapshot {
  sessionsCompleted: number
  practiceMinutes: number
  currentStreak: number
  averageScore: number
  weeklyDelta: number
  deltas: Record<keyof SessionScore, number>
  trends: Record<keyof SessionScore, Trend>
}

export interface CommunicationProfile {
  name: string
  streak: number
  strengths: string[]
  focusAreas: string[]
}
