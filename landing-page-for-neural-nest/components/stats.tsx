'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'

function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setVal(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const dur = 1400
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(to * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, reduce])

  return <span ref={ref}>{val.toFixed(decimals)}</span>
}

const STATS = [
  { value: <CountUp to={57} />, suffix: '', label: 'Topics extracted from one ML syllabus' },
  { value: <CountUp to={3} />, suffix: '\u00D7', label: 'Re-explanation cycles before moving on' },
  { value: '0.6 / 0.3 / 0.1', suffix: '', label: 'Quiz · self-rating · engagement weights' },
  { value: <CountUp to={1024} />, suffix: '', label: 'Cohere embedding dimensions per chunk' },
]

export function Stats() {
  return (
    <section id="stats" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-surface p-6 sm:p-8"
            >
              <div className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {s.value}
                {s.suffix}
              </div>
              <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
