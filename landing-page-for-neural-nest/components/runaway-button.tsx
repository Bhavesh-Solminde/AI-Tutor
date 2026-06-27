'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const TAUNTS = [
  'Nice try 😅',
  'Too slow! 🏃',
  'Catch me if you can',
  'Your GPA is crying',
  'Not today, friend',
  'The exam awaits 📚',
  'Denied. Study instead.',
  'Missed me!',
  'Bold move. Still no.',
  'Your future self says no',
]

export function RunawayButton() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [taunt, setTaunt] = useState<string | null>(null)
  const lastTaunt = useRef(-1)
  const tauntTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pickTaunt = () => {
    let i = Math.floor(Math.random() * TAUNTS.length)
    if (i === lastTaunt.current) i = (i + 1) % TAUNTS.length
    lastTaunt.current = i
    return TAUNTS[i]
  }

  const flee = () => {
    if (reduce) return
    const pad = 24
    const w = ref.current?.offsetWidth ?? 260
    const h = ref.current?.offsetHeight ?? 40
    const x = pad + Math.random() * (window.innerWidth - w - pad * 2)
    const y = pad + Math.random() * (window.innerHeight - h - pad * 2)
    setPos({ x, y })
    setTaunt(pickTaunt())
    if (tauntTimer.current) clearTimeout(tauntTimer.current)
    tauntTimer.current = setTimeout(() => setTaunt(null), 1400)
  }

  const button = (
    <button
      ref={ref}
      type="button"
      onMouseEnter={flee}
      onFocus={flee}
      onClick={flee}
      className="relative inline-flex items-center justify-center whitespace-nowrap rounded-lg border border-border bg-elevated px-5 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:border-muted-foreground/40 hover:text-foreground"
    >
      No thanks, I&apos;ll fail my exam alone
      <AnimatePresence mode="wait">
        {taunt && (
          <motion.span
            key={taunt}
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-elevated px-2.5 py-1 text-[11px] text-foreground shadow-lg"
          >
            {taunt}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )

  if (pos) {
    return (
      <motion.div
        className="fixed z-[60]"
        animate={{ left: pos.x, top: pos.y }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ left: pos.x, top: pos.y }}
      >
        {button}
      </motion.div>
    )
  }

  return <div className="inline-block">{button}</div>
}
