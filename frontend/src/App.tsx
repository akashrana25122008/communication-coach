import { Route, Routes, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { PracticePage } from './pages/PracticePage'
import { FreeConversationPage } from './pages/FreeConversationPage'
import { InterviewPracticePage } from './pages/InterviewPracticePage'
import { SpeakingPracticePage } from './pages/SpeakingPracticePage'
import { ProgressPage } from './pages/ProgressPage'
import { SessionsPage } from './pages/SessionsPage'
import { SessionDetailPage } from './pages/SessionDetailPage'
import { ExercisesPage } from './pages/ExercisesPage'
import { SettingsPage } from './pages/SettingsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/practice" element={<PracticePage />} />
        <Route path="/practice/free-conversation" element={<FreeConversationPage />} />
        <Route path="/practice/interview" element={<InterviewPracticePage />} />
        <Route path="/practice/speaking" element={<SpeakingPracticePage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/:id" element={<SessionDetailPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
