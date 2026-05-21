'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, User, UserCog, TrendingUp, Mail, Moon, Sun, CheckCircle2, ArrowRight, Copy, Check } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2
type Role = 'rep' | 'manager' | null
type RepPath = 'individual' | 'join' | null

// ── Selection Tile ─────────────────────────────────────────────────────────────

interface TileProps {
  icon: React.ElementType
  title: string
  description: string
  selected: boolean
  onClick: () => void
  theme: string
}

function SelectionTile({ icon: Icon, title, description, selected, onClick, theme }: TileProps) {
  const activeTileBg = theme === 'dark' ? '#1f1a12' : '#fdf8f0'
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-[10px] transition-all"
      style={{
        padding: '14px 16px',
        border: selected ? '2px solid #c4a574' : '1px solid var(--border)',
        backgroundColor: selected ? activeTileBg : 'var(--surface)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div
        className="flex items-center justify-center shrink-0 rounded-[8px]"
        style={{
          width: 36,
          height: 36,
          backgroundColor: selected ? (theme === 'dark' ? '#2d2210' : '#f0e8d8') : 'var(--card)',
          border: selected ? '1px solid #c4a574' : '1px solid var(--border)',
        }}
      >
        <Icon size={16} style={{ color: selected ? '#c4a574' : 'var(--muted)' }} />
      </div>
      <div className="flex flex-col" style={{ gap: 3, paddingTop: 2 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: selected ? 'var(--foreground)' : 'var(--body)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
          {description}
        </span>
      </div>
    </button>
  )
}

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

// ── Main Component ─────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  const [step, setStep] = useState<Step>(1)
  const [role, setRole] = useState<Role>(null)
  const [repPath, setRepPath] = useState<RepPath>(null)
  const [showJoinInfo, setShowJoinInfo] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null)
  const [promptCopied, setPromptCopied] = useState(false)

  const MANAGER_PROMPT = 'Sign up on FieldIQ as a Manager, create your agency, and share your agency code with me.'

  function handleCopyPrompt() {
    navigator.clipboard.writeText(MANAGER_PROMPT)
    setPromptCopied(true)
    setTimeout(() => setPromptCopied(false), 2000)
  }

  const canContinue =
    (step === 1 && role !== null) ||
    (step === 2 && repPath !== null)

  function handleContinue() {
    if (step === 1) {
      if (role === 'manager') {
        router.push('/signup?role=manager')
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      if (repPath === 'individual') {
        router.push('/signup')
      } else {
        setShowJoinInfo(true)
        setJoinCode('')
        setJoinCodeError(null)
      }
    }
  }

  function handleBack() {
    if (showJoinInfo) {
      setShowJoinInfo(false)
      setRepPath(null)
      setJoinCode('')
      setJoinCodeError(null)
    } else if (step === 2) {
      setRepPath(null)
      setStep(1)
    }
  }

  function handleJoinContinue() {
    const code = joinCode.trim().toUpperCase()
    if (code.length < 6) {
      setJoinCodeError('Please enter a valid agency code.')
      return
    }
    router.push(`/join/${code}`)
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
    transition: 'opacity 0.15s',
  }

  const disabledBtn: React.CSSProperties = {
    ...goldBtn,
    backgroundColor: 'var(--surface)',
    color: 'var(--muted)',
    border: '1px solid var(--border)',
    cursor: 'not-allowed',
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

      {/* Card */}
      <div className="fieldiq-card w-full max-w-[440px] p-8">

        {/* Logo */}
        <div className="flex flex-col" style={{ gap: 6 }}>
          <Image
            src={theme === 'dark'
              ? '/images/logo/lockup_dark.svg'
              : '/images/logo/lockup_light.svg'}
            alt="FieldIQ"
            width={178}
            height={64}
            priority
            unoptimized
            style={{ width: 178, height: 'auto' }}
          />
          <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
            Field Sales Intelligence for Title Professionals
          </span>
        </div>

        <div style={{ height: 28 }} />

        {/* Progress row */}
        <div className="flex items-center justify-between">
          {step > 1 || showJoinInfo ? (
            <button
              onClick={handleBack}
              className="flex items-center"
              style={{ fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, gap: 2 }}
            >
              <ChevronLeft size={14} />
              Back
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center" style={{ gap: 6 }}>
            {[1, 2].map((dot) => {
              const active = showJoinInfo ? dot === 2 : dot === step
              return (
                <div
                  key={dot}
                  style={{
                    width: active ? 20 : 6,
                    height: 6,
                    borderRadius: 9999,
                    backgroundColor: '#c4a574',
                    transition: 'width 0.2s',
                  }}
                />
              )
            })}
          </div>
        </div>

        <div style={{ height: 24 }} />

        {/* ── Step 1: Rep or Manager? ── */}
        {step === 1 && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                How will you use FieldIQ?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                Let&apos;s set up the right experience for you.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 10, marginBottom: 24 }}>
              <SelectionTile
                icon={User}
                title="I'm a Sales Rep"
                description="Track field activities, contacts, and your personal performance."
                selected={role === 'rep'}
                onClick={() => setRole('rep')}
                theme={theme}
              />
              <SelectionTile
                icon={UserCog}
                title="I'm a Manager"
                description="Set up your agency, manage your team, and track team performance."
                selected={role === 'manager'}
                onClick={() => setRole('manager')}
                theme={theme}
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={!canContinue}
              style={canContinue ? goldBtn : disabledBtn}
              className="hover:opacity-90 active:opacity-80"
            >
              Continue
            </button>

            <div style={{ height: 20 }} />

            <p className="text-center" style={{ fontSize: 12, color: 'var(--muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--gold)' }} className="hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}

        {/* ── Step 2: Individual or joining agency? ── */}
        {step === 2 && !showJoinInfo && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                How are you joining?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                You can always connect to a team later.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 10, marginBottom: 24 }}>
              <SelectionTile
                icon={TrendingUp}
                title="I'm working independently"
                description="Track your own activities and contacts. No team required."
                selected={repPath === 'individual'}
                onClick={() => setRepPath('individual')}
                theme={theme}
              />
              <SelectionTile
                icon={Mail}
                title="I'm joining an agency"
                description="Your manager will send you an invite link via email."
                selected={repPath === 'join'}
                onClick={() => setRepPath('join')}
                theme={theme}
              />
            </div>

            <button
              onClick={handleContinue}
              disabled={!canContinue}
              style={canContinue ? goldBtn : disabledBtn}
              className="hover:opacity-90 active:opacity-80"
            >
              Continue
            </button>
          </>
        )}

        {/* ── Step 2b: Agency code entry ── */}
        {step === 2 && showJoinInfo && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                Enter your agency code
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                Ask your manager for the code — they&apos;ll find it in their Team page.
              </p>
            </div>

            {/* Code input */}
            <div className="flex flex-col" style={{ gap: 8, marginBottom: 20 }}>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))
                  setJoinCodeError(null)
                }}
                placeholder="XXXXXXXX"
                className="focus:ring-1 focus:ring-[#c4a574]"
                style={{
                  height: 48,
                  backgroundColor: theme === 'dark' ? 'var(--surface)' : 'var(--card)',
                  border: joinCodeError ? '1px solid #d97706' : '1px solid var(--border)',
                  padding: '0 16px',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  color: 'var(--foreground)',
                  borderRadius: 8,
                  outline: 'none',
                  width: '100%',
                  textTransform: 'uppercase',
                  fontFamily: 'monospace',
                }}
              />
              {joinCodeError && (
                <span style={{ fontSize: 12, color: '#d97706' }}>{joinCodeError}</span>
              )}
            </div>

            <button
              onClick={handleJoinContinue}
              disabled={joinCode.trim().length < 6}
              className="hover:opacity-90 active:opacity-80"
              style={
                joinCode.trim().length >= 6
                  ? { ...goldBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }
                  : { ...disabledBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }
              }
            >
              Find Agency
              <ArrowRight size={14} />
            </button>

            {/* Divider */}
            <div style={{ height: 20 }} />
            <div className="flex items-center" style={{ gap: 12 }}>
              <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)' }}>OR</span>
              <div className="flex-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
            </div>
            <div style={{ height: 20 }} />

            {/* Tell your manager fallback */}
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', margin: 0, marginBottom: 10 }}>
              Don&apos;t have a code? Tell your manager
            </p>
            <div
              className="rounded-[8px]"
              style={{
                padding: '12px 14px',
                backgroundColor: theme === 'dark' ? '#1f1a12' : '#fdf8f0',
                border: '1px solid #c4a574',
                marginBottom: 16,
                position: 'relative',
              }}
            >
              <button
                onClick={handleCopyPrompt}
                title="Copy prompt"
                className="flex items-center rounded-[6px] transition-opacity hover:opacity-70"
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: promptCopied ? '#16a34a' : '#c4a574',
                  padding: 2,
                }}
              >
                {promptCopied ? <Check size={13} /> : <Copy size={13} />}
              </button>
              <p style={{ fontSize: 13, color: 'var(--foreground)', margin: 0, lineHeight: 1.6, paddingRight: 20 }}>
                &ldquo;Sign up on FieldIQ as a Manager, create your agency, and share your agency code with me.&rdquo;
              </p>
            </div>

            <p className="text-center" style={{ fontSize: 12, color: 'var(--muted)' }}>
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: 12, padding: 0 }}
                className="hover:underline"
              >
                Sign in
              </button>
            </p>
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
