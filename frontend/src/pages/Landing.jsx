import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowRight, Play, UploadCloud, MessageSquareText, ShieldCheck, CheckCircle2, Zap, Lock, Sparkles, Clock, FileText, Target, BookOpen } from 'lucide-react';
import ThemeToggle from '../components/layout/ThemeToggle'; // Re-added theme toggle

// ─── Interactive Neural Canvas ───
const InteractiveNeuralCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const nodes = [];
    const numNodes = Math.min(width * height / 15000, 100);
    const maxDistance = 150;

    const colorPrimary = 'rgba(59, 107, 255, '; // #3B6BFF
    const colorEmerald = 'rgba(16, 185, 129, '; // #10B981

    let mouse = { x: width / 2, y: height / 2, radius: 200 };

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        type: Math.random() > 0.5 ? colorPrimary : colorEmerald
      });
    }

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0) { node.x = 0; node.vx *= -1; }
        if (node.x > width) { node.x = width; node.vx *= -1; }
        if (node.y < 0) { node.y = 0; node.vy *= -1; }
        if (node.y > height) { node.y = height; node.vy *= -1; }

        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          node.vx -= (dx / distance) * force * 0.02;
          node.vy -= (dy / distance) * force * 0.02;
          node.vx *= 0.99;
          node.vy *= 0.99;
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.type + '0.5)';
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const ddx = node.x - other.x;
          const ddy = node.y - other.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            const opacity = 1 - (dist / maxDistance);
            ctx.strokeStyle = distance < mouse.radius ? node.type + opacity * 0.5 + ')' : 'rgba(128, 128, 128, ' + opacity * 0.1 + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 mix-blend-multiply dark:mix-blend-normal"
      style={{ opacity: 0.6 }}
    />
  );
};

