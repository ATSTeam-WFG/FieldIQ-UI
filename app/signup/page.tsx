'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Eye, EyeOff, Moon, Sun, UserPlus, Building2,
  ChevronRight, Plus, X, User, ShieldCheck, Check,
} from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { signup } from '@/lib/api/auth'
import { registerAgency, createInvites } from '@/lib/api/agencies'

// ── Constants ──────────────────────────────────────────────────────────────────

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
]

const REP_ROLES = [
  { value: 'rep',        label: 'Sales Rep' },
  { value: 'senior-rep', label: 'Senior Sales Rep' },
  { value: 'team-lead',  label: 'Team Lead' },
]

const REP_COUNTS = ['1–5', '6–15', '16–50', '50+']

// ── Helpers ────────────────────────────────────────────────────────────────────

function FieldLabel({ label, required, optional }: { label: string; required?: boolean; optional?: boolean }) {
  return (
    <div className="flex items-center" style={{ marginBottom: 6, gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>
        {label}
      </span>
      {required && <span style={{ color: '#c4a574', fontSize: 13, lineHeight: 1 }}>*</span>}
      {optional && (
        <span style={{ fontSize: 10, fontWeight: 500, color: 'var(--muted)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', letterSpacing: '0.04em' }}>
          Optional
        </span>
      )}
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center" style={{ gap: 12 }}>
      <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
      <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
      <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#f25022"/>
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7fba00"/>
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00a4ef"/>
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#ffb900"/>
    </svg>
  )
}

function ThemeToggle({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center rounded-full"
      style={{
        width: 72, height: 32,
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f3ef',
        padding: '0 6px',
        justifyContent: theme === 'dark' ? 'flex-end' : 'space-between',
        border: 'none', cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? (
        <span className="flex items-center gap-1.5">
          <Moon size={16} color="#c4a574" />
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#c4a574', display: 'inline-block', flexShrink: 0 }} />
        </span>
      ) : (
        <>
          <span className="flex shrink-0 items-center justify-center rounded-full" style={{ width: 24, height: 24, backgroundColor: '#0f0f0f' }}>
            <Sun size={14} color="#fafaf9" />
          </span>
          <Moon size={16} color="#c4a574" />
        </>
      )}
    </button>
  )
}

// ── Invite form row (added reps list) ─────────────────────────────────────────

interface InvitedRep {
  id: number
  name: string
  email: string
  role: string
}

function InvitedRepRow({ rep, onRemove }: { rep: InvitedRep; onRemove: () => void }) {
  return (
    <div
      className="flex items-center justify-between rounded-[8px]"
      style={{ padding: '10px 14px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center" style={{ gap: 10 }}>
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 28, height: 28, backgroundColor: '#c4a574', fontSize: 10, fontWeight: 700, color: '#000' }}
        >
          {rep.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--foreground)', margin: 0 }}>{rep.name}</p>
          <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>{rep.email}</p>
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ── Main content (uses useSearchParams) ───────────────────────────────────────

function SignupContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, toggleTheme } = useTheme()

  const isManager = searchParams.get('role') === 'manager'
  const signupStep = isManager ? 3 : 1 // total steps

  // Account form state
  const [accountStep, setAccountStep] = useState<1 | 2 | 3>(1) // 1=account, 2=agency, 3=invite
  const [fullName, setFullName]       = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [showPw, setShowPw]           = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [alsoRep, setAlsoRep]         = useState(false)

  // Agency form state
  const [agencyName, setAgencyName]   = useState('')
  const [agencyState, setAgencyState] = useState('')
  const [repCount, setRepCount]       = useState('')
  const [agencyUrl, setAgencyUrl]     = useState('')

  // Invite form state
  const [invitedReps, setInvitedReps] = useState<InvitedRep[]>([])
  const [inviteName, setInviteName]   = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePhone, setInvitePhone] = useState('')
  const [inviteRole, setInviteRole]   = useState('rep')
  const [inviteNote, setInviteNote]   = useState('')
  const [nextId, setNextId]           = useState(1)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const inputStyle: React.CSSProperties = {
    height: 40,
    backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)',
    border: '1px solid var(--border)',
    padding: '0 12px',
    fontSize: 14,
    color: 'var(--foreground)',
    borderRadius: 8,
    outline: 'none',
    width: '100%',
  }

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)',
  }

  const goldBtn: React.CSSProperties = {
    height: 42, width: '100%', borderRadius: 8, fontSize: 14, fontWeight: 600,
    backgroundColor: theme === 'dark' ? '#c4a574' : '#000000',
    color: theme === 'dark' ? '#000000' : '#fafaf9',
    border: 'none', cursor: 'pointer',
  }

  const activeTileBg = theme === 'dark' ? '#1f1a12' : '#fdf8f0'

  const canCreateAccount = fullName.trim() && email.trim() && password.length >= 8 && password === confirmPw
  const canRegisterAgency = agencyName.trim() && agencyState

  const REP_COUNT_MAP: Record<string, string> = {
    '1–5': '1-5', '6–15': '6-15', '16–50': '16-50', '50+': '50+',
  }
  const REP_TIER_MAP: Record<string, string> = {
    'rep': 'sales_rep', 'senior-rep': 'senior_sales_rep', 'team-lead': 'team_lead',
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!canCreateAccount) return
    setError(null)
    setLoading(true)
    try {
      await signup({
        email,
        password,
        name: fullName,
        account_type: isManager ? 'manager' : 'individual',
        also_rep: isManager ? alsoRep : undefined,
      })
      if (isManager) {
        setAccountStep(2)
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message ?? 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleRegisterAgency(e: React.FormEvent) {
    e.preventDefault()
    if (!canRegisterAgency) return
    setError(null)
    setLoading(true)
    try {
      await registerAgency({
        name: agencyName,
        state: agencyState || null,
        rep_count_range: repCount ? (REP_COUNT_MAP[repCount] ?? repCount) : null,
        website: agencyUrl || null,
      })
      setAccountStep(3)
    } catch (err: any) {
      setError(err.message ?? 'Agency registration failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleLaunchDashboard() {
    setError(null)
    setLoading(true)
    try {
      if (invitedReps.length > 0) {
        await createInvites(invitedReps.map(r => ({
          email: r.email,
          full_name: r.name,
          rep_tier: REP_TIER_MAP[r.role] ?? 'sales_rep',
        })))
      }
      window.location.href = '/manager'
    } catch (err: any) {
      setError(err.message ?? 'Failed to send invites')
    } finally {
      setLoading(false)
    }
  }

  function handleAddInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) return
    setInvitedReps(prev => [...prev, { id: nextId, name: inviteName, email: inviteEmail, role: inviteRole }])
    setNextId(n => n + 1)
    setInviteName(''); setInviteEmail(''); setInvitePhone(''); setInviteRole('rep'); setInviteNote('')
  }

  function removeInvite(id: number) {
    setInvitedReps(prev => prev.filter(r => r.id !== id))
  }

  const canAddInvite = inviteName.trim() && inviteEmail.trim()

  // Step dot labels
  const stepLabels = isManager ? ['Account', 'Agency', 'Invite Reps'] : []

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Theme toggle */}
      <div className="absolute right-6 top-6">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      {/* Card */}
      <div className="fieldiq-card w-full max-w-[440px] p-8">

        {/* Logo */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <span className="font-semibold leading-none" style={{ fontSize: 22, color: 'var(--foreground)' }}>
            FieldIQ
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
            Field Sales Intelligence for Title Professionals
          </span>
        </div>

        <div style={{ height: 28 }} />

        {/* Manager progress steps */}
        {isManager && (
          <>
            <div className="flex items-center" style={{ gap: 0 }}>
              {stepLabels.map((label, i) => {
                const stepNum = i + 1
                const done = accountStep > stepNum
                const active = accountStep === stepNum
                return (
                  <div key={label} className="flex items-center" style={{ flex: i < stepLabels.length - 1 ? '1' : 'none' }}>
                    <div className="flex flex-col items-center" style={{ gap: 4 }}>
                      <div
                        className="flex items-center justify-center rounded-full"
                        style={{
                          width: 24, height: 24,
                          backgroundColor: done ? '#c4a574' : active ? (theme === 'dark' ? '#1f1a12' : '#fdf8f0') : 'var(--surface)',
                          border: done ? 'none' : active ? '2px solid #c4a574' : '1px solid var(--border)',
                          fontSize: 11, fontWeight: 700,
                          color: done ? '#000' : active ? '#c4a574' : 'var(--muted)',
                        }}
                      >
                        {done ? <Check size={12} strokeWidth={3} color="#000" /> : stepNum}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? 'var(--foreground)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                        {label}
                      </span>
                    </div>
                    {i < stepLabels.length - 1 && (
                      <div style={{ flex: 1, height: 1, backgroundColor: accountStep > stepNum ? '#c4a574' : 'var(--border)', marginBottom: 18, marginLeft: 4, marginRight: 4 }} />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ height: 24 }} />
          </>
        )}

        {/* ── Account step ── */}
        {accountStep === 1 && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                {isManager ? 'Create Your Manager Account' : 'Create Your Account'}
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                {isManager ? 'Set up your account to get started.' : 'Join FieldIQ and start tracking your sales.'}
              </p>
            </div>

            <form onSubmit={handleCreateAccount} className="flex flex-col">

              {/* Full Name */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <label htmlFor="fullName" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>Full name</label>
                <input
                  id="fullName" type="text" value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <label htmlFor="email" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>Email address</label>
                <input
                  id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@agency.com"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={inputStyle}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <label htmlFor="password" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>Password</label>
                <div
                  className="flex items-center rounded-[8px]"
                  style={{ height: 40, backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)', border: '1px solid var(--border)', padding: '0 12px' }}
                >
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: 14, color: 'var(--foreground)' }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="ml-2 flex shrink-0 items-center" aria-label={showPw ? 'Hide' : 'Show'}>
                    {showPw ? <EyeOff size={16} color="var(--muted)" /> : <Eye size={16} color="var(--muted)" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: isManager ? 16 : 24 }}>
                <label htmlFor="confirmPw" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>Confirm password</label>
                <div
                  className="flex items-center rounded-[8px]"
                  style={{ height: 40, backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)', border: confirmPw && confirmPw !== password ? '1px solid #d97706' : '1px solid var(--border)', padding: '0 12px' }}
                >
                  <input
                    id="confirmPw"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={e => setConfirmPw(e.target.value)}
                    placeholder="Re-enter your password"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: 14, color: 'var(--foreground)' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)} className="ml-2 flex shrink-0 items-center" aria-label={showConfirmPw ? 'Hide' : 'Show'}>
                    {showConfirmPw ? <EyeOff size={16} color="var(--muted)" /> : <Eye size={16} color="var(--muted)" />}
                  </button>
                </div>
                {confirmPw && confirmPw !== password && (
                  <span style={{ fontSize: 12, color: '#d97706' }}>Passwords don&apos;t match</span>
                )}
              </div>

              {/* Manager: also act as rep option */}
              {isManager && (
                <div style={{ marginBottom: 24 }}>
                  <button
                    type="button"
                    onClick={() => setAlsoRep(v => !v)}
                    className="flex items-center w-full rounded-[8px] text-left"
                    style={{
                      padding: '12px 14px', gap: 12,
                      backgroundColor: alsoRep ? activeTileBg : 'var(--surface)',
                      border: alsoRep ? '2px solid #c4a574' : '1px solid var(--border)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      className="flex shrink-0 items-center justify-center rounded-[4px]"
                      style={{
                        width: 18, height: 18,
                        backgroundColor: alsoRep ? '#c4a574' : 'transparent',
                        border: alsoRep ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      {alsoRep && <Check size={11} strokeWidth={3} color="#000" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', margin: 0, marginBottom: 2 }}>
                        I also act as a sales rep on my own team
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0 }}>
                        You&apos;ll have access to both manager and rep views.
                      </p>
                    </div>
                  </button>
                </div>
              )}

              {/* Submit */}
              {error && (
                <p style={{ fontSize: 13, color: '#d97706', marginBottom: 12 }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={!canCreateAccount || loading}
                className="hover:opacity-90 active:opacity-80"
                style={canCreateAccount ? { ...goldBtn, opacity: loading ? 0.6 : 1 } : { ...goldBtn, backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'not-allowed' }}
              >
                {loading ? 'Creating account…' : isManager ? 'Continue' : 'Create Account'}
              </button>

              <div style={{ height: 20 }} />
              <Divider />
              <div style={{ height: 20 }} />

              {/* Google SSO */}
              <Link
                href="/coming-soon"
                className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-80"
                style={{ height: 42, gap: 8, border: '1px solid var(--border)', fontSize: 14, color: 'var(--body)', backgroundColor: 'transparent', marginBottom: 10 }}
              >
                <GoogleIcon />
                Continue with Google
              </Link>

              {/* Microsoft SSO */}
              <Link
                href="/coming-soon"
                className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-80"
                style={{ height: 42, gap: 8, border: '1px solid var(--border)', fontSize: 14, color: 'var(--body)', backgroundColor: 'transparent' }}
              >
                <MicrosoftIcon />
                Continue with Microsoft
              </Link>

              <div style={{ height: 24 }} />

              <p className="text-center" style={{ fontSize: 12, color: 'var(--muted)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--gold)' }} className="hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}

        {/* ── Agency registration step ── */}
        {accountStep === 2 && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                Register Your Agency
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                Tell us about your agency so we can set up your workspace.
              </p>
            </div>

            <form onSubmit={handleRegisterAgency} className="flex flex-col">

              {/* Agency name */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <FieldLabel label="Agency Name" required />
                <input
                  type="text" value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  placeholder="e.g. Premier Title Agency"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={inputStyle}
                />
              </div>

              {/* State */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <FieldLabel label="State of Operation" required />
                <select
                  value={agencyState}
                  onChange={e => setAgencyState(e.target.value)}
                  style={selectStyle}
                >
                  <option value="">Select a state…</option>
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Rep count */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <FieldLabel label="Number of Sales Reps" optional />
                <div className="grid grid-cols-4" style={{ gap: 8 }}>
                  {REP_COUNTS.map(count => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setRepCount(count)}
                      className="rounded-[8px] transition-colors"
                      style={{
                        height: 36, fontSize: 13, fontWeight: repCount === count ? 600 : 400,
                        border: repCount === count ? '2px solid #c4a574' : '1px solid var(--border)',
                        backgroundColor: repCount === count ? activeTileBg : 'var(--surface)',
                        color: repCount === count ? '#c4a574' : 'var(--muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 24 }}>
                <FieldLabel label="Agency Website" optional />
                <input
                  type="url" value={agencyUrl}
                  onChange={e => setAgencyUrl(e.target.value)}
                  placeholder="https://yoursite.com"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={inputStyle}
                />
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#d97706', marginBottom: 12 }}>{error}</p>
              )}
              <button
                type="submit"
                disabled={!canRegisterAgency || loading}
                className="hover:opacity-90 active:opacity-80"
                style={canRegisterAgency ? { ...goldBtn, opacity: loading ? 0.6 : 1 } : { ...goldBtn, backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'not-allowed' }}
              >
                {loading ? 'Registering…' : 'Register Agency'}
              </button>

              <div style={{ height: 12 }} />

              <button
                type="button"
                onClick={() => { window.location.href = '/manager' }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', textAlign: 'center' as const }}
                className="hover:underline"
              >
                Skip for now
              </button>
            </form>
          </>
        )}

        {/* ── Invite reps step ── */}
        {accountStep === 3 && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                Invite Your Reps
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                Add your team members to get started. You can always do this later.
              </p>
            </div>

            {/* Invited reps list */}
            {invitedReps.length > 0 && (
              <div className="flex flex-col" style={{ gap: 8, marginBottom: 16 }}>
                {invitedReps.map(rep => (
                  <InvitedRepRow key={rep.id} rep={rep} onRemove={() => removeInvite(rep.id)} />
                ))}
              </div>
            )}

            {/* Invite form */}
            <div
              className="rounded-[10px]"
              style={{ padding: 16, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', marginBottom: 20 }}
            >
              {/* Identity section */}
              <div className="flex items-center" style={{ gap: 6, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <User size={13} style={{ color: '#c4a574' }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>Rep Identity</span>
              </div>

              <div style={{ marginBottom: 12 }}>
                <FieldLabel label="Full Name" required />
                <input
                  type="text" value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder="e.g. Jordan Mitchell"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={{ ...inputStyle, backgroundColor: theme === 'dark' ? 'var(--card)' : 'var(--background)' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <FieldLabel label="Email" required />
                <input
                  type="email" value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="rep@premiertitle.com"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={{ ...inputStyle, backgroundColor: theme === 'dark' ? 'var(--card)' : 'var(--background)' }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <FieldLabel label="Phone" optional />
                <input
                  type="tel" value={invitePhone}
                  onChange={e => setInvitePhone(e.target.value)}
                  placeholder="(404) 555-0100"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={{ ...inputStyle, backgroundColor: theme === 'dark' ? 'var(--card)' : 'var(--background)' }}
                />
              </div>

              {/* Assignment section */}
              <div className="flex items-center" style={{ gap: 6, marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <ShieldCheck size={13} style={{ color: '#c4a574' }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>Assignment</span>
              </div>

              <div style={{ marginBottom: 16 }}>
                <FieldLabel label="Role" required />
                <div className="grid grid-cols-3" style={{ gap: 8 }}>
                  {REP_ROLES.map(({ value, label }) => {
                    const active = inviteRole === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setInviteRole(value)}
                        className="flex items-center justify-center rounded-[8px]"
                        style={{
                          height: 38, fontSize: 12, fontWeight: active ? 600 : 400,
                          border: active ? '2px solid #c4a574' : '1px solid var(--border)',
                          backgroundColor: active ? activeTileBg : (theme === 'dark' ? 'var(--card)' : 'var(--background)'),
                          color: active ? '#c4a574' : 'var(--muted)',
                          cursor: 'pointer', textAlign: 'center' as const,
                          padding: '0 6px',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Welcome note */}
              <div>
                <FieldLabel label="Welcome Note" optional />
                <div className="relative">
                  <textarea
                    value={inviteNote}
                    onChange={e => setInviteNote(e.target.value.slice(0, 400))}
                    placeholder="Add a personal welcome message…"
                    style={{
                      width: '100%', height: 80, padding: '10px 12px', borderRadius: 8,
                      border: '1px solid var(--border)',
                      backgroundColor: theme === 'dark' ? 'var(--card)' : 'var(--background)',
                      color: 'var(--foreground)', fontSize: 14, outline: 'none',
                      resize: 'none', fontFamily: 'inherit',
                    }}
                  />
                  <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: 'var(--muted)' }}>
                    {inviteNote.length}/400
                  </span>
                </div>
              </div>

              <div style={{ height: 16 }} />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddInvite}
                  disabled={!canAddInvite}
                  className="flex items-center rounded-[8px] transition-opacity hover:opacity-90"
                  style={{
                    height: 36, padding: '0 14px', gap: 6, fontSize: 13, fontWeight: 600,
                    backgroundColor: canAddInvite ? (theme === 'dark' ? '#c4a574' : '#000') : 'var(--surface)',
                    color: canAddInvite ? (theme === 'dark' ? '#000' : '#fff') : 'var(--muted)',
                    border: canAddInvite ? 'none' : '1px solid var(--border)',
                    cursor: canAddInvite ? 'pointer' : 'not-allowed',
                  }}
                >
                  <UserPlus size={13} />
                  Send Invite
                </button>

                {invitedReps.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { setInviteName(''); setInviteEmail(''); setInvitePhone(''); setInviteRole('rep'); setInviteNote('') }}
                    className="flex items-center"
                    style={{ fontSize: 12, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', gap: 4 }}
                  >
                    <Plus size={12} />
                    Add another rep
                  </button>
                )}
              </div>
            </div>

            {/* Go to dashboard */}
            {error && (
              <p style={{ fontSize: 13, color: '#d97706', marginBottom: 12 }}>{error}</p>
            )}
            <button
              onClick={handleLaunchDashboard}
              disabled={loading}
              className="w-full rounded-[8px] font-semibold hover:opacity-90 active:opacity-80"
              style={{ ...goldBtn, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Launching…' : invitedReps.length > 0 ? `Launch FieldIQ (${invitedReps.length} invited)` : 'Launch FieldIQ'}
            </button>

            <div style={{ height: 12 }} />

            <button
              type="button"
              onClick={() => { window.location.href = '/manager' }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', textAlign: 'center' as const, width: '100%' }}
              className="hover:underline"
            >
              Skip & go to dashboard
            </button>
          </>
        )}
      </div>

      {/* Page footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          © 2026 FieldIQ · Privacy · Terms
        </span>
      </div>
    </div>
  )
}

// ── Page export with Suspense (required for useSearchParams) ──────────────────

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  )
}
