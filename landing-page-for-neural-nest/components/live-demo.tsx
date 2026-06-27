'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Loader2, RotateCcw, Sparkles } from 'lucide-react'

type State = 'input' | 'generating' | 'result'

const RESULTS = [
  { n: '7', title: 'Core Modules', desc: 'Foundational theory mapped.' },
  { n: '3', title: 'Mastery Exams', desc: 'Adaptive checkpoints.' },
  { n: '12', title: 'Interactive Quizzes', desc: 'Real-time validation.' },
]

export function LiveDemo() {
  const [state, setState] = useState<State>('input')
  const [topic, setTopic] = useState('')
  const [submitted, setSubmitted] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = topic.trim() || 'Advanced Thermodynamics'
    setSubmitted(value)
    setState('generating')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('result'), 2000)
  }

  const reset = () => {
    if (timer.current) clearTimeout(timer.current)
    setState('input')
    setTopic('')
  }

  return (
    <section id="demo" className="relative py-24">
      <div className="mx-auto max-w-4xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Intelligence that adapts.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Type any subject and watch NeuralNest synthesize a full cognitive map in
            seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-2xl shadow-black/10 backdrop-blur-xl"
        >
          {/* macOS chrome */}
          <div className="flex items-center gap-2 border-b border-border bg-elevated/60 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-xs text-muted-foreground">
              neuralnest — cognitive-map
            </span>
          </div>

          <div className="relative min-h-[300px] p-6 sm:p-10">
            <AnimatePresence mode="wait">
              {state === 'input' && (
                <motion.form
                  key="input"
                  onSubmit={submit}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                  className="flex min-h-[238px] flex-col items-center justify-center"
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                  <p className="mt-4 text-center text-base text-muted-foreground">
                    What do you want to master today?
                  </p>
                  <div className="mt-6 flex w-full max-w-lg items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 focus-within:border-primary">
                    <input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Advanced Thermodynamics, React Hooks..."
                      aria-label="Topic to learn"
                      className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    />
                    <button
                      type="submit"
                      aria-label="Generate cognitive map"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-hover"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.form>
              )}

              {state === 'generating' && (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.97 }}
                  transition={{ duration: 0.4 }}
                  className="flex min-h-[238px] flex-col items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-5 font-mono text-sm text-muted-foreground">
                    Synthesizing cognitive map for{' '}
                    <span className="text-foreground">&apos;{submitted}&apos;</span>...
                  </p>
                </motion.div>
              )}

              {state === 'result' && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, filter: 'blur(8px)' }}
                  transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                >
                  <h3 className="text-2xl font-bold tracking-tight">{submitted}</h3>
                  <p className="mt-1 font-mono text-xs text-success">
                    cognitive map ready
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {RESULTS.map((r, i) => (
                      <motion.div
                        key={r.title}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                        className="rounded-xl border border-border bg-elevated p-4"
                      >
                        <div className="font-mono text-2xl font-bold text-primary">
                          {r.n}
                        </div>
                        <div className="mt-1 text-sm font-semibold">{r.title}</div>
                        <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {r.desc}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <a
                      href="#"
                      className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                    >
                      Start Learning This
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset Demo
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
