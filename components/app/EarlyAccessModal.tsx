'use client'
import { useEffect, useRef, useState } from 'react'
import { BRAND } from '@/lib/brand'

interface EarlyAccessModalProps {
  open: boolean
  onClose: () => void
}

const ROLES = ['Title Agent', 'Sales Manager', 'Executive / Owner', 'Other']
const TEAM_SIZES = ['1–5', '6–15', '16–50', '50+']

// Microsoft Forms collects the responses. We open the form pre-filled in a new
// tab on submit; the respondent confirms with the form's own Submit button.
const MS_FORM_BASE =
  'https://forms.office.com/Pages/ResponsePage.aspx?id=o6hYNyq_bUuqce_63KT3TUL0YzRx8mJDm6E4cwi125lUOVBFRjQzRlhKRUI2U1VaU1M5UEEyQTg4Mi4u'
const MS_FORM_FIELDS = {
  name: 'r630f0e32052f4010934c79f3614159fc',
  email: 'rf232b8ce74764f3aad554336b1f2f2c0',
  agency: 'r62f14d4740094d2f8d22c52fca2ac075',
  role: 'r51784fcf4b994020adcb5b9b9d49d9fc',
  teamSize: 'r2452a4acc0b847259d1d69207dab63c4',
}

function buildPrefilledUrl(form: { name: string; email: string; agency: string; role: string; teamSize: string }) {
  const parts: string[] = []
  const text = (id: string, value: string) => {
    if (value.trim()) parts.push(`${id}=${encodeURIComponent(value.trim())}`)
  }
  // Choice questions expect the option text wrapped in double quotes.
  const choice = (id: string, value: string) => {
    if (value) parts.push(`${id}=${encodeURIComponent(`"${value}"`)}`)
  }
  text(MS_FORM_FIELDS.name, form.name)
  text(MS_FORM_FIELDS.email, form.email)
  text(MS_FORM_FIELDS.agency, form.agency)
  choice(MS_FORM_FIELDS.role, form.role)
  // The form's team-size choices use plain hyphens (e.g. "6-15"), not en-dashes.
  choice(MS_FORM_FIELDS.teamSize, form.teamSize.replace(/–/g, '-'))
  return parts.length ? `${MS_FORM_BASE}&${parts.join('&')}` : MS_FORM_BASE
}

export function EarlyAccessModal({ open, onClose }: EarlyAccessModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', agency: '', role: '', teamSize: '' })
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      clearTimeout(t)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      // reset shortly after close so the success state doesn't flash on reopen
      const t = setTimeout(() => {
        setSubmitted(false)
        setForm({ name: '', email: '', agency: '', role: '', teamSize: '' })
      }, 250)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!open) return null

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    window.open(buildPrefilledUrl(form), '_blank', 'noopener,noreferrer')
    setSubmitted(true)
  }

  return (
    <div className="ea-overlay" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label="Request early access">
      <div className="ea-modal" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="ea-close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        {submitted ? (
          <div className="ea-success">
            <div className="ea-success-icon">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3>One last step{form.name ? `, ${form.name.split(' ')[0]}` : ''}.</h3>
            <p>
              We&apos;ve opened a short form in a new tab with your details filled in — just hit{' '}
              <strong>Submit</strong> there to join the beta waitlist. Didn&apos;t see it? Pop-up blockers can hide it.
            </p>
            <div className="ea-success-actions">
              <a
                href={buildPrefilledUrl(form)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary ea-success-btn"
              >
                Reopen form →
              </a>
              <button type="button" className="btn btn-secondary ea-success-btn" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="ea-header">
              <div className="ea-eyebrow">Early access</div>
              <h3>Put {BRAND.name} in the field.</h3>
              <p>Tell us a little about your agency and we&apos;ll add you to the beta waitlist.</p>
            </div>

            <form className="ea-form" onSubmit={handleSubmit}>
              <div className="ea-field">
                <label htmlFor="ea-name">Full name</label>
                <input ref={firstFieldRef} id="ea-name" type="text" required value={form.name} onChange={set('name')} placeholder="Jane Doe" autoComplete="name" />
              </div>

              <div className="ea-field">
                <label htmlFor="ea-email">Work email</label>
                <input id="ea-email" type="email" required value={form.email} onChange={set('email')} placeholder="jane@youragency.com" autoComplete="email" />
              </div>

              <div className="ea-field">
                <label htmlFor="ea-agency">Agency / company <span className="ea-opt">(optional)</span></label>
                <input id="ea-agency" type="text" value={form.agency} onChange={set('agency')} placeholder="Premier Title Agency" autoComplete="organization" />
              </div>

              <div className="ea-row">
                <div className="ea-field">
                  <label htmlFor="ea-role">Your role <span className="ea-opt">(optional)</span></label>
                  <select id="ea-role" value={form.role} onChange={set('role')}>
                    <option value="" disabled>Select a role</option>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="ea-field">
                  <label htmlFor="ea-team">Team size <span className="ea-opt">(optional)</span></label>
                  <select id="ea-team" value={form.teamSize} onChange={set('teamSize')}>
                    <option value="" disabled>Select size</option>
                    {TEAM_SIZES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary ea-submit">Request early access →</button>
              <p className="ea-fineprint">We&apos;ll only use this to reach out about {BRAND.name} early access.</p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
