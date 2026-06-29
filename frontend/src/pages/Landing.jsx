import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import Navbar from '../components/landing/Navbar';
import HeroParallax from '../components/landing/HeroParallax';
import PinnedAgentGraph from '../components/landing/PinnedAgentGraph';
import BentoGrid from '../components/landing/BentoGrid';
import HorizontalScrollSteps from '../components/landing/HorizontalScrollSteps';
import StatsCounter from '../components/landing/StatsCounter';
import Testimonials from '../components/landing/Testimonials';
import FinalCTA from '../components/landing/FinalCTA';
import LiveTerminalPreview from '../components/landing/LiveTerminalPreview';

const Landing = () => {

  return (
    // Removed Forced Dark Wrapper so ThemeToggle can work globally
    // Removed overflow-x-hidden because it breaks position: sticky for all children
    <div className="min-h-screen bg-[#F6F5F1] dark:bg-[#0B0F19] text-[#333333] dark:text-slate-200 font-sans selection:bg-primary/30 relative transition-colors duration-300">

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
      <Navbar />

      {/* ─── HERO PARALLAX (Layers, Floating Cards, Split Reveal) ─── */}
      <HeroParallax />

      {/* ─── PINNED AGENT GRAPH SECTION ─── */}
      <PinnedAgentGraph />

      {/* ─── OVERDRIVE: Asymmetric 2-Column Features with Mini Previews ─── */}
      <BentoGrid />

      {/* ─── LIVE AI TERMINAL PREVIEW ─── */}
      <LiveTerminalPreview />

      {/* ─── HORIZONTAL SCROLL HOW IT WORKS ─── */}
      <HorizontalScrollSteps />

      {/* ─── STATS COUNTER ─── */}
      <StatsCounter />

      {/* ─── TESTIMONIALS ─── */}
      <Testimonials />

      {/* ─── BOTTOM CTA ─── */}
      <FinalCTA />

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
