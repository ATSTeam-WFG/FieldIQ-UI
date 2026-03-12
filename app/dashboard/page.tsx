import { AppShell } from '@/components/fieldiq/AppShell'

export default function DashboardPage() {
  return (
    <AppShell activeItem="Dashboard">
      <div className="fieldiq-card p-8 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Agent Dashboard — coming in the next build
        </p>
      </div>
    </AppShell>
  )
}
