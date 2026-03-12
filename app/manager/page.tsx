import { AppShell } from '@/components/fieldiq/AppShell'

export default function ManagerPage() {
  return (
    <AppShell activeItem="My Team">
      <div className="fieldiq-card p-8 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Manager Dashboard — coming in the next build
        </p>
      </div>
    </AppShell>
  )
}
