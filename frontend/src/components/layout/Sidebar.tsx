import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  Layers,
  Settings,
  X,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: Layers },
  { label: 'Practice', to: '/practice', icon: BookOpen },
  { label: 'Progress', to: '/progress', icon: BarChart3 },
  { label: 'Sessions', to: '/sessions', icon: CalendarDays },
  { label: 'Exercises', to: '/exercises', icon: Activity },
]

const bottomNav: NavItem[] = [
  { label: 'Settings', to: '/settings', icon: Settings },
]

function NavLinkItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium
         transition-colors duration-200 focus-visible:shadow-ring
         ${
           isActive
             ? 'bg-accent-soft text-text hover:bg-accent-soft'
             : 'text-text-muted hover:bg-surface-subtle hover:text-text'
         }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
              isActive ? 'text-accent' : 'text-text-faint group-hover:text-text-muted'
            }`}
            aria-hidden="true"
          />
          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden
          ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border
          bg-sidebar transition-transform duration-300 lg:static lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Primary navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-ink shadow-glow" aria-hidden="true">
              <span className="font-semibold">CC</span>
            </span>
            <span className="text-sm font-semibold tracking-tight text-text">
              Communication Coach AI
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {mainNav.map((item) => (
            <NavLinkItem key={item.to} item={item} onClose={onClose} />
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <div className="space-y-1">
            {bottomNav.map((item) => (
              <NavLinkItem key={item.to} item={item} onClose={onClose} />
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}