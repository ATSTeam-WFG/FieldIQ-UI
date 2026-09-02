'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Eye, EyeOff, Moon, Sun, AlertCircle, Clock, CheckCircle2, Lock } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { BRAND } from '@/lib/brand'
import { getInvite, acceptInvite, type InviteData } from '@/lib/api/agencies'
import { setToken } from '@/lib/api/client'
import { ApiError } from '@/lib/api/client'

// ── Theme Toggle ──────────────────────────────────────────────────────────────

function ThemeToggle({ theme, toggleTheme }: { theme: string; toggleTheme: () => void }) {
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="flex items-center rounded-full"
      style={{
        width: 72,
        height: 32,
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f3ef',
        padding: '0 6px',
        justifyContent: theme === 'dark' ? 'flex-end' : 'space-between',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      {theme === 'dark' ? (
        <span className="flex items-center gap-1.5">
          <Moon size={16} color="#c4a574" />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#c4a574',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
        </span>
      ) : (
        <>
          <span
            className="flex shrink-0 items-center justify-center rounded-full"
            style={{ width: 24, height: 24, backgroundColor: '#0f0f0f' }}
          >
            <Sun size={14} color="#fafaf9" />
          </span>
          <Moon size={16} color="#c4a574" />
        </>
      )}
    </button>
  )
}

// ── Status panels ─────────────────────────────────────────────────────────────

function StatusPanel({
  icon: Icon,
  iconColor,
  heading,
  body,
  cta,
  ctaHref,
}: {
  icon: React.ElementType
  iconColor: string
  heading: string
  body: string
  cta: string
  ctaHref: string
}) {
  return (
    <div className="flex flex-col items-center text-center" style={{ gap: 16, padding: '8px 0' }}>
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 52, height: 52, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div className="flex flex-col" style={{ gap: 6 }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>{heading}</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>{body}</p>
      </div>
      <Link
        href={ctaHref}
        className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-80"
        style={{
          height: 42,
          width: '100%',
          fontSize: 14,
          fontWeight: 600,
          border: '1px solid var(--border)',
          color: 'var(--body)',
          backgroundColor: 'transparent',
          textDecoration: 'none',
        }}
      >
        {cta}
      </Link>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function InvitePage() {
  const params = useParams()
  const inviteId = params.inviteId as string
  const { theme, toggleTheme } = useTheme()

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'expired' | 'used' | 'invalid'>('loading')
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!inviteId) return
    getInvite(inviteId)
      .then((data) => {
        setInvite(data)
        setName(data.full_name)
        setLoadState('ready')
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setLoadState('invalid')
          } else if (err.status === 410) {
            const detail = err.message.toLowerCase()
            if (detail.includes('already') || detail.includes('accepted') || detail.includes('declined')) {
              setLoadState('used')
            } else {
              setLoadState('expired')
            }
          } else {
            setLoadState('invalid')
          }
        } else {
          setLoadState('invalid')
        }
      })
  }, [inviteId])

  const canSubmit = name.trim().length > 0 && password.length >= 8 && password === confirmPw

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      const res = await acceptInvite(inviteId, { password, name: name.trim() })
      setToken(res.access_token, res.refresh_token)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message ?? 'Failed to accept invite')
    } finally {
      setLoading(false)
    }
  }

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

  const goldBtn: React.CSSProperties = {
    height: 42,
    width: '100%',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    backgroundColor: theme === 'dark' ? '#c4a574' : '#000000',
    color: theme === 'dark' ? '#000000' : '#fafaf9',
    border: 'none',
    cursor: 'pointer',
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Theme toggle */}
      <div className="absolute right-6 top-6">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className="app-card w-full max-w-[440px] p-8">

        {/* Logo */}
        <div className="flex flex-col" style={{ gap: 6, marginBottom: 28 }}>
          <Image
            src={theme === 'dark'
              ? '/images/logo/lockup_dark.svg'
              : '/images/logo/lockup_light.svg'}
            alt={BRAND.name}
            width={178}
            height={64}
            priority
            unoptimized
            style={{ width: 178, height: 'auto' }}
          />
          <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
            {BRAND.category}
          </span>
        </div>

        {/* ── Loading ── */}
        {loadState === 'loading' && (
          <div className="flex items-center justify-center" style={{ padding: '40px 0' }}>
            <div
              className="rounded-full animate-spin"
              style={{
                width: 28,
                height: 28,
                border: '3px solid var(--border)',
                borderTopColor: '#c4a574',
              }}
            />
          </div>
        )}

        {/* ── Invalid ── */}
        {loadState === 'invalid' && (
          <StatusPanel
            icon={AlertCircle}
            iconColor="#d97706"
            heading="Invite not found"
            body="This link is invalid or has already been used. Ask your manager to send a new invite."
            cta="Go to sign in"
            ctaHref="/login"
          />
        )}

        {/* ── Expired ── */}
        {loadState === 'expired' && (
          <StatusPanel
            icon={Clock}
            iconColor="#d97706"
            heading="Invite expired"
            body="This invite link has expired. Ask your manager to send a new one."
            cta="Go to sign in"
            ctaHref="/login"
          />
        )}

        {/* ── Already used ── */}
        {loadState === 'used' && (
          <StatusPanel
            icon={CheckCircle2}
            iconColor="#16a34a"
            heading="Already accepted"
            body="This invite has already been accepted. Sign in to access your account."
            cta="Sign in"
            ctaHref="/login"
          />
        )}

        {/* ── Ready: signup form ── */}
        {loadState === 'ready' && invite && (
          <>
            {/* Heading */}
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                You&apos;ve been invited
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                Join <span style={{ color: 'var(--foreground)', fontWeight: 500 }}>{invite.agency_name || 'your agency'}</span> on {BRAND.name}
              </p>
            </div>

            {/* Welcome note */}
            {invite.welcome_note && (
              <div
                className="rounded-[8px]"
                style={{
                  padding: '12px 14px',
                  backgroundColor: theme === 'dark' ? '#1f1a12' : '#fdf8f0',
                  border: '1px solid #c4a574',
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, marginBottom: 4, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Message from your manager
                </p>
                <p style={{ fontSize: 13, color: 'var(--foreground)', margin: 0, lineHeight: 1.5 }}>
                  &ldquo;{invite.welcome_note}&rdquo;
                </p>
              </div>
            )}

            <form onSubmit={handleAccept} className="flex flex-col">

              {/* Name */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <label htmlFor="name" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>
                  Your name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="focus:ring-1 focus:ring-[#c4a574]"
                  style={inputStyle}
                />
              </div>

              {/* Email (read-only) */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>
                    Email address
                  </label>
                  <span className="flex items-center" style={{ gap: 3, fontSize: 11, color: 'var(--muted)' }}>
                    <Lock size={10} />
                    From your invite
                  </span>
                </div>
                <input
                  type="email"
                  value={invite.email}
                  readOnly
                  style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <label htmlFor="password" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>
                  Password
                </label>
                <div
                  className="flex items-center rounded-[8px]"
                  style={{
                    height: 40,
                    backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)',
                    border: '1px solid var(--border)',
                    padding: '0 12px',
                  }}
                >
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: 14, color: 'var(--foreground)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="ml-2 flex shrink-0 items-center"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={16} color="var(--muted)" /> : <Eye size={16} color="var(--muted)" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 24 }}>
                <label htmlFor="confirmPw" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>
                  Confirm password
                </label>
                <div
                  className="flex items-center rounded-[8px]"
                  style={{
                    height: 40,
                    backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)',
                    border: confirmPw && confirmPw !== password ? '1px solid #d97706' : '1px solid var(--border)',
                    padding: '0 12px',
                  }}
                >
                  <input
                    id="confirmPw"
                    type={showConfirmPw ? 'text' : 'password'}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="Re-enter your password"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: 14, color: 'var(--foreground)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((p) => !p)}
                    className="ml-2 flex shrink-0 items-center"
                    aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPw ? <EyeOff size={16} color="var(--muted)" /> : <Eye size={16} color="var(--muted)" />}
                  </button>
                </div>
                {confirmPw && confirmPw !== password && (
                  <span style={{ fontSize: 12, color: '#d97706' }}>Passwords don&apos;t match</span>
                )}
              </div>

              {error && (
                <p style={{ fontSize: 13, color: '#d97706', marginBottom: 12 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="hover:opacity-90 active:opacity-80"
                style={
                  canSubmit
                    ? { ...goldBtn, opacity: loading ? 0.6 : 1 }
                    : { ...goldBtn, backgroundColor: 'var(--surface)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'not-allowed' }
                }
              >
                {loading ? 'Creating account…' : 'Create Account & Join'}
              </button>

              <div style={{ height: 20 }} />

              <p className="text-center" style={{ fontSize: 12, color: 'var(--muted)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ color: 'var(--gold)' }} className="hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>

      {/* Page footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {BRAND.legal}
        </span>
      </div>
    </div>
  )
}
