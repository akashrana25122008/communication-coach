import { Link } from 'react-router-dom'
import { EmptyState } from '../components/ui/states'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              Go to Dashboard
            </Button>
          </Link>
        }
      />
    </div>
  )
}
