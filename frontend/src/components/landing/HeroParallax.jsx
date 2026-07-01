import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { MagneticNode } from './MagneticNode';

const GRADES = [
  {
    label: 'UNDERSTOOD ✓',
    bgClass: 'bg-[#D1FAE5] dark:bg-[#10B981]/15',
    textClass: 'text-[#059669] dark:text-[#10B981]',
    borderClass: 'border-[#10B981]/30 dark:border-[#10B981]/30',
    note: 'Advancing curriculum →'
  },
  {
    label: 'REVIEWING ↻',
    bgClass: 'bg-[#FEF3C7] dark:bg-[#F59E0B]/15',
    textClass: 'text-[#D97706] dark:text-[#F59E0B]',
    borderClass: 'border-[#F59E0B]/30 dark:border-[#F59E0B]/30',
    note: 'Re-teaching concept →'
  },
  {
    label: 'MASTERED ★',
    bgClass: 'bg-[#DBEAFE] dark:bg-[#3B82F6]/15',
    textClass: 'text-[#1D4ED8] dark:text-[#3B82F6]',
    borderClass: 'border-[#3B82F6]/30 dark:border-[#3B82F6]/30',
    note: 'Next topic unlocked →'
  },
];
const WORDS = ['Master', 'Crush', 'Ace', 'Own'];

const HeroParallax = () => {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end top'],
  });

  // Parallax layers
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const cardBY = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const cardBRotate = useTransform(scrollYProgress, [0, 1], [2, 10]);
  const cardCY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const fgY = useTransform(scrollYProgress, [0, 0.4], ['0%', '-8%']);

  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Live state animation
  const [progress, setProgress] = useState(73);
  const [gradeIdx, setGradeIdx] = useState(0);
  const [morphIdx, setMorphIdx] = useState(0);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev >= 91 ? 67 : prev + 1));
    }, 180);

    const gradeInterval = setInterval(() => {
      setGradeIdx((prev) => (prev + 1) % GRADES.length);
    }, 3200);

    const morphInterval = setInterval(() => {
      setMorphIdx((prev) => (prev + 1) % WORDS.length);
    }, 2600);

    return () => {
      clearInterval(progressInterval);
      clearInterval(gradeInterval);
      clearInterval(morphInterval);
    };
  }, []);

  // Circle progress calculation: r = 28 -> circumference is ~175.93
  const circ = 175.93;
  const strokeDashoffset = circ * (1 - progress / 100);

  const currentGrade = GRADES[gradeIdx];

  const headline = 'Study Smarter. Master Faster. Ace Every Exam.';
  const words = headline.split(' ');

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen pt-20 pb-20 overflow-hidden flex flex-col z-10 bg-transparent"
    >
      {/* LAYER 1 — Background canvas removed so global dotted lines show through */}

      <div className="relative w-full flex-grow flex flex-col justify-center">

        {/* LAYER 2 — Floating cards */}

        {/* Card B: Mastery ring */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={reduceMotion ? {} : { y: cardBY, rotate: cardBRotate }}
          className="hidden xl:flex flex-col items-center absolute top-[8%] left-[9%] z-10 dark:backdrop-blur-md bg-white/95 dark:bg-white/5 border border-[#EAE8E1] dark:border-white/10 rounded-2xl p-7 shadow-xl min-w-[220px]"
        >
          <span className="text-[12px] text-[#9CA3AF] font-bold tracking-[0.8px] mb-3">TOPIC MASTERY</span>
          <div className="relative w-24 h-24 mb-3 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="28" fill="none" stroke="#e2e8f0" className="dark:stroke-white/10" strokeWidth="3" />
              <motion.circle
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.18, ease: 'linear' }}
                cx="30" cy="30" r="28" fill="none"
                stroke="#3B82F6" strokeWidth="3" strokeLinecap="round"
                strokeDasharray="176 176"
              />
            </svg>
            <span className="font-extrabold text-xl text-[#1a1a2e] dark:text-white">{progress}%</span>
          </div>
          <span className="text-[13.5px] text-[#555555] dark:text-[#a3a3a3] font-semibold text-center leading-snug">Round Robin Scheduling</span>
          <div className="mt-2.5 px-3 py-1 bg-[#D1FAE5] dark:bg-emerald-500/10 text-[#065F46] dark:text-emerald-400 text-[11px] font-extrabold rounded-full tracking-[0.5px]">MASTERED</div>
        </motion.div>

        {/* Card C: GRADE_NODE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          style={reduceMotion ? {} : { y: cardCY }}
          className="hidden xl:block absolute top-[52%] right-[8%] z-10 dark:backdrop-blur-md bg-white/95 dark:bg-white/5 border border-[#EAE8E1] dark:border-white/10 rounded-2xl p-7 shadow-xl min-w-[290px]"
        >
          <div className="text-[13px] text-[#F59E0B] mb-2.5 font-extrabold tracking-[0.8px]">GRADE_NODE</div>
          <div className="h-px w-full bg-slate-200 dark:bg-white/10 mb-3" />
          <div className="text-[14px] text-[#777777] dark:text-white/50 mb-2">Response classified:</div>

          <AnimatePresence mode="wait">
            <motion.div
              key={gradeIdx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="space-y-2.5"
            >
              <div className={`px-4 py-2 rounded-lg border ${currentGrade.borderClass} ${currentGrade.bgClass} ${currentGrade.textClass} font-extrabold text-[15px] inline-block`}>
                {currentGrade.label}
              </div>
              <div className="text-[14px] text-[#555555] dark:text-white/70 font-medium">
                {currentGrade.note}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* LAYER 3 — Foreground hero text (centred) */}
        <div className="relative z-20 w-full max-w-4xl mx-auto px-6 flex flex-col items-center justify-center h-full">
          <motion.div
            style={reduceMotion ? {} : { y: fgY }}
            className="w-full flex flex-col items-center text-center"
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#333333] dark:text-white leading-tight flex flex-wrap justify-center">
              {words.map((word, idx) => {
                const isMaster = word === 'Master';
                if (isMaster) {
                  return (
                    <span
                      key={idx}
                      className="mr-3 relative inline-block text-primary text-left min-w-[4rem] sm:min-w-[5rem] md:min-w-[6.4rem] lg:min-w-[7.6rem]"
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={morphIdx}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="inline-block"
                        >
                          {WORDS[morphIdx]}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  );
                }
                return (
                  <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + idx * 0.07, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mr-3"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-6 text-lg text-[#4A4A4A] dark:text-[#666666] max-w-2xl leading-relaxed"
            >
              NeuralNest turns your syllabus into personalized roadmaps and AI-powered quizzes. Study smarter, not harder.
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
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </MagneticNode>
              <MagneticNode>
                <button className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-white/5 border border-[#EAE8E1] dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 text-[#333333] dark:text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm backdrop-blur-sm">
                  <Play className="h-4 w-4 text-[#555555] dark:text-[#666666]" />
                  <span>Watch Demo</span>
                </button>
              </MagneticNode>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: indicatorOpacity }}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none"
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
