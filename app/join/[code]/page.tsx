'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Moon, Sun, AlertCircle } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { getAgencyByCode, joinByCode } from '@/lib/api/agencies'
import { setToken, ApiError } from '@/lib/api/client'

// ── Theme Toggle ──────────────────────────────────────────────────────────────

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

// ── Main Component ─────────────────────────────────────────────────────────────

export default function JoinByCodePage() {
  const params = useParams()
  const code = (params.code as string).toUpperCase()
  const { theme, toggleTheme } = useTheme()

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'invalid'>('loading')
  const [agencyName, setAgencyName] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!code) return
    getAgencyByCode(code)
      .then((data) => {
        setAgencyName(data.name)
        setLoadState('ready')
      })
      .catch(() => setLoadState('invalid'))
  }, [code])

  const canSubmit = name.trim().length > 0 && email.trim().length > 0 && password.length >= 8 && password === confirmPw

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      const res = await joinByCode(code, { name: name.trim(), email: email.trim(), password })
      setToken(res.access_token, res.refresh_token)
      window.location.href = '/dashboard'
    } catch (err: any) {
      setError(err.message ?? 'Failed to join agency')
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
    height: 42, width: '100%', borderRadius: 8, fontSize: 14, fontWeight: 600,
    backgroundColor: theme === 'dark' ? '#c4a574' : '#000000',
    color: theme === 'dark' ? '#000000' : '#fafaf9',
    border: 'none', cursor: 'pointer',
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6 py-16"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="absolute right-6 top-6">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>

      <div className="fieldiq-card w-full max-w-[440px] p-8">

        {/* Logo */}
        <div className="flex flex-col" style={{ gap: 6, marginBottom: 28 }}>
          <span className="font-semibold leading-none" style={{ fontSize: 22, color: 'var(--foreground)' }}>
            FieldIQ
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
            Field Sales Intelligence for Title Professionals
          </span>
        </div>

        {/* ── Loading ── */}
        {loadState === 'loading' && (
          <div className="flex items-center justify-center" style={{ padding: '40px 0' }}>
            <div
              className="rounded-full animate-spin"
              style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: '#c4a574' }}
            />
          </div>
        )}

        {/* ── Invalid code ── */}
        {loadState === 'invalid' && (
          <div className="flex flex-col items-center text-center" style={{ gap: 16, padding: '8px 0' }}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 52, height: 52, backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <AlertCircle size={22} style={{ color: '#d97706' }} />
            </div>
            <div className="flex flex-col" style={{ gap: 6 }}>
              <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>Agency not found</p>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                The code <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--foreground)' }}>{code}</span> doesn&apos;t match any agency. Double-check the code with your manager.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-80 w-full"
              style={{ height: 42, fontSize: 14, fontWeight: 600, border: '1px solid var(--border)', color: 'var(--body)', backgroundColor: 'transparent', textDecoration: 'none' }}
            >
              Try a different code
            </Link>
          </div>
        )}

        {/* ── Ready: signup form ── */}
        {loadState === 'ready' && (
          <>
            {/* Agency banner */}
            <div
              className="rounded-[8px]"
              style={{
                padding: '10px 14px',
                backgroundColor: theme === 'dark' ? '#1f1a12' : '#fdf8f0',
                border: '1px solid #c4a574',
                marginBottom: 24,
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase', margin: 0, marginBottom: 2 }}>
                Joining
              </p>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
                {agencyName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted)', margin: 0, marginTop: 2 }}>
                Code: <span style={{ fontFamily: 'monospace' }}>{code}</span>
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                Create your account
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                You&apos;ll be added as a sales rep.
              </p>
            </div>

            <form onSubmit={handleJoin} className="flex flex-col">

              {/* Full name */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 16 }}>
                <label htmlFor="name" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>Full name</label>
                <input
                  id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="flex-1 bg-transparent outline-none"
                    style={{ fontSize: 14, color: 'var(--foreground)' }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="ml-2 flex shrink-0 items-center" aria-label={showPw ? 'Hide' : 'Show'}>
                    {showPw ? <EyeOff size={16} color="var(--muted)" /> : <Eye size={16} color="var(--muted)" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div className="flex flex-col" style={{ gap: 6, marginBottom: 24 }}>
                <label htmlFor="confirmPw" style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}>Confirm password</label>
                <div
                  className="flex items-center rounded-[8px]"
                  style={{ height: 40, backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)', border: confirmPw && confirmPw !== password ? '1px solid #d97706' : '1px solid var(--border)', padding: '0 12px' }}
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
                  <button type="button" onClick={() => setShowConfirmPw(p => !p)} className="ml-2 flex shrink-0 items-center" aria-label={showConfirmPw ? 'Hide' : 'Show'}>
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
                {loading ? 'Creating account…' : 'Join Agency'}
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

      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          © 2026 FieldIQ · Privacy · Terms
        </span>
      </div>
    </div>
  )
}
