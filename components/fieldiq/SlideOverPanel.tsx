'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface SlideOverPanelProps {
  onClose: () => void
  children: React.ReactNode
  width?: number
  hideBackdrop?: boolean
}

export function SlideOverPanel({ onClose, children, width = 480, hideBackdrop = false }: SlideOverPanelProps) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  )

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      {!hideBackdrop && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Panel */}
      <motion.div
        className="fixed z-50 flex flex-col overflow-hidden bottom-0 left-0 right-0 max-h-[92vh] rounded-t-[12px] md:inset-y-0 md:bottom-auto md:right-0 md:left-auto md:max-h-none md:h-screen md:rounded-none"
        style={{
          backgroundColor: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: isMobile
            ? '0 -4px 24px rgba(0,0,0,0.22)'
            : '-4px 0 24px rgba(0,0,0,0.16)',
          width: isMobile ? undefined : width,
        }}
        initial={isMobile ? { y: '100%' } : { x: '100%' }}
        animate={isMobile ? { y: 0 } : { x: 0 }}
        exit={isMobile ? { y: '100%' } : { x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </>
  )
}
