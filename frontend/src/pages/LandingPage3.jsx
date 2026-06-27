import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  BackgroundBeams, 
  TextReveal, 
  TiltCard, 
  ScrollReveal, 
  MagneticButton 
} from '../components/ui/AceternityEffects';

// --- DATA ---
const FEATURES = [
  {
    title: "Upload your syllabus",
    desc: "PDF, DOCX, image, or paste notes. Our engine extracts granular topics and maps prerequisite dependencies into a visual DAG.",
    icon: "📄"
  },
  {
    title: "Agentic Loop",
    desc: "A continuous LangGraph loop that grades your understanding and re-explains in a smarter mode if you're confused.",
    icon: "🔄"
  },
  {
    title: "Mastery Tracked",
    desc: "Every quiz updates your mastery score using quiz performance, self-rating, and session engagement.",
    icon: "🎯"
  }
];

export default function LandingPage3() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 1000], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#3B6BFF]/30 selection:text-white font-sans overflow-hidden">
      
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 inset-x-0 z-50 mix-blend-difference">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] flex items-center justify-center text-sm font-black text-[#000000]">
              N
            </div>
            <span className="font-bold tracking-tight text-white text-lg">NeuralNest</span>
          </div>
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-white hover:text-white/70 transition-colors"
            >
              Log in
            </button>
            <MagneticButton 
              onClick={() => navigate("/signup")}
              className="bg-[#FFFFFF] text-[#000000] px-6 py-2.5 text-sm"
            >
              Get Started
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative h-screen flex items-center justify-center pt-20 perspective-[1000px]">
        <BackgroundBeams />
        
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-5xl mx-auto px-6 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-[#3B6BFF] animate-pulse" />
            <span className="text-sm font-medium text-white/80">LangGraph Agent Loop Active</span>
          </div>
          
          <TextReveal 
            text="The AI that knows when you're confused."
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
          />
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
            className="text-lg md:text-xl text-[#9CA3AF] max-w-2xl mx-auto mb-12 font-medium"
          >
            Upload your syllabus. NeuralNest maps every topic, teaches you one concept at a time, and only advances when you've actually got it.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5, type: "spring" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton 
              onClick={() => navigate("/signup")}
              className="bg-[#3B6BFF] text-white w-full sm:w-auto text-lg"
            >
              Start Learning Free
            </MagneticButton>
          </motion.div>
        </motion.div>

        {/* 3D Floating Element in Hero */}
        <motion.div 
          style={{ y: useTransform(scrollY, [0, 1000], [0, -150]) }}
          className="absolute bottom-[-10%] md:bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-20 pointer-events-none"
        >
          <TiltCard className="w-full h-48 md:h-64 bg-[#121212]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_100px_rgba(59,107,255,0.15)] flex items-center justify-center pointer-events-auto">
            <div className="text-center space-y-4">
               <div className="font-mono text-sm text-[#3B6BFF]">AGENT TERMINAL</div>
               <div className="text-xs md:text-sm font-mono text-[#F3F4F6] text-left max-w-md mx-auto space-y-2 opacity-80">
                 <div className="flex gap-2">
                   <span className="text-[#9CA3AF]">[10:42]</span>
                   <span>TUTOR_NODE: Streaming explanation...</span>
                 </div>
                 <div className="flex gap-2">
                   <span className="text-[#9CA3AF]">[10:42]</span>
                   <span className="text-[#FBBF24]">GRADE_NODE: Classification → PARTIAL</span>
                 </div>
                 <div className="flex gap-2">
                   <span className="text-[#9CA3AF]">[10:42]</span>
                   <span className="text-[#3B6BFF]">ROUTER: Re-routing mode=step_by_step</span>
                 </div>
               </div>
            </div>
          </TiltCard>
        </motion.div>
      </section>

      {/* ── FEATURES GRID (3D Scroll Reveal) ── */}
      <section className="py-32 relative z-30 bg-[#000000]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-20 text-center">
              A deeply interactive <br />
              <span className="text-[#3B6BFF]">cognitive engine.</span>
            </h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8 perspective-[1000px]">
            {FEATURES.map((feature, i) => (
              <ScrollReveal key={i}>
                <TiltCard className="h-full min-h-[300px] p-8 bg-[#121212] border border-[#262626] group hover:border-[#3B6BFF]/50 transition-colors">
                  <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-left">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-[#F3F4F6]">{feature.title}</h3>
                  <p className="text-[#9CA3AF] leading-relaxed">
                    {feature.desc}
                  </p>
                </TiltCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="relative py-40 bg-[#000000] border-t border-[#262626] overflow-hidden">
        {/* Glow behind footer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3B6BFF]/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-[#F3F4F6]">
              Ready to understand?
            </h2>
            <p className="text-[#9CA3AF] text-xl mb-12 max-w-2xl mx-auto">
              Your syllabus is already on your desktop. Upload it, and let the agent teach you exactly what you need to know.
            </p>
            <MagneticButton 
              onClick={() => navigate("/signup")}
              className="bg-[#FFFFFF] text-[#000000] px-12 py-5 text-xl font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)]"
            >
              Start for Free
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
