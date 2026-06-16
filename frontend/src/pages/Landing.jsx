import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, ShieldCheck, Zap, Calendar, MessageSquareText, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/layout/ThemeToggle';

const Landing = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleDemoSignIn = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name to simulate login');
      return;
    }
    login({
      name: name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@neuralnest.ai`,
      onboarded: false
    });
    navigate('/onboarding');
  };

  const handleQuickDemo = () => {
    login({
      name: 'Guest Scholar',
      email: 'guest@neuralnest.ai',
      onboarded: true
    });
    navigate('/roadmap');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-text-primary-dark transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 grid-backdrop pointer-events-none opacity-40"></div>
      
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-primary/10 dark:bg-accent/10 p-2 rounded-xl text-primary dark:text-accent">
            <Brain className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:from-accent dark:to-purple-400 bg-clip-text text-transparent">
            NeuralNest-OS
          </span>
        </div>
        <ThemeToggle />
      </header>

      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
        <div className="lg:col-span-7 space-y-8 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent border border-primary/20 dark:border-accent/20">
            <Zap className="h-3.5 w-3.5" />
            <span>Hackathon Demo Build</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            The AI Tutor that{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
              visualizes what you know
            </span>
          </h1>

          <p className="text-lg text-slate-600 dark:text-text-muted-dark max-w-xl">
            Upload your syllabus or paste your notes. NeuralNest-OS builds an interactive roadmap, teaches you topic by topic, and uses adaptive explanations to ensure you achieve full mastery.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark/50 shadow-sm space-y-2">
              <div className="text-primary dark:text-accent"><Layers className="h-5 w-5" /></div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Roadmap Nodes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Nodes turn from gray to yellow to green as you master topics.</p>
            </div>
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark/50 shadow-sm space-y-2">
              <div className="text-primary dark:text-accent"><Calendar className="h-5 w-5" /></div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Rescue Countdown</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Specify your exam date and get an auto-adjusted revision plan.</p>
            </div>
            <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark/50 shadow-sm space-y-2">
              <div className="text-primary dark:text-accent"><MessageSquareText className="h-5 w-5" /></div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Adaptive Pacing</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Mid-lesson checks and doubts Q&A before you proceed.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-md p-8 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-2xl relative">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/20 dark:bg-accent/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>

            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome to NeuralNest-OS</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Sign in to begin your personalized study path</p>
              </div>

              <button
                onClick={handleQuickDemo}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-primary/30 bg-slate-50 hover:bg-slate-100 dark:bg-elevated-dark dark:hover:bg-elevated-dark/80 text-slate-800 dark:text-text-primary-dark rounded-xl font-medium transition-all duration-300 shadow-sm"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.187 4.114-3.523 0-6.386-2.863-6.386-6.386s2.863-6.386 6.386-6.386c1.63 0 3.117.61 4.254 1.625l3.153-3.153C19.228 2.213 15.958 1 12.24 1 5.922 1 12.24s4.922 11.24 11.24 11.24c5.84 0 10.744-4.223 10.744-11.24 0-.693-.058-1.357-.173-1.955H12.24Z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or Sandbox Login</span>
                <div className="flex-grow border-t border-border-light dark:border-border-dark"></div>
              </div>

              <form onSubmit={handleDemoSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-elevated-dark text-slate-900 dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-elevated-dark transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-elevated-dark text-slate-900 dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-elevated-dark transition-all duration-300"
                  />
                </div>

                {error && (
                  <p className="text-xs font-semibold text-red-500 dark:text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 dark:shadow-accent/20 transition-all duration-300"
                >
                  <span>Enter Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-border-light dark:border-border-dark flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} NeuralNest-OS. Built for the EdTech Hackathon.
        </p>
        <div className="flex space-x-6">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
            <ShieldCheck className="h-4 w-4 text-emerald-500 mr-1.5" />
            RAG Vector Privacy
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Powered by GPT-4o & LangGraph
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
