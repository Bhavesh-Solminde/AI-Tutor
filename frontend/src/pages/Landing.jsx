import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Star, ArrowRight, Play, UploadCloud, Map, MessageSquareText, BarChart3, CheckCircle2, Zap, Lock, Sparkles, Clock } from 'lucide-react';
import ThemeToggle from '../components/layout/ThemeToggle';

// ─── OVERDRIVE: Interactive Neural Canvas (From Variant 2) ───
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
    
    // Primary and Emerald hexes
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

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        // Move
        node.x += node.vx;
        node.y += node.vy;

        // Bounce
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Mouse magnetic pull
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          const force = (mouse.radius - distance) / mouse.radius;
          node.vx -= (dx / distance) * force * 0.02;
          node.vy -= (dy / distance) * force * 0.02;
          
          // Damping
          node.vx *= 0.99;
          node.vy *= 0.99;
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.type + '0.5)';
        ctx.fill();

        // Connect
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const ddx = node.x - other.x;
          const ddy = node.y - other.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            
            // Opacity based on distance
            const opacity = 1 - (dist / maxDistance);
            
            // Mix colors
            ctx.strokeStyle = distance < mouse.radius ? node.type + opacity * 0.5 + ')' : 'rgba(128, 128, 128, ' + opacity * 0.1 + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
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
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ opacity: 0.6 }}
    />
  );
};

