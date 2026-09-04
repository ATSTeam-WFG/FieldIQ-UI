'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { X, MessageSquare, Bug, HelpCircle, Lightbulb } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useFeedback } from '@/lib/context/FeedbackContext'
import { useSuccessToast } from '@/components/app/SuccessToast'
import { useTheme } from '@/lib/context/ThemeContext'
import { SlideOverPanel } from './SlideOverPanel'
import { submitFeedback, type FeedbackBucket } from '@/lib/api/feedback'

// The three buttons are the triage rule applied at report time: defect → V1.x,
// refinement → V1.x only if it fits, capability → ledger. Classifying here,
// while the reporter still knows which it is, is the point of the widget.
const BUCKETS: { value: FeedbackBucket; label: string; icon: LucideIcon; hint: string }[] = [
  { value: 'defect',     label: "Something's broken",        icon: Bug,        hint: 'It errored, hung, or showed the wrong thing' },
  { value: 'refinement', label: 'This is confusing / awkward', icon: HelpCircle, hint: 'It works, but it took too long to figure out' },
  { value: 'capability', label: 'I wish it could…',           icon: Lightbulb,  hint: "Something it doesn't do yet" },
]

const MAX_MESSAGE = 4000

export function FeedbackPanel() {
  const { closeFeedback } = useFeedback()
  const showToast = useSuccessToast()
  const { theme } = useTheme()
  const pathname = usePathname()

  const [bucket, setBucket] = useState<FeedbackBucket | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const canSend = bucket !== null && message.trim() !== ''
  const activeTileBg = theme === 'dark' ? '#1f1a12' : '#fdf8f0'

  async function handleSend() {
    if (!bucket) return
    setLoading(true)
    try {
      await submitFeedback(bucket, message.trim(), pathname)
      showToast('Thanks — your feedback was sent to the team')
      closeFeedback()
      setBucket(null)
      setMessage('')
    } catch {
      showToast('Could not send feedback — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SlideOverPanel onClose={closeFeedback} width={480}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between"
        style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={16} style={{ color: '#c4a574' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
            Send Feedback
          </span>
        </div>
        <button
          onClick={closeFeedback}
          className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
          style={{ width: 32, height: 32, color: 'var(--muted)', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
          aria-label="Close feedback"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' as const }}>
            What kind of feedback?
          </span>
          <div className="grid grid-cols-1 gap-2" style={{ marginTop: 10 }}>
            {BUCKETS.map(({ value, label, icon: Icon, hint }) => {
              const active = bucket === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBucket(value)}
                  className="flex items-start gap-3 rounded-[8px] text-left transition-colors"
                  style={{
                    padding: '12px 14px',
                    border: active ? '2px solid #c4a574' : '1px solid var(--border)',
                    backgroundColor: active ? activeTileBg : 'var(--surface)',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={16} style={{ color: active ? '#c4a574' : 'var(--muted)', marginTop: 2, flexShrink: 0 }} />
                  <span>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: active ? 600 : 500, color: active ? '#c4a574' : 'var(--foreground)' }}>
                      {label}
                    </span>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                      {hint}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' as const }}>
            Tell us more
          </span>
          <div className="relative" style={{ marginTop: 10 }}>
            <textarea
              placeholder="What happened, or what were you trying to do?"
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
              style={{
                width: '100%', height: 140, padding: '10px 12px', borderRadius: 8,
                border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
                color: 'var(--foreground)', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit',
              }}
            />
            <span style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 11, color: 'var(--muted)' }}>
              {message.length}/{MAX_MESSAGE}
            </span>
          </div>
        </div>

        {/* Saying what is collected keeps the auto-capture from being a surprise. */}
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14, lineHeight: 1.5 }}>
          We automatically include the page you are on, your account and agency, and
          your last few actions — so you do not have to describe how to reproduce it.
        </p>
      </div>

      {/* Footer */}
      <div
        className="flex shrink-0 items-center justify-end gap-3"
        style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={closeFeedback}
          style={{ height: 40, padding: '0 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend || loading}
          style={{
            height: 40, padding: '0 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            backgroundColor: canSend ? (theme === 'dark' ? '#c4a574' : '#000000') : 'var(--surface)',
            color: canSend ? (theme === 'dark' ? '#000000' : '#ffffff') : 'var(--muted)',
            border: canSend ? 'none' : '1px solid var(--border)',
            cursor: (canSend && !loading) ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Sending…' : 'Send Feedback'}
        </button>
      </div>
    </SlideOverPanel>
  )
}
