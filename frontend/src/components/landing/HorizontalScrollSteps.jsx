import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { FileText, Brain, Target, BookOpen } from 'lucide-react';

const HorizontalScrollSteps = () => {
  const containerRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Translate the track horizontally
  const xTransform = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);

  if (isMobile || reduceMotion) {
    return (
      <section className="py-24 px-6 bg-transparent relative z-10 space-y-16">
        <div className="text-center">
          <h2 className="font-display text-3xl font-extrabold text-[#333333] dark:text-white">How it works</h2>
        </div>
        
        {/* Panel 1 */}
        <div className="bg-slate-50 dark:bg-[#121622] rounded-3xl p-8 border border-slate-200 dark:border-white/5">
          <h3 className="text-2xl font-bold mb-4">1. Upload Syllabus</h3>
          <div className="flex flex-wrap gap-2 mt-6">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full">Week 1: Thermodynamics</span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs rounded-full">Week 2: Entropy</span>
          </div>
        </div>

        {/* Panel 2 */}
        <div className="bg-slate-50 dark:bg-[#121622] rounded-3xl p-8 border border-slate-200 dark:border-white/5">
          <h3 className="text-2xl font-bold mb-4">2. AI Tutor Loop</h3>
          <p className="text-[#4A4A4A] dark:text-slate-400">Agents build dynamic cognitive maps.</p>
        </div>

        {/* Panel 3 */}
        <div className="bg-slate-50 dark:bg-[#121622] rounded-3xl p-8 border border-slate-200 dark:border-white/5">
          <h3 className="text-2xl font-bold mb-4">3. Master the material</h3>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold mb-1">Quiz Progress</div>
              <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full"><div className="h-full bg-emerald-500 rounded-full w-[80%]" /></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="h-[300vh] relative bg-transparent">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
        
        <motion.div style={{ x: xTransform }} className="flex h-full w-[300vw]">
          
          {/* Panel 1: Syllabus Upload */}
          <div className="w-[100vw] h-full flex flex-col md:flex-row items-center justify-center p-12 md:p-24 relative">
            <div className="w-full md:w-1/2 pr-8">
              <div className="inline-block text-xs font-bold tracking-widest text-primary mb-4 uppercase">Step 01</div>
              <h2 className="font-display text-5xl font-extrabold text-[#333333] dark:text-white mb-6">Upload your syllabus.</h2>
              <p className="text-xl text-[#4A4A4A] dark:text-slate-400 max-w-md leading-relaxed">
                NeuralNest extracts every topic, due date, and reading assignment directly from your course materials.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center mt-12 md:mt-0 relative">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
              <div className="relative z-10 w-[80%] max-w-sm bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-bold text-[#333333] dark:text-white">PHYS_201_Syllabus.pdf</div>
                    <div className="text-xs text-slate-500">Processing...</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold rounded-full">Thermodynamics</div>
                    <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-full">Entropy</div>
                  </div>
                  <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Panel 2: Agent Loop */}
          <div className="w-[100vw] h-full flex flex-col md:flex-row items-center justify-center p-12 md:p-24 relative bg-transparent">
            <div className="w-full md:w-1/2 pr-8">
              <div className="inline-block text-xs font-bold tracking-widest text-amber-500 mb-4 uppercase">Step 02</div>
              <h2 className="font-display text-5xl font-extrabold text-[#333333] dark:text-white mb-6">Agents build your map.</h2>
              <p className="text-xl text-[#4A4A4A] dark:text-slate-400 max-w-md leading-relaxed">
                Our multi-agent system constructs a dynamic cognitive map, identifying dependencies and pre-requisite knowledge gaps.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center mt-12 md:mt-0 relative h-full">
              {/* Mini animated loop */}
              <div className="relative w-64 h-64 border-2 border-dashed border-amber-500/30 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <div className="absolute top-[-16px] left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                  <Brain className="h-4 w-4 text-white -rotate-90" />
                </div>
                <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,107,255,0.5)]">
                  <Target className="h-4 w-4 text-white -rotate-90" />
                </div>
              </div>
              <div className="absolute w-32 h-32 rounded-full bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-xl">
                <span className="text-xs font-bold font-mono">TUTOR_LOOP</span>
              </div>
            </div>
          </div>

          {/* Panel 3: Mastery Progress */}
          <div className="w-[100vw] h-full flex flex-col md:flex-row items-center justify-center p-12 md:p-24 relative">
            <div className="w-full md:w-1/2 pr-8">
              <div className="inline-block text-xs font-bold tracking-widest text-emerald-500 mb-4 uppercase">Step 03</div>
              <h2 className="font-display text-5xl font-extrabold text-[#333333] dark:text-white mb-6">Master the material.</h2>
              <p className="text-xl text-[#4A4A4A] dark:text-slate-400 max-w-md leading-relaxed">
                As you learn and pass adaptive quizzes, your mastery rating deterministically increases until you're ready for the exam.
              </p>
            </div>
            <div className="w-full md:w-1/2 flex items-center justify-center mt-12 md:mt-0 relative">
              <div className="w-[80%] max-w-md bg-white dark:bg-[#121622] border border-slate-200 dark:border-white/10 rounded-2xl p-8 shadow-2xl">
                
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[#333333] dark:text-white">Quiz Performance</span>
                    <span className="text-emerald-500">85%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[#333333] dark:text-white">Self Rating</span>
                    <span className="text-primary">92%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-[#333333] dark:text-white">Engagement</span>
                    <span className="text-amber-500">78%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "78%" }}
                      transition={{ duration: 1.5, delay: 0.9, ease: "easeOut" }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScrollSteps;
