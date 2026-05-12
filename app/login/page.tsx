'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'
import { login } from '@/lib/api/auth'

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

export default function LoginPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await login(email, password)
      // Full navigation so RoleContext remounts and re-fetches /auth/me with the new token
      window.location.href = res.user.role === 'manager' ? '/manager' : '/dashboard'
    } catch (err: any) {
      setError(err.message ?? 'Sign in failed')
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
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-6"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Theme toggle — top-right, outside card */}
      <div className="absolute right-6 top-6">
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
      </div>

      {/* Login card */}
      <div className="fieldiq-card w-full max-w-[400px] p-10">

        {/* Logo block */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col" style={{ gap: 6 }}>
            <span
              className="font-semibold leading-none"
              style={{ fontSize: 22, color: 'var(--foreground)' }}
            >
              FieldIQ
            </span>
            <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
              Field Sales Intelligence for Title Professionals
            </span>
          </div>
          <Link
            href="/onboarding"
            style={{ fontSize: 12, color: 'var(--gold)', whiteSpace: 'nowrap', marginTop: 2 }}
            className="hover:underline"
          >
            New? Start here →
          </Link>
        </div>

        <div style={{ height: 32 }} />

        {/* Heading block */}
        <div className="flex flex-col" style={{ gap: 4 }}>
          <h1
            className="font-semibold leading-tight"
            style={{ fontSize: 20, color: 'var(--foreground)' }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--muted)' }}>
            Sign in to your account
          </p>
        </div>

        <div style={{ height: 24 }} />

        <form onSubmit={handleSignIn} className="flex flex-col">

          {/* Email field */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <label
              htmlFor="email"
              style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="w-full rounded-[8px] outline-none transition-shadow focus:ring-1 focus:ring-[#c4a574]"
              style={inputStyle}
            />
          </div>

          <div style={{ height: 16 }} />

          {/* Password field */}
          <div className="flex flex-col" style={{ gap: 6 }}>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                style={{ fontSize: 12, fontWeight: 500, color: 'var(--body)' }}
              >
                Password
              </label>
              <Link
                href="/coming-soon"
                style={{ fontSize: 12, color: 'var(--gold)' }}
                className="hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: 14, color: 'var(--foreground)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="ml-2 flex shrink-0 items-center"
              >
                {showPassword
                  ? <EyeOff size={16} color="var(--muted)" />
                  : <Eye size={16} color="var(--muted)" />
                }
              </button>
            </div>
          </div>

          <div style={{ height: 24 }} />

          {error && (
            <p style={{ fontSize: 13, color: '#d97706', marginBottom: 12 }}>{error}</p>
          )}

          {/* Sign in button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-[8px] font-semibold transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50"
            style={{
              height: 42,
              fontSize: 14,
              backgroundColor: theme === 'dark' ? 'var(--gold)' : '#000000',
              color: theme === 'dark' ? '#000000' : '#fafaf9',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div style={{ height: 20 }} />

          {/* Divider */}
          <div className="flex items-center" style={{ gap: 12 }}>
            <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>or</span>
            <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
          </div>

          <div style={{ height: 20 }} />

          {/* SSO buttons */}
          <Link
            href="/coming-soon"
            className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-80"
            style={{
              height: 42,
              gap: 8,
              border: '1px solid var(--border)',
              fontSize: 14,
              color: 'var(--body)',
              backgroundColor: 'transparent',
              marginBottom: 10,
            }}
          >
            <GoogleIcon />
            Continue with Google
          </Link>

          <Link
            href="/coming-soon"
            className="flex items-center justify-center rounded-[8px] transition-opacity hover:opacity-80"
            style={{
              height: 42,
              gap: 8,
              border: '1px solid var(--border)',
              fontSize: 14,
              color: 'var(--body)',
              backgroundColor: 'transparent',
            }}
          >
            <MicrosoftIcon />
            Continue with Microsoft
          </Link>

          <div style={{ height: 24 }} />

          {/* Footer note */}
          <p className="text-center" style={{ fontSize: 12, color: 'var(--muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--gold)' }} className="hover:underline">
              Sign up
            </Link>
          </p>
        </form>
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
