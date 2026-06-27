'use client'

import { useRef } from 'react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { ArrowRight, Check, Lock } from 'lucide-react'
import { NeuralCanvas } from '@/components/neural-canvas'
import { RunawayButton } from '@/components/runaway-button'

const HEADLINE =
  "The AI that knows when you\u2019re confused — and re-teaches until you\u2019re not."

const NODES = [
  {
    state: 'mastered',
    title: 'Foundations of ML',
    meta: '100% COMPLETE',
    progress: 100,
    z: 30,
    offset: '-translate-x-2',
  },
  {
    state: 'learning',
    title: 'Neural Networks',
    meta: 'In Progress · 45m left',
    progress: 45,
    z: 70,
    offset: 'translate-x-6',
  },
  {
    state: 'locked',
    title: 'Natural Language Processing',
    meta: 'LOCKED',
    progress: 0,
    z: 20,
    offset: 'translate-x-1',
  },
] as const

export function Hero() {
  const reduce = useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()

  // Parallax: canvas slow (0.3x), text mid (0.6x via negative offset)
  const canvasY = useTransform(scrollY, [0, 800], [0, 240])
  const textY = useTransform(scrollY, [0, 800], [0, 120])

  const words = HEADLINE.split(' ')

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-16"
    >
      {/* Interactive neural network background */}
      <motion.div
        aria-hidden
        style={{ y: reduce ? 0 : canvasY }}
        className="absolute inset-0 -z-20"
      >
        <NeuralCanvas />
      </motion.div>
      {/* gradient fade to background at bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,transparent_40%,var(--background)_92%)]"
      />

      <motion.div
        style={{ y: reduce ? 0 : textY }}
        className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10"
      >
        {/* Left: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 font-mono text-xs text-muted-foreground backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            LangGraph · GPT-4o · Pinecone RAG
          </motion.div>

          <h1 className="text-balance text-[clamp(2.75rem,6vw,6rem)] font-black leading-[0.98] tracking-[-0.03em]">
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={reduce ? false : { opacity: 0, filter: 'blur(8px)', y: '0.3em' }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                transition={{
                  delay: 0.15 + i * 0.06,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
              >
                {word === 'confused' || word === 'not.' ? (
                  <span className="text-primary">{word}</span>
                ) : (
                  word
                )}
                {i < words.length - 1 ? '\u00A0' : ''}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 max-w-[60ch] text-lg leading-relaxed text-muted-foreground"
          >
            An adaptive tutor that watches your mastery signal in real time, detects
            confusion the moment it appears, and loops through fresh explanations until
            the concept finally clicks.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="#"
              className="group inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-hover"
            >
              Start Learning Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center rounded-lg border border-border bg-surface/60 px-5 py-3 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-surface"
            >
              Log In
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="mt-6"
          >
            <RunawayButton />
          </motion.div>
        </div>

        {/* Right: 3D roadmap (desktop only) */}
        <Roadmap />
      </motion.div>
    </section>
  )
}

function Roadmap() {
  const reduce = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, { stiffness: 120, damping: 16 })
  const rotateY = useSpring(0, { stiffness: 120, damping: 16 })

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !wrapRef.current) return
    const r = wrapRef.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    rotateY.set((px - 0.5) * 16)
    rotateX.set((0.5 - py) * 16)
  }
  const reset = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:block"
      style={{ perspective: 1300 }}
    >
      <motion.div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative flex flex-col gap-4"
      >
        {/* connecting line green -> amber -> gray */}
        <div
          aria-hidden
          className="absolute left-6 top-10 bottom-10 w-px bg-[linear-gradient(to_bottom,var(--success),var(--warning),var(--border))]"
          style={{ transform: 'translateZ(10px)' }}
        />
        {NODES.map((node, i) => (
          <RoadmapNode key={node.title} node={node} index={i} />
        ))}
      </motion.div>
    </motion.div>
  )
}

function RoadmapNode({
  node,
  index,
}: {
  node: (typeof NODES)[number]
  index: number
}) {
  const isMastered = node.state === 'mastered'
  const isLearning = node.state === 'learning'
  const isLocked = node.state === 'locked'

  const border = isMastered
    ? 'border-success/50'
    : isLearning
      ? 'border-warning/60'
      : 'border-border'

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ transform: `translateZ(${node.z}px)` }}
      className={`relative ml-1 rounded-xl border bg-elevated/90 p-4 backdrop-blur ${border} ${node.offset} ${
        isLearning ? 'shadow-xl shadow-warning/20' : 'shadow-lg shadow-black/10'
      } ${isLocked ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${
            isMastered
              ? 'border-success/40 bg-success/10 text-success'
              : isLearning
                ? 'border-warning/40 bg-warning/10 text-warning'
                : 'border-border bg-surface text-muted-foreground'
          }`}
        >
          {isMastered ? (
            <Check className="h-4 w-4" />
          ) : isLocked ? (
            <Lock className="h-4 w-4" />
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-warning" />
            </span>
          )}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{node.title}</div>
          <div
            className={`font-mono text-[11px] ${
              isMastered
                ? 'text-success'
                : isLearning
                  ? 'text-warning'
                  : 'text-muted-foreground'
            }`}
          >
            {node.meta}
          </div>
        </div>
      </div>
      {!isLocked && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${node.progress}%` }}
            transition={{ delay: 0.7 + index * 0.12, duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${isMastered ? 'bg-success' : 'bg-warning'}`}
          />
        </div>
      )}
    </motion.div>
  )
}
