'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User, Users, UserCog, TrendingUp, Mail, Moon, Sun, CheckCircle2 } from 'lucide-react'
import { useTheme } from '@/lib/context/ThemeContext'

// ── Types ─────────────────────────────────────────────────────────────────────

type Step = 1 | 2 | 3 | 4
type UserType = 'individual' | 'agency' | null
type AgencyRole = 'rep' | 'manager' | null
type RepChoice = 'individual' | 'team' | null

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
  const [userType, setUserType] = useState<UserType>(null)
  const [agencyRole, setAgencyRole] = useState<AgencyRole>(null)
  const [repChoice, setRepChoice] = useState<RepChoice>(null)

  const canContinue =
    (step === 1 && userType !== null) ||
    (step === 2 && agencyRole !== null) ||
    (step === 3 && repChoice !== null)

  const dotCount = step === 4 ? 4 : step

  function handleContinue() {
    if (step === 1) {
      if (userType === 'individual') {
        router.push('/signup?type=individual')
      } else {
        setStep(2)
      }
    } else if (step === 2) {
      if (agencyRole === 'manager') {
        router.push('/signup?role=manager&type=agency')
      } else {
        setStep(3)
      }
    } else if (step === 3) {
      if (repChoice === 'individual') {
        router.push('/signup?type=individual')
      } else {
        setStep(4)
      }
    }
  }

  function handleBack() {
    if (step === 2) { setAgencyRole(null); setStep(1) }
    else if (step === 3) { setRepChoice(null); setStep(2) }
    else if (step === 4) { setRepChoice(null); setStep(3) }
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
          <span className="font-semibold leading-none" style={{ fontSize: 22, color: 'var(--foreground)' }}>
            FieldIQ
          </span>
          <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 }}>
            Field Sales Intelligence for Title Professionals
          </span>
        </div>

        <div style={{ height: 28 }} />

        {/* Progress row */}
        <div className="flex items-center justify-between">
          {step > 1 ? (
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
            {Array.from({ length: dotCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i + 1 === dotCount ? 20 : 6,
                  height: 6,
                  borderRadius: 9999,
                  backgroundColor: '#c4a574',
                  transition: 'width 0.2s',
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ height: 24 }} />

        {/* ── Step 1: Who are you? ── */}
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
                title="Individual Title Sales Rep"
                description="Track your own field activities, contacts, and performance on your own."
                selected={userType === 'individual'}
                onClick={() => setUserType('individual')}
                theme={theme}
              />
              <SelectionTile
                icon={Users}
                title="Small or Mid-Size Agency Team"
                description="Manage your agency's sales team or join your agency's account."
                selected={userType === 'agency'}
                onClick={() => setUserType('agency')}
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

        {/* ── Step 2: Agency role ── */}
        {step === 2 && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                What&apos;s your role at your agency?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                We&apos;ll tailor your account to fit your responsibilities.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 10, marginBottom: 24 }}>
              <SelectionTile
                icon={User}
                title="Sales Rep"
                description="I work in the field, managing contacts and closing deals."
                selected={agencyRole === 'rep'}
                onClick={() => setAgencyRole('rep')}
                theme={theme}
              />
              <SelectionTile
                icon={UserCog}
                title="Manager"
                description="I oversee a team of sales reps and track team performance."
                selected={agencyRole === 'manager'}
                onClick={() => setAgencyRole('manager')}
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

        {/* ── Step 3: Rep options ── */}
        {step === 3 && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                How would you like to get started?
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                You can always switch to a team account later.
              </p>
            </div>

            <div className="flex flex-col" style={{ gap: 10, marginBottom: 24 }}>
              <SelectionTile
                icon={TrendingUp}
                title="Use FieldIQ Individually"
                description="Track your own performance and field activity. Great for personal growth and staying organized."
                selected={repChoice === 'individual'}
                onClick={() => setRepChoice('individual')}
                theme={theme}
              />
              <SelectionTile
                icon={Mail}
                title="Request Access to My Agency's Account"
                description="Ask your manager to set up an organization account and send you an invite."
                selected={repChoice === 'team'}
                onClick={() => setRepChoice('team')}
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

        {/* ── Step 4: Request access info ── */}
        {step === 4 && (
          <>
            <div className="flex flex-col" style={{ gap: 4, marginBottom: 24 }}>
              <h1 className="font-semibold" style={{ fontSize: 20, color: 'var(--foreground)', margin: 0 }}>
                You&apos;re one step away
              </h1>
              <p style={{ fontSize: 14, color: 'var(--muted)', margin: 0 }}>
                Ask your manager to get you set up.
              </p>
            </div>

            <div
              className="rounded-[10px]"
              style={{
                padding: 20,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                marginBottom: 24,
              }}
            >
              <div className="flex items-start" style={{ gap: 12, marginBottom: 16 }}>
                <CheckCircle2 size={18} style={{ color: '#c4a574', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', margin: 0, marginBottom: 4 }}>
                    Share this with your manager
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                    Ask them to create an organization account on FieldIQ and invite you as a sales rep. You&apos;ll receive an email with a link to join the team.
                  </p>
                </div>
              </div>

              <div
                className="rounded-[8px]"
                style={{
                  padding: '12px 14px',
                  backgroundColor: theme === 'dark' ? '#1f1a12' : '#fdf8f0',
                  border: '1px solid #c4a574',
                }}
              >
                <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, marginBottom: 2, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Tell your manager
                </p>
                <p style={{ fontSize: 13, color: 'var(--foreground)', margin: 0, lineHeight: 1.5 }}>
                  &ldquo;Sign up at fieldiq.ai, choose Agency Team → Manager, and invite me as a rep on your team.&rdquo;
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="flex items-center justify-center w-full rounded-[8px] font-semibold transition-opacity hover:opacity-90"
              style={{
                height: 42,
                fontSize: 14,
                backgroundColor: theme === 'dark' ? '#c4a574' : '#000000',
                color: theme === 'dark' ? '#000000' : '#fafaf9',
                textDecoration: 'none',
              }}
            >
              Already invited? Sign in
            </Link>
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
