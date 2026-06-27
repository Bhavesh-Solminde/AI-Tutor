'use client'

import { useRef } from 'react'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { ArrowRight } from 'lucide-react'

function MagneticButton() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useSpring(0, { stiffness: 200, damping: 15 })
  const y = useSpring(0, { stiffness: 200, damping: 15 })

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.3)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href="#"
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      className="group inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-4 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-hover"
    >
      Start Learning Free
      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
    </motion.a>
  )
}

export function FooterCta() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20">
      {/* ambient glow cone from bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_bottom,rgba(59,107,255,0.28),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(59,107,255,0.35),transparent_70%)]"
      />
      <div className="mx-auto max-w-3xl px-5 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-4xl font-black tracking-[-0.02em] sm:text-6xl"
        >
          Your exam isn&apos;t going to study for itself.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          Stop cramming and start mastering. Free to start. No credit card required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton />
          <a
            href="#demo"
            className="inline-flex items-center rounded-lg border border-border bg-surface/60 px-7 py-4 text-base font-semibold text-foreground backdrop-blur transition-colors hover:bg-surface"
          >
            View Live Demo
          </a>
        </motion.div>
      </div>
    </section>
  )
}
