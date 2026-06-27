import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

/*
  PinnedAgentGraph — single-line scroll animation
  ────────────────────────────────────────────────
  One continuous SVG path traces the complete journey:

    __start__ → router → tutorNode → gradeNode
      → (arc: CONFUSED, loops back) → tutorNode
      → gradeNode → (UNDERSTOOD) → END

  Light mode: black line    Dark mode: white line
  Nodes fade in as the line reaches them.
  Ghost lines show the full graph structure at low opacity.
*/

// ── ViewBox constants ────────────────────────────────────────────────────────
const W = 1100;
const H = 420;
const pct = (v, total) => `${(v / total) * 100}%`;

// ── Node centres (viewBox px) ────────────────────────────────────────────────
const N = {
  start:   { x: 80,   y: 210 },
  router:  { x: 250,  y: 210 },
  tutor:   { x: 440,  y: 210 },
  grade:   { x: 630,  y: 210 },
  end:     { x: 1055, y: 155 },
  quiz:    { x: 440,  y: 90  },
  endQ:    { x: 630,  y: 90  },
  doubt:   { x: 440,  y: 330 },
  endD:    { x: 630,  y: 330 },
};

// ── Grade output chip anchors ────────────────────────────────────────────────
const CX = 790; // chip left edge
const CY = { understood: 155, confused: 210, partial: 255, doubt: 295 };

/*
  Full journey path (single continuous):
  1. __start__ → router → tutorNode → gradeNode  (straight)
  2. Cubic arc dipping below → back to tutorNode  (CONFUSED loop)
  3. Quadratic curve slightly above → gradeNode   (2nd pass, distinct from 1st)
  4. gradeNode → UNDERSTOOD chip level → END
*/
const JOURNEY = [
  `M ${N.start.x} ${N.start.y}`,
  `L ${N.router.x} ${N.router.y}`,
  `L ${N.tutor.x} ${N.tutor.y}`,
  `L ${N.grade.x} ${N.grade.y}`,
  // loop arc: grade → dip below → tutorNode
  `C 665 270, 455 270, ${N.tutor.x} ${N.tutor.y}`,
  // 2nd pass: tutorNode → gradeNode, curves slightly above (y≈203 vs y=210)
  `Q 535 200, ${N.grade.x} 203`,
  // grade → UNDERSTOOD level → END
  `L ${CX} ${CY.understood}`,
  `L ${N.end.x} ${N.end.y}`,
].join(' ');

// ── Positioning helpers ──────────────────────────────────────────────────────
const pos     = (x, y) => ({ left: pct(x, W), top: pct(y, H), transform: 'translate(-50%, -50%)' });
const posLeft = (x, y) => ({ left: pct(x, W), top: pct(y, H), transform: 'translateY(-50%)' });
const PILL = 'absolute font-mono text-[11px] tracking-wide rounded-xl border px-4 py-2.5 select-none whitespace-nowrap';

