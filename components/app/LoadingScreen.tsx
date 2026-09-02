'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LogoAnimation } from './LogoAnimation'

const PHRASES = [
  'Searching the chain...',
  'Abstracting the title...',
  'Tracing ownership...',
  'Sleuthing liens...',
  'Examining encumbrances...',
  'Untangling the chain...',
  'Combing records...',
  'Excavating deeds...',
  'Verifying vesting...',
  'Curing defects...',
  'Plotting legal descriptions...',
  'Reconciling the file...',
  'Spelunking county records...',
  'Pondering the abstract...',
  'Decoding the deed...',
]

function splitPhrase(phrase: string): { verb: string; rest: string } {
  const idx = phrase.indexOf(' ')
  if (idx === -1) return { verb: phrase, rest: '' }
  return { verb: phrase.slice(0, idx), rest: phrase.slice(idx) }
}

export function LoadingScreen() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    // Randomize starting phrase after hydration (Math.random() must not run on server)
    setIndex(Math.floor(Math.random() * PHRASES.length))
    const t = setInterval(() => {
      setIndex(i => (i + 1) % PHRASES.length)
    }, 2200)
    return () => clearInterval(t)
  }, [])

  const { verb, rest } = splitPhrase(PHRASES[index])

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#0f0f0f', gap: 32 }}
    >
      <LogoAnimation size={88} />

      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            fontSize: 13,
            letterSpacing: '0.04em',
            color: 'var(--muted)',
            fontWeight: 400,
          }}
        >
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{verb}</span>
          {rest}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
