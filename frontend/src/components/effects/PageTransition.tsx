import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Wraps page content and re-mounts it on route change so the CSS
 * page-enter animation (fade + slight rise) plays on navigation.
 * Reduced motion is handled by the global media query in index.css.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  )
}