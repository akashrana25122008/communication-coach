import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock3,
  Flame,
  MessagesSquare,
  Mic,
  Target,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Magnetic } from '../components/effects/Magnetic'
import { PracticeCard } from '../components/PracticeCard'
import { ProfileCard } from '../components/ProfileCard'
import { ProgressChart } from '../components/ProgressChart'
import { RecommendationCard } from '../components/RecommendationCard'
import { ScoreCard } from '../components/ScoreCard'
import { SessionCard } from '../components/SessionCard'
import { StatCard } from '../components/StatCard'
import { Button } from '../components/ui/Button'
import { SectionHeading } from '../components/ui/SectionHeading'
import { EmptyState, LoadingState } from '../components/ui/states'
import { api } from '../services/api'
import { practiceTypes } from '../data/demoData'
import { useDemoResource } from '../hooks/useDemoResource'
import { DashboardAICoach } from '../components/DashboardAICoach'

const metricIcons = {
  clarity: Target,
  fluency: Mic,
  structure: MessagesSquare,
  conciseness: Clock3,
}

const sessionTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Free Conversation': MessagesSquare,
  'Interview Practice': BookOpen,
  'Speaking Practice': Mic,
}

export function DashboardPage() {
  const metrics = useDemoResource(api.getScoreMetrics)
  const progress = useDemoResource(api.getProgress)
  const sessions = useDemoResource(api.getSessions)
  const recommendation = useDemoResource(api.getRecommendation)
  const profile = useDemoResource(api.getProfile)
  const stats = useDemoResource(api.getStatistics)

  if (metrics.loading || progress.loading || sessions.loading) {
    return <LoadingState message="Loading your dashboard…" />
  }

  const hasSessions = (sessions.data?.length ?? 0) > 0

  if (!hasSessions && profile.data && (profile.data.strengths.length === 0 || profile.data.focusAreas.length === 0)) {
    return (
      <div className="stagger flex max-w-6xl flex-col gap-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <p className="text-sm text-text-muted">Good evening, {profile.data?.name ?? 'there'}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              Welcome to your communication coach.
            </h1>
            <p className="text-sm text-text-muted">
              Complete a practice session to start building your communication profile.
            </p>
          </div>
          <Magnetic className="shrink-0">
            <Link to="/practice" className="block">
              <Button size="lg">
                Start Practice
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
          </Magnetic>
        </section>

        <EmptyState
          title="No sessions yet"
          description="Complete your first practice session to start building your communication profile."
          action={
            <Link to="/practice" className="text-sm font-medium text-accent hover:text-accent-strong">
              Start practicing →
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="stagger flex max-w-6xl flex-col gap-8">
      {/* Hero / welcome */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-text-muted">Good evening, {profile.data?.name ?? 'there'}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
            Keep your skills sharp today.
          </h1>
          <p className="text-sm text-text-muted">
            Your communication score is up{' '}
            <span className="font-semibold text-success">
              +{stats.data?.weeklyDelta ?? 0}
            </span>{' '}
            this week.
          </p>
        </div>
        <Magnetic className="shrink-0">
          <Link to="/practice" className="block">
            <Button size="lg">
              Start Practice
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </Magnetic>
      </section>

      {/* Quick statistics */}
      {stats.data && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key statistics">
          <StatCard icon={CalendarDays} label="Sessions completed" value={String(stats.data.sessionsCompleted)} />
          <StatCard icon={Clock3} label="Practice time" value={`${stats.data.practiceMinutes} min`} />
          <StatCard icon={Flame} label="Current streak" value={`${stats.data.currentStreak} days`} />
          <StatCard icon={Target} label="Average score" value={String(stats.data.averageScore)} />
        </section>
      )}

      {/* Communication scores + AI coach */}
      <section aria-label="Communication scores">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <SectionHeading title="Communication scores" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.data?.map((m) => {
                const Icon = metricIcons[m.id as keyof typeof metricIcons] ?? Target
                return (
                  <ScoreCard
                    key={m.id}
                    title={m.label}
                    score={m.score}
                    delta={m.delta}
                    trend={m.trend}
                    status={m.description}
                    icon={Icon}
                  />
                )
              })}
            </div>
          </div>
          <div className="lg:col-span-1">
            <DashboardAICoach />
          </div>
        </div>
      </section>

      {/* Practice & Focus */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-label="Practice and focus">
        <div className="lg:col-span-2">
          <SectionHeading title="Practice" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {practiceTypes.map((p, i) => {
              const icon = [MessagesSquare, BookOpen, Mic][i]
              return (
                <PracticeCard
                  key={p.id}
                  title={p.title}
                  description={p.description}
                  route={p.route}
                  icon={icon}
                />
              )
            })}
          </div>
        </div>

        {recommendation.data && (
          <div>
            <SectionHeading title="Focus of the day" />
            <RecommendationCard
              focusArea={recommendation.data.focusArea}
              evidence={recommendation.data.evidence}
              exerciseTitle={recommendation.data.exercise.title}
              exerciseDuration={recommendation.data.exercise.durationMinutes}
              exerciseRoute="/practice/free-conversation"
            />
          </div>
        )}
      </section>

      {/* Progress chart */}
      <section aria-label="Progress over time">
        <SectionHeading
          title="Progress over time"
          action={
            <Link to="/progress" className="text-sm font-medium text-accent transition-colors hover:text-accent-strong">
              View all →
            </Link>
          }
        />
        <div className="rounded-lg border border-border bg-surface p-5 shadow-card">
          {progress.data ? (
            <ProgressChart data={progress.data} />
          ) : (
            <LoadingState message="Loading your progress…" />
          )}
        </div>
      </section>

      {/* Recent sessions & Profile */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-label="Recent sessions and profile">
        <div className="lg:col-span-2">
          <SectionHeading
            title="Recent sessions"
            action={
              <Link to="/sessions" className="text-sm font-medium text-accent transition-colors hover:text-accent-strong">
                View all →
              </Link>
            }
          />
          <div className="flex flex-col gap-3">
            {sessions.data?.slice(0, 3).map((s) => (
              <SessionCard key={s.id} session={s} icon={sessionTypeIcons[s.type] ?? MessagesSquare} />
            ))}
          </div>
        </div>

        {profile.data && (
          <div>
            <SectionHeading title="Profile" />
            <ProfileCard
              name={profile.data.name}
              streak={profile.data.streak}
              strengths={profile.data.strengths}
              focusAreas={profile.data.focusAreas}
            />
          </div>
        )}
      </section>
    </div>
  )
}