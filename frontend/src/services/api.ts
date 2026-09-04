import type {
  Exercise,
  Profile,
  ProgressPoint,
  Recommendation,
  ScoreMetric,
  Session,
  SessionScore,
  Statistics,
} from '../types'
import type { PracticeSession, PracticeSessionType } from '../types'
import * as demo from '../data/demoData'
import { practiceService } from './practiceService'

/**
 * Service layer for the frontend.
 *
 * Live data (profile, progress, sessions, scores, statistics, recommendation)
 * is derived from practice sessions persisted by the user via practiceService.
 * Static catalogue data (exercises, practice types) still comes from
 * data/demoData.ts, which is explicitly NOT user activity.
 *
 * UI components consume data through this module — never by importing the
 * persistence layer or engines directly.
 */

export interface Api {
  getProfile(): Promise<Profile>
  getProgress(): Promise<ProgressPoint[]>
  getSessions(): Promise<Session[]>
  getExercises(): Promise<Exercise[]>
  getScoreMetrics(): Promise<ScoreMetric[]>
  getRecommendation(): Promise<Recommendation>
  getStatistics(): Promise<Statistics>
}

export interface PracticeApi {
  getSession(id: string): Promise<PracticeSession | undefined>
  createSession(input: {
    type: PracticeSessionType
    durationMinutes: number
    scores: SessionScore
    summary: string
  }): Promise<PracticeSession>
}

function resolve<T>(value: T): Promise<T> {
  return Promise.resolve(value)
}

export const api: Api = {
  getProfile: () => resolve(practiceService.getCommunicationProfile()),
  getProgress: () => resolve(practiceService.getProgress()),
  getSessions: () => resolve(practiceService.listSessions()),
  getExercises: () => resolve(demo.exercises),
  getScoreMetrics: () => resolve(practiceService.getScoreMetrics()),
  getRecommendation: () => resolve(practiceService.getRecommendation()),
  getStatistics: () => resolve(practiceService.getStatistics()),
}

export const practiceApi: PracticeApi = {
  getSession: (id) => resolve(practiceService.getSession(id)),
  createSession: (input) => resolve(practiceService.createSession(input)),
}
