import type {
  Exercise,
  Profile,
  ProgressPoint,
  Recommendation,
  ScoreMetric,
  Session,
  Statistics,
} from '../types'
import * as demo from '../data/demoData'

/**
 * Service layer for the frontend.
 *
 * These functions currently resolve with DEMO data (see data/demoData.ts).
 * Once the Python/FastAPI backend exists, swap the bodies of these functions
 * to call REST endpoints — the signatures and return types stay the same, so
 * UI components consume the data without changing.
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

function resolveDemo<T>(value: T): Promise<T> {
  return Promise.resolve(value)
}

export const api: Api = {
  getProfile: () => resolveDemo(demo.profile),
  getProgress: () => resolveDemo(demo.progressSeries),
  getSessions: () => resolveDemo(demo.sessions),
  getExercises: () => resolveDemo(demo.exercises),
  getScoreMetrics: () => resolveDemo(demo.scoreMetrics),
  getRecommendation: () => resolveDemo(demo.recommendation),
  getStatistics: () => resolveDemo(demo.statistics),
}
