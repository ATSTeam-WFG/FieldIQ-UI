export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', color: 'var(--muted)' }}>
      {children}
    </span>
  )
}
