'use client'

import { motion } from 'motion/react'

const TESTIMONIALS = [
  {
    quote:
      'The Exam Rescue mode saved my OS grade. I had two days and no idea where to start — it told me exactly what to drill and skipped everything I already knew.',
    name: 'Sarah M.',
    role: 'CS Major',
  },
  {
    quote:
      'The AI tutor explains complex reactions with analogies that actually stick. It re-explained enzyme kinetics three different ways until one finally clicked.',
    name: 'Michael T.',
    role: 'Pre-Med',
  },
  {
    quote:
      'Seeing the nodes turn green gives me so much dopamine. I genuinely look forward to studying now, which I never thought I would say.',
    name: 'Emily R.',
    role: 'High School',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Real learners. Real mastery.
          </h2>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col border-l-2 border-primary pl-6"
            >
              <blockquote className="flex-1 text-pretty text-base leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5">
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="font-mono text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
