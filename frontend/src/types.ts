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
