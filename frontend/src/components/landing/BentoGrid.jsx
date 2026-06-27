import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Brain, MessageSquareText, Zap, CheckCircle2, UploadCloud, FileText, ShieldCheck } from 'lucide-react';

const BentoGrid = () => {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax breathing effect for odd/even cards
  const oddY = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const evenY = useTransform(scrollYProgress, [0, 1], [-30, 30]);

  // If mobile or reduced motion, disable the parallax
  const getTransform = (isOdd) => {
    if (reduceMotion || window.innerWidth < 768) return {};
    return { y: isOdd ? oddY : evenY };
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const cardBaseClasses = "bg-white dark:bg-[#121622] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col relative group shadow-sm hover:shadow-[inset_0_0_80px_rgba(59,107,255,0.05)] hover:border-primary/50 transition-all duration-500";

  return (
    <motion.section 
      ref={containerRef}
      id="features" 
      className="py-24 px-6 relative z-10 bg-slate-50 dark:bg-transparent"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">The ecosystem for mastery.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl">Stop jumping between PDFs, generic ChatGPT tabs, and flashcard apps. NeuralNest natively integrates every tool you need.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >

          {/* Feature 1: AI Tutor (Large - spans 7 cols) - ODD */}
          <motion.div variants={itemVariants} style={getTransform(true)} className={`md:col-span-7 ${cardBaseClasses}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="p-8 pb-0 z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mb-6">
                <MessageSquareText className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">AI Tutor — Ask Anything</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">Chat with an AI tutor that deeply understands your exact syllabus. It uses simple analogies tailored to your learning style.</p>
            </div>
            {/* Mini Preview UI */}
            <div className="mt-auto p-8 pt-10 z-10">
              <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-white/5 p-4 shadow-sm relative translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0" />
                  <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 text-sm text-slate-800 dark:text-slate-300 max-w-[80%]">
                    Can you explain Backpropagation like I'm 5?
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-none p-4 text-sm text-slate-800 dark:text-slate-200 max-w-[90%]">
                    <p className="mb-2">Imagine you're trying to throw a basketball into a hoop blindfolded.</p>
                    <p>1. You throw the ball (Forward Pass).<br />2. Your friend tells you "too far left" (Loss Calculation).<br />3. You adjust your aim for the next throw (Backpropagation!).</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Quizzes (Medium - spans 5 cols) - EVEN */}
          <motion.div variants={itemVariants} style={getTransform(false)} className={`md:col-span-5 ${cardBaseClasses}`}>
            <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
            <div className="p-8 z-10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Adaptive Quizzes</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Test your knowledge as you learn. Our AI generates strict multiple-choice questions to validate mastery.</p>
            </div>
            <div className="mt-auto px-8 pb-0 z-10">
              <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-t-2xl border border-slate-200 dark:border-white/5 border-b-0 p-5 shadow-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Which activation function suffers from the vanishing gradient problem?</p>
                <div className="space-y-2">
                  <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-400 flex items-center"><span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3 text-xs font-medium">A</span> ReLU</div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center"><span className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center mr-3 text-xs font-medium">B</span> Sigmoid <CheckCircle2 className="h-4 w-4 ml-auto" /></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 3: Materials (Medium - spans 5 cols) - ODD */}
          <motion.div variants={itemVariants} style={getTransform(true)} className={`md:col-span-5 ${cardBaseClasses}`}>
            <div className="p-8 z-10">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-6">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Universal Uploads</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Feed NeuralNest your exact curriculum. PDFs, Word docs, or YouTube links—it extracts the knowledge instantly.</p>
            </div>
            <div className="mt-auto px-8 pb-8 z-10">
              <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center space-x-4 shadow-sm dark:shadow-none group-hover:scale-105 transition-transform duration-500">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">CS_101_Syllabus.pdf</p>
                  <p className="text-xs text-slate-500">Processing... 94%</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Feature 4: Rescue Mode (Large - spans 7 cols) - EVEN */}
          <motion.div variants={itemVariants} style={getTransform(false)} className={`md:col-span-7 flex flex-col md:flex-row items-center ${cardBaseClasses}`}>
            <div className="p-8 md:w-1/2 z-10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Exam Rescue Mode</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Exam tomorrow? Upload your syllabus and enter Rescue Mode. We cut the fluff and give you a ruthless triage plan to pass.</p>
            </div>
            <div className="p-8 pt-0 md:pt-8 md:w-1/2 flex justify-center z-10">
              <div className="w-48 h-48 rounded-full flex items-center justify-center relative shadow-[0_0_50px_-10px_rgba(168,85,247,0.15)] dark:shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform duration-700 ease-out">
                <svg className="absolute inset-0 w-full h-full -rotate-90 overflow-visible" viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="100" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="8" />
                  <circle cx="96" cy="96" r="100" fill="none" stroke="#A855F7" strokeWidth="16" strokeDasharray="628.3" strokeDashoffset="125.6" strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">80%</span>
                  <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest mt-1">Ready to Pass</p>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </motion.section>
  );
};

export default BentoGrid;
