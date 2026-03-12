import { AppShell } from '@/components/fieldiq/AppShell'

interface ContactPageProps {
  params: { id: string }
}

export default function ContactPage({ params }: ContactPageProps) {
  return (
    <AppShell activeItem="Contacts">
      <div className="fieldiq-card p-8 text-center">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Contact detail for <span style={{ color: 'var(--foreground)' }}>{params.id}</span> — coming in the next build
        </p>
      </div>
    </AppShell>
  )
}
