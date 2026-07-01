import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, BookOpen, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const LiveTerminalPreview = () => {
  const [topic, setTopic] = useState("");
  const [stage, setStage] = useState("input"); // input -> generating -> result

  const handleSimulate = (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setStage("generating");
    
    // Fake generation delay
    setTimeout(() => {
      setStage("result");
    }, 2000);
  };

  const handleReset = () => {
    setStage("input");
    setTopic("");
  };

  return (
    <section className="py-24 px-6 relative z-10 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#333333] dark:text-white">Intelligence that adapts.</h2>
          <p className="mt-4 text-[#4A4A4A] dark:text-[#666666] max-w-2xl mx-auto">Watch your knowledge physically transform as you interact with the platform.</p>
        </div>

        <motion.div 
          layout
          transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          className="relative z-10 w-full max-w-4xl mx-auto backdrop-blur-2xl bg-white/60 dark:bg-[#181818]/60 border border-[#EAE8E1] dark:border-white/10 rounded-3xl overflow-hidden shadow-xl dark:shadow-[0_0_80px_rgba(59,107,255,0.15)]"
        >
          {/* Fake Window Header */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-[#EAE8E1] dark:border-white/10 bg-white/40 dark:bg-[#181818]/20">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="flex-1 text-center font-mono text-xs text-[#555555] dark:text-[#666666] opacity-70">
              neuralnest/core-engine
            </div>
          </div>

          <div className="p-8 md:p-12 min-h-[300px] flex flex-col justify-center relative">
            <AnimatePresence mode="wait">
              {stage === "input" && (
                <motion.form 
                  key="input"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                  transition={{ duration: 0.4 }}
                  onSubmit={handleSimulate}
                  className="w-full relative"
                >
                  <div className="flex items-center bg-white/60 dark:bg-[#181818]/60 border border-[#EAE8E1] dark:border-white/20 rounded-2xl p-2 focus-within:border-primary focus-within:ring-2 ring-primary/20 transition-all shadow-sm dark:shadow-none">
                    <div className="pl-6 pr-4 text-primary">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Advanced Thermodynamics, React Hooks..."
                      className="flex-1 w-full bg-transparent border-none text-xl md:text-2xl text-[#333333] dark:text-white placeholder:text-[#666666] dark:placeholder:text-[#555555] focus:outline-none focus:ring-0 py-4 font-light"
                    />
                    <button 
                      type="submit"
                      disabled={!topic.trim()}
                      className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary text-white p-4 rounded-xl transition-colors ml-2"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </motion.form>
              )}

              {stage === "generating" && (
                <motion.div 
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center space-y-6 text-center"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-16 h-16 border-4 border-[#EAE8E1] dark:border-white/10 border-t-primary dark:border-t-primary rounded-full"
                  />
                  <div className="font-mono text-primary text-lg animate-pulse">
                    Synthesizing cognitive map for "{topic}"...
                  </div>
                </motion.div>
              )}

              {stage === "result" && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full flex flex-col space-y-8"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-3xl font-bold text-[#333333] dark:text-white mb-2">{topic}</h3>
                      <p className="text-[#4A4A4A] dark:text-[#666666]">Custom Syllabus Generated.</p>
                    </div>
                    <button onClick={handleReset} className="text-sm font-medium text-[#555555] dark:text-[#666666] hover:text-[#333333] dark:hover:text-white flex items-center transition-colors">
                      Reset Demo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: BookOpen, title: "7 Core Modules", desc: "Foundational theory mapped." },
                      { icon: Target, title: "3 Mastery Exams", desc: "Adaptive testing checkpoints." },
                      { icon: Zap, title: "12 Interactive Quizzes", desc: "Real-time concept validation." }
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15 + 0.3 }}
                        className="bg-white/60 dark:bg-[#181818]/30 border border-[#EAE8E1] dark:border-white/5 rounded-2xl p-6"
                      >
                        <item.icon className="w-8 h-8 text-primary mb-4" />
                        <h4 className="text-[#333333] dark:text-white font-semibold mb-1">{item.title}</h4>
                        <p className="text-[#4A4A4A] dark:text-[#666666] text-sm">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="pt-4 flex justify-end"
                  >
                    <Link to="/register" className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-md">
                      <span>Start Learning This</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveTerminalPreview;
