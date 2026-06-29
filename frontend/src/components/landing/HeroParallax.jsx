import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import InteractiveNeuralCanvas from './InteractiveNeuralCanvas';
import { MagneticNode } from './MagneticNode';

const HeroParallax = () => {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end top'],
  });

  // Parallax layers
  const bgY       = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const cardAY    = useTransform(scrollYProgress, [0, 1], ['0%', '-25%']);
  const cardARotate = useTransform(scrollYProgress, [0, 1], [-2, -8]);
  const cardBY    = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const cardBRotate = useTransform(scrollYProgress, [0, 1], [2, 10]);
  const cardCY    = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const fgY       = useTransform(scrollYProgress, [0, 0.4], ['0%', '-8%']);

  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  const headline = 'Study Smarter. Master Faster. Ace Every Exam.';
  const words = headline.split(' ');

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen pt-20 pb-20 overflow-hidden flex flex-col z-10 perspective-[1000px] bg-transparent"
    >
      {/* LAYER 1 — Background canvas */}
      <motion.div
        style={reduceMotion ? {} : { y: bgY, opacity: bgOpacity }}
        className="absolute inset-0 z-0"
      >
        <InteractiveNeuralCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F6F5F1] dark:to-[#181818]" />
      </motion.div>

      <div className="relative w-full flex-grow flex flex-col justify-center">

        {/* LAYER 2 — Floating cards */}

        {/* Card A: Router → tutorNode beam */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={reduceMotion ? {} : { y: cardAY, rotate: cardARotate }}
          className="hidden xl:block absolute top-[12%] left-[3%] z-10 backdrop-blur-md bg-white/80 dark:bg-white/5 border border-[#EAE8E1] dark:border-white/10 rounded-xl px-4 py-3 shadow-lg"
        >
          <div className="flex items-center space-x-2">
            <div className="border border-[#3B6BFF]/30 px-2 py-1 rounded bg-[#3B6BFF]/5">
              <span className="font-mono text-[10px] text-[#3B6BFF]">router</span>
            </div>
            <div className="w-16 h-px bg-slate-300 dark:bg-white/10 relative">
              <motion.div
                animate={{ x: [0, 64] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-1.5 h-1.5 rounded-full bg-[#3B6BFF] absolute -top-[2.5px]"
              />
            </div>
            <div className="border border-[#8B5CF6]/30 px-2 py-1 rounded bg-[#8B5CF6]/5">
              <span className="font-mono text-[10px] text-[#8B5CF6]">tutorNode</span>
            </div>
          </div>
        </motion.div>

        {/* Card B: Mastery ring */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={reduceMotion ? {} : { y: cardBY, rotate: cardBRotate }}
          className="hidden xl:flex flex-col items-center absolute top-[8%] right-[4%] z-10 backdrop-blur-md bg-white/80 dark:bg-white/5 border border-[#EAE8E1] dark:border-white/10 rounded-xl p-4 shadow-lg"
        >
          <div className="relative w-14 h-14 mb-2 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="28" fill="none" stroke="#e2e8f0" className="dark:stroke-white/10" strokeWidth="3"/>
              <motion.circle
                initial={{ strokeDashoffset: 176 }}
                animate={{ strokeDashoffset: 63 }}
                transition={{ duration: 1.5, type: 'spring' }}
                cx="30" cy="30" r="28" fill="none"
                stroke="#10B981" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="176 176"
              />
            </svg>
            <span className="font-bold text-sm text-[#10B981]">73%</span>
          </div>
          <span className="text-[10px] text-[#555555] dark:text-[#666666] font-medium">Round Robin Scheduling</span>
          <div className="mt-1 px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] text-[9px] font-bold rounded-full">MASTERED</div>
        </motion.div>

        {/* Card C: GRADE_NODE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          style={reduceMotion ? {} : { y: cardCY }}
          className="hidden xl:block absolute top-[35%] right-[8%] z-10 backdrop-blur-md bg-white/80 dark:bg-white/5 border border-[#EAE8E1] dark:border-white/10 rounded-xl p-4 shadow-lg min-w-[200px]"
        >
          <div className="font-mono text-[9px] text-[#FBBF24] mb-2">GRADE_NODE</div>
          <div className="h-px w-full bg-slate-200 dark:bg-white/10 mb-2"/>
          <div className="text-[10px] text-[#555555] dark:text-white/50 mb-1">Response classified:</div>
          <div className="px-3.5 py-1.5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/15 text-[#10B981] font-mono font-bold text-[12px] mb-2 inline-block">
            UNDERSTOOD ✓
          </div>
          <div className="text-[10px] text-[#666666] dark:text-white/40">Advancing curriculum →</div>
        </motion.div>

        {/* LAYER 3 — Foreground hero text (centred) */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center h-full">
          <motion.div
            style={reduceMotion ? {} : { y: fgY }}
            className="w-full flex flex-col items-center text-center"
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#333333] dark:text-white leading-tight flex flex-wrap justify-center">
              {words.map((word, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.07, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`mr-3 ${word.includes('Master') ? 'text-primary' : ''}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-6 text-lg text-[#4A4A4A] dark:text-[#666666] max-w-2xl leading-relaxed"
            >
              NeuralNest is an AI tutor that builds personalized roadmaps and adaptive quizzes from your syllabus. Stop studying blindly—let the AI show you exactly what you need to know.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <MagneticNode>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(59,107,255,0.4)] hover:shadow-[0_0_40px_-5px_rgba(59,107,255,0.6)] flex items-center justify-center space-x-2"
                >
                  <span>Start Learning Free</span>
                  <ArrowRight className="h-4 w-4"/>
                </Link>
              </MagneticNode>
              <MagneticNode>
                <button className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-white/5 border border-[#EAE8E1] dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-[#333333] dark:text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm backdrop-blur-sm">
                  <Play className="h-4 w-4 text-[#555555] dark:text-[#666666]"/>
                  <span>Watch Demo</span>
                </button>
              </MagneticNode>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
        >
          <span className="font-mono text-[9px] text-[#666666] dark:text-white/30 uppercase tracking-[3px] mb-2">scroll</span>
          <div className="w-px h-12 bg-primary/40 relative overflow-hidden">
            <motion.div
              animate={{ y: [0, 48] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              className="w-1.5 h-1.5 rounded-full bg-primary absolute -left-[2.5px]"
            />
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroParallax;
