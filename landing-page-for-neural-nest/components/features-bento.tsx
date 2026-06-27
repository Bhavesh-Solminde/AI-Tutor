'use client'

import { motion, useReducedMotion } from 'motion/react'
import { Check, MessageSquare, Upload, Zap } from 'lucide-react'

function Tile({
  children,
  className = '',
  index,
}: {
  children: React.ReactNode
  className?: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-7 ${className}`}
    >
      {children}
    </motion.div>
  )
}

function TileHeader({
  icon: Icon,
  color,
  title,
  body,
}: {
  icon: typeof MessageSquare
  color: string
  title: string
  body: string
}) {
  return (
    <div>
      <span
        className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-elevated"
        style={{ color }}
      >
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
    </div>
  )
}

export function FeaturesBento() {
  const reduce = useReducedMotion()

  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            The ecosystem for mastery.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Stop jumping between PDFs, ChatGPT tabs, and flashcard apps.
          </p>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* AI Tutor — wide (7) */}
          <Tile index={0} className="md:col-span-7">
            <TileHeader
              icon={MessageSquare}
              color="var(--primary)"
              title="AI Tutor"
              body="Ask anything, any way. The tutor reframes concepts with analogies until they land."
            />
            <div className="mt-6 flex-1 space-y-3 rounded-xl border border-border bg-background/40 p-4">
              <div className="flex justify-end">
                <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-white">
                  Can you explain Backpropagation like I&apos;m 5?
                </p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex justify-start"
              >
                <p className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-elevated px-3.5 py-2 text-sm text-foreground">
                  Imagine missing a basketball shot. You notice it went too far left,
                  so next time you adjust your aim a little. Backprop is the network
                  nudging its &quot;aim&quot; after every miss.
                </p>
              </motion.div>
            </div>
          </Tile>

          {/* Adaptive Quizzes — narrow (5) */}
          <Tile index={1} className="md:col-span-5">
            <TileHeader
              icon={Zap}
              color="var(--warning)"
              title="Adaptive Quizzes"
              body="Checkpoints that get harder as you improve — and easier when you stumble."
            />
            <div className="mt-6 flex-1 rounded-xl border border-border bg-background/40 p-4">
              <p className="text-sm font-medium">
                Which activation function suffers from vanishing gradients?
              </p>
              <div className="mt-3 space-y-2">
                {['A. ReLU', 'B. Sigmoid', 'C. Leaky ReLU'].map((opt) => {
                  const correct = opt.startsWith('B')
                  return (
                    <div
                      key={opt}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                        correct
                          ? 'border-success/50 bg-success/10 text-foreground'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      <span>{opt}</span>
                      {correct && <Check className="h-4 w-4 text-success" />}
                    </div>
                  )
                })}
              </div>
            </div>
          </Tile>

          {/* Universal Uploads — narrow (5) */}
          <Tile index={2} className="md:col-span-5">
            <TileHeader
              icon={Upload}
              color="var(--primary)"
              title="Universal Uploads"
              body="PDFs, slide decks, lecture notes — dropped in once and turned into a curriculum."
            />
            <div className="mt-6 flex-1 rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-md bg-elevated font-mono text-[10px] font-bold text-primary">
                  PDF
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    CS_101_Syllabus.pdf
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    processing · 94%
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated">
                <motion.div
                  initial={{ width: reduce ? '94%' : 0 }}
                  whileInView={{ width: '94%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          </Tile>

          {/* Exam Rescue Mode — wide (7) */}
          <Tile index={3} className="md:col-span-7">
            <div className="flex h-full flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex-1">
                <TileHeader
                  icon={Zap}
                  color="var(--exam)"
                  title="Exam Rescue Mode"
                  body="Cramming with a deadline? The agent triages only what stands between you and a pass."
                />
              </div>
              <div className="grid shrink-0 place-items-center">
                <RescueRing />
              </div>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  )
}

function RescueRing() {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const pct = 80
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="8"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--exam)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: circumference * (1 - pct / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ color: 'var(--exam)' }}>
          80%
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          Ready to Pass
        </span>
      </div>
    </div>
  )
}
