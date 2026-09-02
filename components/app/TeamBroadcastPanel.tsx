'use client'

import { useState } from 'react'
import { X, Radio, Sparkles } from 'lucide-react'
import { useTeamBroadcast } from '@/lib/context/TeamBroadcastContext'
import { useNotifications } from '@/lib/context/NotificationContext'
import { useSuccessToast } from '@/components/app/SuccessToast'
import { SlideOverPanel } from './SlideOverPanel'

export function TeamBroadcastPanel() {
  const { closeBroadcast } = useTeamBroadcast()
  const { addNotification } = useNotifications()
  const showToast = useSuccessToast()

  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  function handleSend() {
    addNotification({
      type: 'broadcast',
      message: `${subject}: ${message}`,
      timestamp: 'Just now',
    })
    showToast('Broadcast sent to all reps')
    closeBroadcast()
    setSubject('')
    setMessage('')
  }

  function handleCancel() {
    closeBroadcast()
    setSubject('')
    setMessage('')
  }

  const canSend = subject.trim() !== '' && message.trim() !== ''

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 40,
    padding: '0 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--foreground)',
    fontSize: 14,
    outline: 'none',
  }

  return (
    <SlideOverPanel onClose={closeBroadcast} width={480}>
      {/* Header */}
      <div
        className="flex shrink-0 items-center justify-between"
        style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Radio size={16} style={{ color: '#c4a574' }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)' }}>
            Send Team Broadcast
          </span>
        </div>
        <button
          onClick={handleCancel}
          className="flex items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--surface)]"
          style={{ width: 32, height: 32, color: 'var(--muted)', border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Subject <span style={{ color: '#c4a574' }}>*</span>
            </span>
          </div>
          <input
            type="text"
            placeholder="e.g. Q2 Activity Push — Final Week"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--muted)', textTransform: 'uppercase' }}>
              Message <span style={{ color: '#c4a574' }}>*</span>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setMessage("Hey Kevin — noticed you haven't logged any activity this week. I know it's been busy. Even a quick pop-by or call counts. Your Q2 target is within reach. Let me know if you need anything.")
                }}
                className="flex items-center gap-1 transition-opacity hover:opacity-70"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#c4a574', fontSize: 12, fontWeight: 600 }}
              >
                <Sparkles size={11} />
                AI Draft
              </button>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{message.length}/500</span>
            </div>
          </div>
          <textarea
            placeholder="Write your message to all reps…"
            value={message}
            onChange={e => setMessage(e.target.value.slice(0, 500))}
            style={{ ...inputStyle, height: 140, paddingTop: 10, paddingBottom: 10, resize: 'none', fontFamily: 'inherit' }}
          />
          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>
            This message will be sent to all 9 reps on your team and appear in their notifications.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex shrink-0 items-center justify-end gap-3"
        style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={handleCancel}
          style={{ height: 40, padding: '0 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: 'var(--muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          style={{
            height: 40, padding: '0 20px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            backgroundColor: canSend ? '#c4a574' : 'var(--surface)',
            color: canSend ? '#000000' : 'var(--muted)',
            border: canSend ? 'none' : '1px solid var(--border)',
            cursor: canSend ? 'pointer' : 'not-allowed',
            transition: 'all 0.15s',
          }}
        >
          Send to All Agents
        </button>
      </div>
    </SlideOverPanel>
  )
}