// ─── Spring Physics & 3D Tilt Hook ───
const useMouseTilt = (config = { maxTilt: 15, springDamping: 0.1 }) => {
  const ref = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });

  useEffect(() => {
    // Respect reduced motion and disable on touch devices
    const isHoverableDevice = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isHoverableDevice || prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let animationFrameId;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      targetX = ((x - centerX) / centerX) * config.maxTilt;
      targetY = ((y - centerY) / centerY) * -config.maxTilt;
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const update = () => {
      currentX += (targetX - currentX) * config.springDamping;
      currentY += (targetY - currentY) * config.springDamping;
      setTiltStyle({
        transform: `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg) scale3d(1.05, 1.05, 1.05)`,
        transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      });

      if (Math.abs(currentX) < 0.1 && Math.abs(currentY) < 0.1 && targetX === 0) {
        setTiltStyle({
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
          transition: 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
      } else {
        animationFrameId = requestAnimationFrame(update);
      }
    };

    const onMouseEnter = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(update);
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseenter', onMouseEnter);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, [config.maxTilt, config.springDamping]);

  return { ref, tiltStyle };
};

const MagneticNode = ({ children, className }) => {
  const { ref, tiltStyle } = useMouseTilt({ maxTilt: 10, springDamping: 0.15 });
  return (
    <div ref={ref} className={`${className} will-change-transform`} style={tiltStyle}>
      {children}
    </div>
  );
};


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
    <section className="py-24 px-6 relative z-10 border-y border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-[#0F1322]/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">Intelligence that adapts.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Watch your knowledge physically transform as you interact with the platform.</p>
        </div>

        <motion.div 
          layout
          transition={{ type: "spring", bounce: 0.2, duration: 0.8 }}
          className="relative z-10 w-full max-w-4xl mx-auto backdrop-blur-2xl bg-white dark:bg-[#0B0F19]/60 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl dark:shadow-[0_0_80px_rgba(59,107,255,0.15)]"
        >
          {/* Fake Window Header */}
          <div className="flex items-center space-x-2 px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/20">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <div className="flex-1 text-center font-mono text-xs text-slate-500 dark:text-slate-400 opacity-70">
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
                  <div className="flex items-center bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/20 rounded-2xl p-2 focus-within:border-primary focus-within:ring-2 ring-primary/20 transition-all shadow-sm dark:shadow-none">
                    <div className="pl-6 pr-4 text-primary">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Advanced Thermodynamics, React Hooks..."
                      className="flex-1 w-full bg-transparent border-none text-xl md:text-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-0 py-4 font-light"
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
                    className="w-16 h-16 border-4 border-slate-200 dark:border-white/10 border-t-primary dark:border-t-primary rounded-full"
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
                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{topic}</h3>
                      <p className="text-slate-600 dark:text-slate-400">Custom Syllabus Generated.</p>
                    </div>
                    <button onClick={handleReset} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center transition-colors">
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
                        className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl p-6"
                      >
                        <item.icon className="w-8 h-8 text-primary mb-4" />
                        <h4 className="text-slate-900 dark:text-white font-semibold mb-1">{item.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">{item.desc}</p>
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

const Landing = () => {
  return (
    // Removed Forced Dark Wrapper so ThemeToggle can work globally
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 font-sans selection:bg-primary/30 relative overflow-x-hidden transition-colors duration-300">

      {/* Basic global fade animation for demo */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
      `}</style>

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-1.5 rounded-lg text-white">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              NEURALNEST
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-primary dark:hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary dark:hover:text-white transition-colors">Progression</a>
            <a href="#testimonials" className="hover:text-primary dark:hover:text-white transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(59,107,255,0.5)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center text-center z-10">
        <div className="absolute inset-0 z-0">
          <InteractiveNeuralCanvas />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-[#0B0F19]" />
        </div>

        <div className="relative z-10 w-full max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight animate-fade-in-up mix-blend-difference dark:mix-blend-normal">
            Study Smarter.<br />
            <span className="text-primary">Master Faster.</span><br />
            Ace Every Exam.
          </h1>

          <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            NeuralNest is an AI tutor that builds personalized roadmaps and adaptive quizzes from your syllabus. Stop studying blindly—let the AI show you exactly what you need to know.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <MagneticNode>
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(59,107,255,0.4)] hover:shadow-[0_0_40px_-5px_rgba(59,107,255,0.6)] flex items-center justify-center space-x-2 cursor-pointer">
                <span>Start Learning Free</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </MagneticNode>
            <MagneticNode>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm backdrop-blur-sm">
                <Play className="h-4 w-4 fill-current" />
                <span>Watch Demo</span>
              </button>
            </MagneticNode>
          </div>

          {/* Interactive Hero Visual: 3D Magnetic Graph Roadmap */}
          <div className="mt-20 relative w-full max-w-4xl mx-auto h-64 flex items-center justify-center hidden md:flex animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            {/* Connectors */}
            <div className="absolute top-1/2 left-[15%] right-[15%] h-px -translate-y-1/2 flex pointer-events-none">
              <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500/50 to-amber-500/50" />
              <div className="w-1/2 h-full bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="flex items-center space-x-8 relative z-10 group/canvas">
              {/* Node 1: Mastered */}
              <MagneticNode className="w-52 p-4 rounded-2xl bg-white dark:bg-[#121212] border border-emerald-500/30 shadow-sm transition-colors cursor-default relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-500 tracking-widest">#01</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mb-1 relative z-10">Foundations of ML</h3>
                <p className="text-[10px] font-mono text-emerald-500/80 mb-3 font-semibold relative z-10">100% COMPLETE</p>
                <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative z-10">
                  <div className="h-full rounded-full bg-emerald-500 w-full" />
                </div>
              </MagneticNode>

              {/* Node 2: Learning */}
              <MagneticNode className="w-56 p-5 rounded-3xl bg-white dark:bg-[#1E1E1E] border border-amber-500/50 shadow-md shadow-amber-500/10 cursor-pointer relative z-20 backdrop-blur-md overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-500 tracking-widest">#02</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500 text-white shadow-md shadow-amber-500/30">
                    <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2 relative z-10">Neural Networks</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 relative z-10">Backpropagation, CNNs, and RNN architectures.</p>
                <div className="flex items-center justify-between pt-1 relative z-10">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Learning</span>
                  </div>
                  <div className="flex items-center text-slate-500 dark:text-slate-400">
                    <Clock className="h-3 w-3 mr-1" />
                    <span className="text-[10px] font-mono">45m left</span>
                  </div>
                </div>
              </MagneticNode>

              {/* Node 3: Locked */}
              <MagneticNode className="w-52 z-20 p-4 rounded-2xl bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-slate-800/50 shadow-md cursor-default relative overflow-hidden">
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-600 tracking-widest">#03</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-snug mb-1 relative z-10">NLP</h3>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-3 font-semibold relative z-10">LOCKED</p>
                <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800/50 relative z-10" />
              </MagneticNode>
            </div>
          </div>
        </div>
      </section>

      {/* ─── OVERDRIVE: Asymmetric 2-Column Features with Mini Previews ─── */}
      <section id="features" className="py-24 px-6 relative z-10 bg-slate-50 dark:bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">The ecosystem for mastery.</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl">Stop jumping between PDFs, generic ChatGPT tabs, and flashcard apps. NeuralNest natively integrates every tool you need.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Feature 1: AI Tutor (Large - spans 7 cols) */}
            <div className="md:col-span-7 bg-white dark:bg-[#121622] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col relative group shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              <div className="p-8 pb-0">
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mb-6">
                  <MessageSquareText className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">AI Tutor — Ask Anything</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">Chat with an AI tutor that deeply understands your exact syllabus. It uses simple analogies tailored to your learning style.</p>
              </div>
              {/* Mini Preview UI */}
              <div className="mt-auto p-8 pt-10">
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
            </div>

            {/* Feature 2: Quizzes (Medium - spans 5 cols) */}
            <div className="md:col-span-5 bg-white dark:bg-[#121622] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col relative group shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Adaptive Quizzes</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Test your knowledge as you learn. Our AI generates strict multiple-choice questions to validate mastery.</p>
              </div>
              <div className="mt-auto px-8 pb-0">
                <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-t-2xl border border-slate-200 dark:border-white/5 border-b-0 p-5 shadow-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Which activation function suffers from the vanishing gradient problem?</p>
                  <div className="space-y-2">
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-400 flex items-center"><span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center mr-3 text-xs font-medium">A</span> ReLU</div>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center"><span className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center mr-3 text-xs font-medium">B</span> Sigmoid <CheckCircle2 className="h-4 w-4 ml-auto" /></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Materials (Medium - spans 5 cols) */}
            <div className="md:col-span-5 bg-white dark:bg-[#121622] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col relative group shadow-sm">
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-6">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Universal Uploads</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Feed NeuralNest your exact curriculum. PDFs, Word docs, or YouTube links—it extracts the knowledge instantly.</p>
              </div>
              <div className="mt-auto px-8 pb-8">
                <div className="bg-slate-50 dark:bg-[#0B0F19] rounded-2xl border border-slate-200 dark:border-white/5 p-4 flex items-center space-x-4 shadow-sm dark:shadow-none">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">CS_101_Syllabus.pdf</p>
                    <p className="text-xs text-slate-500">Processing... 94%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Rescue Mode (Large - spans 7 cols) */}
            <div className="md:col-span-7 bg-white dark:bg-[#121622] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col md:flex-row items-center relative group shadow-sm">
              <div className="p-8 md:w-1/2">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Exam Rescue Mode</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Exam tomorrow? Upload your syllabus and enter Rescue Mode. We cut the fluff and give you a ruthless triage plan to pass.</p>
              </div>
              <div className="p-8 pt-0 md:pt-8 md:w-1/2 flex justify-center">
                <div className="w-48 h-48 rounded-full flex items-center justify-center relative shadow-[0_0_50px_-10px_rgba(168,85,247,0.15)] dark:shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]">
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
            </div>

          </div>
        </div>
      </section>

      {/* ─── LIVE AI TERMINAL PREVIEW ─── */}
      <LiveTerminalPreview />

      {/* ─── Refined Editorial Testimonials ─── */}
      <section id="testimonials" className="py-24 px-6 relative z-10 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-16 md:w-1/2">Real learners. Real mastery.</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: 'Sarah M.', role: 'Computer Science Major', text: 'The Exam Rescue mode saved my OS grade. I uploaded my syllabus 2 days before the exam, and it gave me exactly what I needed to pass. It is like magic.' },
              { name: 'Michael T.', role: 'Pre-Med Student', text: 'I use NeuralNest for Organic Chemistry. The AI tutor explains complex reactions with analogies that actually make sense to me. Best study app I have ever used.' },
              { name: 'Emily R.', role: 'High School Senior', text: 'The visual roadmap keeps me sane during AP exam season. Seeing the nodes turn green gives me so much dopamine. I actually look forward to studying now.' },
            ].map((testimonial, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="pl-6 border-l-2 border-primary">
                  <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-6 font-medium">"{testimonial.text}"</p>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm truncate">{testimonial.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-50 dark:bg-[#121622] border border-slate-200 dark:border-white/5 text-center p-12 md:p-20 relative overflow-hidden shadow-sm dark:shadow-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 dark:from-primary/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Your exam isn't going to<br />study for itself.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-xl mx-auto">
              Stop cramming and start mastering. Free to start. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(59,107,255,0.4)] hover:shadow-[0_0_40px_-5px_rgba(59,107,255,0.6)] hover:-translate-y-0.5 flex items-center justify-center text-center">
                Start Learning Free
              </Link>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-8 py-3.5 border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white font-semibold rounded-xl transition-colors"
              >
                View Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-12 px-6 relative z-10">
        {/* Prototype Disclaimer */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-start space-x-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <p>
              <span className="font-semibold">Prototype Disclaimer:</span>{' '}
              NeuralNest is currently a prototype. All testimonials and metrics displayed on this page are illustrative placeholders and do not reflect real usage data.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Brain className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              NEURALNEST
            </span>
          </div>
          <div className="flex space-x-6 text-sm text-slate-500 dark:text-slate-400 mb-4 md:mb-0">
            <Link to="/privacy" className="hover:text-slate-700 dark:hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-700 dark:hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-slate-700 dark:hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-600">
            &copy; {new Date().getFullYear()} NeuralNest OS. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};
export default Landing;