const PinnedAgentGraph = () => {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ── Header ──────────────────────────────────────────────────────────────────
  const headerOp = useTransform(scrollYProgress, [0, 0.08, 0.18], [0, 1, 1]);
  const headerY  = useTransform(scrollYProgress, [0, 0.10], [30, 0]);

  // ── Graph shell ─────────────────────────────────────────────────────────────
  const graphOp  = useTransform(scrollYProgress, [0.04, 0.18], [0, 1]);

  /*
    THE LINE — single strokeDashoffset 1→0 over scroll [0.05, 0.95]
    This drives the entire drawing animation.

    Path length proportions (approximate):
      __start__ → router       ≈ 12%   → router visible at scroll ~0.16
      router → tutorNode       ≈ 25%   → tutor visible at scroll ~0.27
      tutorNode → gradeNode    ≈ 38%   → grade visible at scroll ~0.39
      loop arc back to tutor   ≈ 57%   → confused shown at scroll ~0.56
      tutorNode → gradeNode    ≈ 70%   → grade again at scroll ~0.68
      gradeNode → UNDERSTOOD   ≈ 82%   → understood at scroll ~0.79
      UNDERSTOOD → END         ≈ 100%  → end at scroll ~0.95
  */
  const lineOffset = useTransform(scrollYProgress, [0.05, 0.95], [1, 0]);

  // ── Node fade-ins (keyed to when line reaches each node) ───────────────────
  const routerOp     = useTransform(scrollYProgress, [0.13, 0.21], [0, 1]);
  const sidesOp      = useTransform(scrollYProgress, [0.18, 0.26], [0, 1]);
  const tutorOp      = useTransform(scrollYProgress, [0.24, 0.32], [0, 1]);
  const gradeOp      = useTransform(scrollYProgress, [0.36, 0.44], [0, 1]);
  const confusedOp   = useTransform(scrollYProgress, [0.46, 0.54], [0, 1]);
  const iter1Op      = useTransform(scrollYProgress, [0.48, 0.56], [0, 1]);
  const understoodOp = useTransform(scrollYProgress, [0.76, 0.84], [0, 1]);
  const iter2Op      = useTransform(scrollYProgress, [0.78, 0.86], [0, 1]);
  const endOp        = useTransform(scrollYProgress, [0.88, 0.96], [0, 1]);
  const scrollHint   = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // ── Reduced-motion fallback ─────────────────────────────────────────────────
  if (reduceMotion) {
    return (
      <section className="py-24 px-6 bg-white dark:bg-[#060A12] text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">LangGraph Agent Architecture</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-10">The reasoning engine, step by step.</p>
        <div className="flex flex-col items-center gap-3 font-mono text-sm">
          {['__start__', 'router', 'tutorNode', 'gradeNode (CONFUSED)', 'tutorNode', 'gradeNode (UNDERSTOOD)', 'END'].map((n, i) => (
            <div key={i} className="px-5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white">{n}</div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="h-[580vh] relative bg-white dark:bg-[#060A12] z-20">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center bg-white dark:bg-[#060A12]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <motion.div
          style={{ opacity: headerOp, y: headerY }}
          className="absolute top-[9%] text-center px-6 pointer-events-none w-full"
        >
          <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Powered by <span className="text-[#3B6BFF]">LangGraph</span>.
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base md:text-lg">
            Watch the multi-agent loop classify your understanding and adapt the lesson in real time.
          </p>
        </motion.div>

        {/* ── Graph canvas ────────────────────────────────────────────────── */}
        <motion.div
          style={{
            opacity: graphOp,
            width:   'min(1100px, 96vw)',
            height:  'min(420px, 40vw)',
          }}
          className="relative mt-16 md:mt-20"
        >
          {/*
            SVG rendered FIRST → always visually behind HTML node labels.
            Uses currentColor:
              light mode parent text-slate-900  → black line
              dark  mode parent dark:text-white → white line
          */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none text-slate-900 dark:text-white"
            style={{ zIndex: 0 }}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* ── Ghost skeleton ─────────────────────────────────────────── */}

            {/* Main spine */}
            <path d={`M ${N.start.x} ${N.start.y} L ${N.grade.x} ${N.grade.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>

            {/* Loop arc */}
            <path d={`M ${N.grade.x} ${N.grade.y} C 665 270, 455 270, ${N.tutor.x} ${N.tutor.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.35"/>

            {/* 2nd tutorNode → gradeNode */}
            <path d={`M ${N.tutor.x} ${N.tutor.y} Q 535 200 ${N.grade.x} 203`}
              fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>

            {/* gradeNode → UNDERSTOOD → END */}
            <path d={`M ${N.grade.x} 203 L ${CX} ${CY.understood} L ${N.end.x} ${N.end.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35"/>

            {/* Side branches (dashed) */}
            <path d={`M ${N.router.x} ${N.router.y} C ${N.router.x+60} ${N.router.y}, ${N.quiz.x-60} ${N.quiz.y}, ${N.quiz.x} ${N.quiz.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25"/>
            <path d={`M ${N.quiz.x} ${N.quiz.y} L ${N.endQ.x} ${N.endQ.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25"/>
            <path d={`M ${N.router.x} ${N.router.y} C ${N.router.x+60} ${N.router.y}, ${N.doubt.x-60} ${N.doubt.y}, ${N.doubt.x} ${N.doubt.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25"/>
            <path d={`M ${N.doubt.x} ${N.doubt.y} L ${N.endD.x} ${N.endD.y}`}
              fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25"/>

            {/* Grade → chip dashes */}
            <path d={`M ${N.grade.x} ${N.grade.y} L ${CX} ${CY.confused}`}
              fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25"/>
            <path d={`M ${N.grade.x} ${N.grade.y} L ${CX} ${CY.partial}`}
              fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25"/>
            <path d={`M ${N.grade.x} ${N.grade.y} L ${CX} ${CY.doubt}`}
              fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.25"/>

            {/* ── THE JOURNEY LINE ───────────────────────────────────────────
                Single path. Black in light mode, white in dark mode.
                strokeDashoffset 1→0 draws the line from start to end.
            ── */}
            <motion.path
              d={JOURNEY}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray="1"
              style={{ strokeDashoffset: lineOffset }}
            />
          </svg>

          {/* ── HTML node labels — all fully opaque, always visible ─────────
              Wrapped in z-index:1 so lines always render behind nodes.
          ── */}
          <div className="absolute inset-0" style={{ zIndex: 1, pointerEvents: 'none' }}>

          {/* __start__ */}
          <div
            className={`${PILL} border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0D1220]`}
            style={pos(N.start.x, N.start.y)}
          >
            __start__
          </div>

          {/* router — solid opaque background so line is hidden behind */}
          <div
            className={`${PILL} border-[#3B6BFF]/50 text-[#3B6BFF] bg-[#EEF2FF] dark:bg-[#0c1530]`}
            style={pos(N.router.x, N.router.y)}
          >
            router
          </div>

          {/* tutorNode */}
          <div
            className={`${PILL} border-[#F59E0B]/50 text-[#F59E0B] bg-[#FFFBEB] dark:bg-[#1a1206]`}
            style={pos(N.tutor.x, N.tutor.y)}
          >
            tutorNode
          </div>

          {/* gradeNode */}
          <div
            className={`${PILL} border-[#10B981]/50 text-[#10B981] bg-[#ECFDF5] dark:bg-[#06180f]`}
            style={pos(N.grade.x, N.grade.y)}
          >
            gradeNode
          </div>

          {/* END */}
          <div
            className={`${PILL} border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-300 bg-white dark:bg-[#0D1220]`}
            style={pos(N.end.x, N.end.y)}
          >
            END
          </div>

          {/* ── Side-branch nodes — solid backgrounds ─────────────────── */}
          <div className={`${PILL} border-[#3B82F6]/30 text-[#3B82F6]/60 bg-slate-50 dark:bg-[#0D1220]`} style={pos(N.quiz.x, N.quiz.y)}>
            quizGeneratorNode
          </div>
          <div className={`${PILL} border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D1220]`} style={pos(N.endQ.x, N.endQ.y)}>
            END
          </div>
          <div className={`${PILL} border-[#A855F7]/30 text-[#A855F7]/60 bg-slate-50 dark:bg-[#0D1220]`} style={pos(N.doubt.x, N.doubt.y)}>
            doubtNode
          </div>
          <div className={`${PILL} border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-[#0D1220]`} style={pos(N.endD.x, N.endD.y)}>
            END
          </div>

          {/* ── Grade output chips — solid opaque backgrounds ──────────── */}

          {/* CONFUSED */}
          <div
            style={posLeft(CX, CY.confused)}
            className="absolute font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#EF4444]/60 bg-[#fef2f2] dark:bg-[#1c0505] text-[#EF4444] whitespace-nowrap"
          >
            CONFUSED → tutorNode
          </div>

          {/* UNDERSTOOD */}
          <div
            style={posLeft(CX, CY.understood)}
            className="absolute font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-[#10B981]/60 bg-[#f0fdf8] dark:bg-[#061510] text-[#10B981] whitespace-nowrap"
          >
            UNDERSTOOD → END ✓
          </div>

          {/* PARTIAL */}
          <div
            style={posLeft(CX, CY.partial)}
            className="absolute font-mono text-[10px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0D1220] whitespace-nowrap"
          >
            PARTIAL → tutorNode
          </div>

          {/* DOUBT */}
          <div
            style={posLeft(CX, CY.doubt)}
            className="absolute font-mono text-[10px] px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0D1220] whitespace-nowrap"
          >
            DOUBT → doubtNode → END
          </div>

          {/* ── Iteration badges ──────────────────────────────────────── */}
          <motion.div
            style={{
              position: 'absolute',
              left: pct(N.grade.x, W),
              top: pct(N.grade.y + 52, H),
              transform: 'translateX(-50%)',
              opacity: iter1Op,
            }}
            className="flex items-center gap-1.5 bg-white dark:bg-[#0D1220] border border-slate-300 dark:border-slate-600 rounded-full px-3 py-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse inline-block"/>
            <span className="font-mono text-[9px] text-slate-600 dark:text-slate-400">iteration 1 — CONFUSED</span>
          </motion.div>

          <motion.div
            style={{
              position: 'absolute',
              left: pct(N.grade.x, W),
              top: pct(N.grade.y + 76, H),
              transform: 'translateX(-50%)',
              opacity: iter2Op,
            }}
            className="flex items-center gap-1.5 bg-white dark:bg-[#0D1220] border border-[#10B981]/40 rounded-full px-3 py-1"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse inline-block"/>
            <span className="font-mono text-[9px] text-[#10B981]">iteration 2 — UNDERSTOOD ✓</span>
          </motion.div>

          </div>{/* end z-index:1 node wrapper */}

        </motion.div>

        {/* ── Scroll hint ───────────────────────────────────────────────── */}
        <motion.div
          style={{ opacity: scrollHint }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
          <span className="font-mono text-[9px] text-slate-400 dark:text-white/20 uppercase tracking-[3px] mb-2">scroll</span>
          <div className="w-px h-10 bg-[#3B6BFF]/30 relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 40] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-[#3B6BFF] absolute -left-[2.5px]"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default PinnedAgentGraph;