// ─── OVERDRIVE: Spring Physics & 3D Tilt Hook (From Variant 3) ───
const useMouseTilt = (config = { maxTilt: 15, springDamping: 0.1 }) => {
  const ref = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });

  useEffect(() => {
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
      // Simple spring damping
      currentX += (targetX - currentX) * config.springDamping;
      currentY += (targetY - currentY) * config.springDamping;

      setTiltStyle({
        transform: `perspective(1000px) rotateX(${currentY}deg) rotateY(${currentX}deg) scale3d(1.05, 1.05, 1.05)`,
        transition: 'transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // Only for scale smooth
      });

      // If at rest (0), we can drop the scale back to 1
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

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans selection:bg-primary/30 relative">
      
      {/* OVERDRIVE: Canvas Neural Field */}
      <InteractiveNeuralCanvas />

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
            <a href="#how-it-works" className="hover:text-primary dark:hover:text-white transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-primary dark:hover:text-white transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-primary dark:hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-primary/25">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center text-center z-10">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight animate-fade-in-up mix-blend-difference dark:mix-blend-normal">
          Study Smarter.<br />
          <span className="text-primary">Master Faster.</span><br />
          Ace Every Exam.
        </h1>

        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          NeuralNest is an AI tutor... personalized roadmaps and adaptive quizzes for every subject. Stop studying blindly—let the AI show you what you don't know.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up relative z-20" style={{ animationDelay: '200ms' }}>
          <MagneticNode>
            <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-colors shadow-[0_0_40px_-10px_rgba(59,107,255,0.6)] flex items-center justify-center space-x-2 cursor-pointer">
              <span>Start Learning Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </MagneticNode>
          <MagneticNode>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer">
              <Play className="h-4 w-4 fill-current" />
              <span>Watch Demo</span>
            </button>
          </MagneticNode>
        </div>

        {/* Interactive Hero Visual: 3D Magnetic Graph Roadmap */}
        <div className="mt-16 relative w-full max-w-4xl mx-auto h-64 flex items-center justify-center hidden md:flex animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          
          {/* Connectors */}
          <div className="absolute top-1/2 left-[15%] right-[15%] h-px -translate-y-1/2 flex pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-emerald-500/50 to-amber-500/50" />
            <div className="w-1/2 h-full bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="flex items-center space-x-8 relative z-10 group/canvas">
            
            {/* Node 1: Mastered */}
            <MagneticNode className="w-52 p-4 rounded-2xl bg-white/90 dark:bg-[#121212]/90 border border-emerald-500/30 backdrop-blur-md shadow-lg hover:shadow-2xl hover:border-emerald-500/50 transition-colors cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-widest">#01</span>
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
            <MagneticNode className="w-56 p-5 rounded-3xl bg-white dark:bg-[#1E1E1E] border border-amber-500/50 shadow-2xl shadow-amber-500/20 hover:shadow-amber-500/40 transition-colors cursor-pointer relative z-20 backdrop-blur-md overflow-hidden">
              <div className="absolute inset-0 rounded-3xl ring-2 ring-amber-400/30 animate-pulse pointer-events-none" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 tracking-widest">#02</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500 text-white shadow-md shadow-amber-500/30">
                  <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mb-2 relative z-10">Deep Learning Neural Networks</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 relative z-10">Backpropagation, CNNs, and RNN architectures.</p>
              <div className="flex items-center justify-between pt-1 relative z-10">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Learning</span>
                </div>
                <div className="flex items-center text-slate-400">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="text-[10px] font-mono">45m left</span>
                </div>
              </div>
            </MagneticNode>

            {/* Node 3: Locked */}
            <MagneticNode className="w-52 p-4 rounded-2xl bg-white/50 dark:bg-[#121212]/50 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-md hover:shadow-xl transition-colors cursor-default relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 relative z-10">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-600 tracking-widest">#03</span>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-snug mb-1 relative z-10">Natural Language Processing</h3>
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mb-3 font-semibold relative z-10">LOCKED</p>
              <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-slate-800/50 relative z-10" />
            </MagneticNode>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 px-6 relative border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-[#0F1322]/80 backdrop-blur-lg z-10">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">One platform. Every subject. Any deadline.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">NeuralNest equips you with everything you need to walk into your exam room completely confident.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: MessageSquareText, color: 'text-primary', bg: 'bg-primary/10', title: 'AI Tutor — Ask Anything', desc: 'Chat with an AI tutor that explains complex topics using simple analogies, tailored to your learning style.' },
            { icon: Map, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', title: 'Personalized Study Roadmap', desc: 'Upload your syllabus and get a step-by-step visual roadmap breaking down large chapters into bite-sized tasks.' },
            { icon: Brain, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', title: 'Exam Rescue Mode', desc: 'Exam tomorrow? NeuralNest analyzes your syllabus, cuts the fluff, and gives you a triage rescue plan.' },
            { icon: Zap, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', title: 'Adaptive Quizzes', type: 'new', desc: 'Test your knowledge as you learn. Our AI generates quizzes that get harder as you master the fundamentals.' },
            { icon: BarChart3, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', title: 'Live Progress Tracking', desc: 'See your nodes turn from gray to green as you master concepts. Always know exactly how much is left to do.' },
            { icon: UploadCloud, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800', title: 'Rich Media & Material Upload', desc: 'Upload PDFs, Word docs, or paste YouTube links. NeuralNest extracts the content to build your custom tutor.' },
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white/80 dark:bg-[#141A2B]/80 backdrop-blur-md border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${feature.bg} ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                {feature.type === 'new' && (
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md">New</span>
                )}
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <section id="how-it-works" className="py-24 px-6 relative z-10 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">From lost to acing it — in 4 steps.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">NeuralNest removes the anxiety of figuring out where to start by automating the study plan.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-slate-200 dark:bg-white/10" />

          {[
            { step: '01', icon: UploadCloud, title: 'Upload Your Syllabus', desc: 'Drag and drop your course syllabus or PDF notes. NeuralNest instantly extracts the core topics you need to know.' },
            { step: '02', icon: Map, title: 'Get Your Personalized Roadmap', desc: 'NeuralNest dynamically creates an interactive, node-based roadmap of your entire course curriculum.' },
            { step: '03', icon: MessageSquareText, title: 'Study with your AI Tutor', desc: 'Click any node to start learning. The AI tutor will explain concepts, ask questions, and test your understanding.' },
            { icon: CheckCircle2, title: 'Track Mastery & Ace the Exam', desc: 'Nodes turn green as you master them. You will walk into the exam room with absolute confidence.' },
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col text-left p-6 rounded-2xl bg-white dark:bg-[#141A2B] border border-slate-200 dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white mb-4 shadow-lg shadow-primary/30">
                <item.icon className="h-5 w-5" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ─── */}
      <section id="testimonials" className="py-24 px-6 bg-slate-50/50 dark:bg-[#0F1322]/80 backdrop-blur-lg border-y border-slate-100 dark:border-white/5 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Real results from real learners.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Join 50,000+ students who use NeuralNest to crush their exams and reclaim their weekends.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {[
            { name: 'Sarah M.', role: 'Computer Science Major', text: '"The Exam Rescue mode literally saved my OS grade. I uploaded my syllabus 2 days before the exam, and it gave me exactly what I needed to pass. It\'s like magic."' },
            { name: 'Michael T.', role: 'Pre-Med Student', text: '"I use NeuralNest for Organic Chemistry. The AI tutor explains complex reactions with analogies that actually make sense to me. Best study app I\'ve ever used."' },
            { name: 'Emily R.', role: 'High School Senior', text: '"The visual roadmap keeps me sane during AP exam season. Seeing the nodes turn green gives me so much dopamine. I actually look forward to studying now."' },
          ].map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white dark:bg-[#141A2B] border border-slate-200 dark:border-white/5 flex flex-col justify-between">
              <div>
                <div className="flex space-x-1 mb-4 text-slate-300 dark:text-slate-600">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">{testimonial.text}</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-white font-bold">
                  {testimonial.name[0]}
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm">{testimonial.name}</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="py-24 px-6 relative z-10 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-lg border-t border-slate-200 dark:border-white/10">
        <div className="max-w-5xl mx-auto rounded-3xl bg-slate-900 dark:bg-[#121212] border border-slate-800 dark:border-white/5 text-center p-12 md:p-20 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Your exam isn't going to<br />study for itself.</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white hover:bg-primary-hover font-bold rounded-xl transition-colors shadow-lg shadow-primary/20">
                Start Learning Free
              </Link>
              <button className="w-full sm:w-auto px-8 py-3.5 border border-slate-700 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors">
                View Live Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6 bg-slate-50 dark:bg-[#0B0F19] relative z-10">
        {/* Prototype Disclaimer */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-start space-x-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
            <span className="flex-shrink-0 mt-0.5">⚠️</span>
            <p>
              <span className="font-semibold">Prototype Disclaimer:</span>{' '}
              NeuralNest is currently a prototype. All statistics, user counts, and metrics displayed on this page (e.g. "50,000+ students", ratings, percentages) are illustrative placeholders and do not reflect real usage data.
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
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-500">
            &copy; {new Date().getFullYear()} NeuralNest OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
