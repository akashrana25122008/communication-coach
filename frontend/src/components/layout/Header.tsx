import { Bell, Menu, Settings } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  userName: string
}

export function Header({ onMenuClick, userName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-subtle hover:text-text lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-text">{userName}</p>
          <p className="text-xs text-text-muted">Let's keep your skills sharp.</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-subtle hover:text-text"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
        </button>
        <a
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-subtle hover:text-text sm:hidden"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" aria-hidden="true" />
        </a>
        <button
          type="button"
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent ring-1 ring-inset ring-border transition-transform hover:scale-[1.03]"
          aria-label="Open profile menu"
        >
          {userName.charAt(0).toUpperCase()}
        </button>
      </div>
    </header>
  )
}
