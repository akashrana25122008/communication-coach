import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { CursorEffect } from '../effects/CursorEffect'
import { SplashCursor } from '../effects/SplashCursor'
import { PageTransition } from '../effects/PageTransition'
import { USER_NAME } from '../../data/demoData'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()
  const isDashboard = pathname === '/dashboard'

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {!isDashboard && <CursorEffect />}
      {isDashboard && <SplashCursor />}
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-60" aria-hidden="true" />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} userName={USER_NAME} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}