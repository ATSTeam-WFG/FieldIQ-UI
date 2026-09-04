'use client'

import { MessageSquare } from 'lucide-react'
import { useFeedback } from '@/lib/context/FeedbackContext'

/**
 * Floating feedback trigger. Deliberately the most visible affordance in the
 * shell — during alpha, an unreported problem costs more than a little chrome.
 *
 * Bottom-right rather than the sidebar because the sidebar is desktop-only
 * (`hidden md:flex`), and a rep logging a pop-by from a parking lot is on a
 * phone. On mobile it sits above the 56px tab bar.
 *
 * z-30 keeps it under the slide-over backdrop (z-40) so an open panel covers it.
 */
export function FeedbackButton() {
  const { isOpen, openFeedback } = useFeedback()

  if (isOpen) return null

  return (
    <button
      onClick={openFeedback}
      aria-label="Send feedback"
      title="Send feedback"
      className="fixed z-30 flex items-center justify-center rounded-full transition-transform hover:scale-105 bottom-[72px] right-4 md:bottom-6 md:right-6"
      style={{
        width: 48,
        height: 48,
        backgroundColor: '#c4a574',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      }}
    >
      <MessageSquare size={20} style={{ color: '#000000' }} />
    </button>
  )
}
