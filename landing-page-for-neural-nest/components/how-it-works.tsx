'use client'

import { motion } from 'motion/react'
import { FileUp, GraduationCap, LineChart } from 'lucide-react'

const STEPS = [
  {
    icon: FileUp,
    node: 'ingest',
    title: 'Upload your syllabus',
    body: 'Drop a PDF or doc. Pinecone RAG extracts every topic into a 1024-dim concept graph.',
  },
  {
    icon: GraduationCap,
    node: 'tutorNode',
    title: 'The agent teaches',
    body: 'GPT-4o explains a concept, watches your responses, and adapts depth on the fly.',
  },
  {
    icon: LineChart,
    node: 'gradeNode',
    title: 'Mastery is tracked',
    body: 'Every answer updates a weighted mastery score that decides what comes next.',
  },
]

const BRANCHES = [
  { label: 'UNDERSTOOD', target: '\u2192 END', color: 'text-success', dot: 'bg-success' },
  { label: 'CONFUSED', target: '\u2192 tutorNode (simpler)', color: 'text-warning', dot: 'bg-warning' },
  { label: 'PARTIAL', target: '\u2192 tutorNode (deeper)', color: 'text-warning', dot: 'bg-warning' },
  { label: 'DOUBT', target: '\u2192 doubtNode', color: 'text-primary', dot: 'bg-primary' },
]

export function HowItWorks() {
  return (
    <section id="progression" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h2 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            One loop, running until you get it
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            NeuralNest is a stateful graph, not a chatbot. Each turn flows through the
            same agentic pipeline and routes on your mastery signal.
          </p>
        </motion.div>

        {/* Pipeline steps */}
        <div className="relative mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* connecting line */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[42px] hidden h-px bg-border md:block"
          />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.node}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-2xl border border-border bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-elevated">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="rounded-md bg-elevated px-2 py-1 font-mono text-xs text-muted-foreground">
                  {step.node}()
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

        {/* LangGraph execution path */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mt-6 rounded-2xl border border-border bg-surface p-6 sm:p-8"
        >
          <div className="mb-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            execution path
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-sm">
            <span className="rounded-lg border border-border bg-elevated px-3 py-1.5 text-muted-foreground">
              __start__
            </span>
            <Arrow />
            <span className="rounded-lg border border-border bg-elevated px-3 py-1.5 text-agent-router">
              router
            </span>
            <Arrow />
            <span className="rounded-lg border border-border bg-elevated px-3 py-1.5 text-agent-tutor">
              tutorNode
            </span>
            <Arrow />
            <span className="rounded-lg border border-border bg-elevated px-3 py-1.5 text-agent-grade">
              gradeNode
            </span>
            <Arrow />
            <span className="text-muted-foreground">branch on outcome</span>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BRANCHES.map((b, i) => (
              <motion.div
                key={b.label}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                className="rounded-xl border border-border bg-elevated p-4"
              >
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${b.dot}`} />
                  <span className={`font-mono text-sm font-semibold ${b.color}`}>
                    {b.label}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {b.target}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Arrow() {
  return <span className="text-muted-foreground">{'\u2192'}</span>
}
