import { PageHeader } from '../components/ui/PageHeader'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/states'

export function SettingsPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your preferences and account details."
      />
      <Card className="p-5">
        <EmptyState
          title="Settings are coming soon"
          description="Account, notification, and privacy settings will be available in a later milestone."
        />
      </Card>
    </div>
  )
}
