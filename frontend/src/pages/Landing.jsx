import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Star, ArrowRight, Play, UploadCloud, Map, MessageSquareText, BarChart3, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import ThemeToggle from '../components/layout/ThemeToggle';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F19] text-slate-800 dark:text-slate-200 transition-colors duration-300 font-sans selection:bg-primary/30">

      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
      <section className="pt-32 pb-20 px-6 relative overflow-hidden flex flex-col items-center text-center">
        {/* Glow Effects */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />



        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Study Smarter.<br />
          <span className="text-primary">Master Faster.</span><br />
          Ace Every Exam.
        </h1>

        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          NeuralNest is an AI tutor... personalized roadmaps and adaptive quizzes for every subject. Stop studying blindly—let the AI show you what you don't know.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(59,107,255,0.6)] flex items-center justify-center space-x-2">
            <span>Start Learning Free</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <button className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2">
            <Play className="h-4 w-4 fill-current" />
            <span>Watch Demo</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-14 flex items-center justify-center space-x-8 sm:space-x-16 text-center">
          {[
            { value: '50,000+', label: 'Active Students' },
            { value: '98%', label: 'Pass Rate' },
            { value: '620+', label: 'Study Hours' },
            { value: '4.9/5', label: 'Average Rating' },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider mt-1">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Dashboard Mockup */}
        <div className="mt-16 relative w-full max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0B0F19] via-transparent to-transparent z-10 top-1/2" />
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-2 bg-slate-50 dark:bg-white/5 shadow-2xl overflow-hidden relative">
            <img src="/light.png" alt="NeuralNest Dashboard Light" className="w-full h-auto rounded-xl object-cover border border-slate-200 dark:hidden" />
            <img src="/dark.png" alt="NeuralNest Dashboard Dark" className="hidden dark:block w-full h-auto rounded-xl object-cover border border-white/10" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="py-24 px-6 relative border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0F1322]">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h3 className="text-primary text-xs font-bold tracking-widest uppercase mb-3">EVERYTHING YOU NEED</h3>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">One platform. Every subject. Any deadline.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">NeuralNest equips you with everything you need to walk into your exam room completely confident.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: MessageSquareText, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'AI Tutor — Ask Anything', desc: 'Chat with an AI tutor that explains complex topics using simple analogies, tailored to your learning style.' },
            { icon: Map, color: 'text-emerald-500', bg: 'bg-emerald-500/10', title: 'Personalized Study Roadmap', desc: 'Upload your syllabus and get a step-by-step visual roadmap breaking down large chapters into bite-sized tasks.' },
            { icon: Brain, color: 'text-red-500', bg: 'bg-red-500/10', title: 'Exam Rescue Mode', desc: 'Exam tomorrow? NeuralNest analyzes your syllabus, cuts the fluff, and gives you a triage rescue plan.' },
            { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10', title: 'Adaptive Quizzes', type: 'new', desc: 'Test your knowledge as you learn. Our AI generates quizzes that get harder as you master the fundamentals.' },
            { icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-500/10', title: 'Live Progress Tracking', desc: 'See your nodes turn from gray to green as you master concepts. Always know exactly how much is left to do.' },
            { icon: UploadCloud, color: 'text-cyan-500', bg: 'bg-cyan-500/10', title: 'Rich Media & Material Upload', desc: 'Upload PDFs, Word docs, or paste YouTube links. NeuralNest extracts the content to build your custom tutor.' },
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white dark:bg-[#141A2B] border border-slate-200 dark:border-white/5 hover:border-primary/50 transition-colors group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${feature.bg} ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                {feature.type === 'new' && (
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 rounded-md">New</span>
                )}
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS SECTION ─── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h3 className="text-primary text-xs font-bold tracking-widest uppercase mb-3">HOW IT WORKS</h3>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">From lost to acing it — in 4 steps.</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">NeuralNest removes the anxiety of figuring out where to start by automating the study plan.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connector Line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[12%] right-[12%] h-px bg-slate-200 dark:bg-white/10" />

          {[
            { step: '01', icon: UploadCloud, title: 'Upload Your Syllabus', desc: 'Drag and drop your course syllabus or PDF notes. NeuralNest instantly extracts the core topics you need to know.' },
            { step: '02', icon: Map, title: 'Get Your Personalized Roadmap', desc: 'NeuralNest dynamically creates an interactive, node-based roadmap of your entire course curriculum.' },
            { step: '03', icon: MessageSquareText, title: 'Study with your AI Tutor', desc: 'Click any node to start learning. The AI tutor will explain concepts, ask questions, and test your understanding.' },
            { step: '04', icon: CheckCircle2, title: 'Track Mastery & Ace the Exam', desc: 'Nodes turn green as you master them. You will walk into the exam room with absolute confidence.' },
          ].map((item, idx) => (
            <div key={idx} className="relative z-10 flex flex-col text-left p-6 rounded-2xl bg-white dark:bg-[#141A2B] border border-slate-200 dark:border-white/5">
              <span className="text-5xl font-extrabold text-slate-100 dark:text-white/5 mb-4">{item.step}</span>
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
      <section id="testimonials" className="py-24 px-6 bg-slate-50/50 dark:bg-[#0F1322] border-y border-slate-100 dark:border-white/5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center mb-16 relative z-10">
          <h3 className="text-primary text-xs font-bold tracking-widest uppercase mb-3">STUDENT STORIES</h3>
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
                <div className="flex space-x-1 mb-4 text-amber-400">
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
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto rounded-3xl bg-primary text-center p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-primary/30">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Your exam isn't going to<br />study for itself.</h2>
            <p className="text-primary-100 text-lg mb-10 text-white/80 max-w-xl mx-auto">
              Join 50,000+ students who stopped cramming and started mastering. Free to start. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="w-full sm:w-auto px-8 py-3.5 bg-white text-primary hover:bg-slate-50 font-bold rounded-xl transition-colors shadow-lg">
                Start Learning Free
              </Link>
              <button className="w-full sm:w-auto px-8 py-3.5 bg-primary border border-white/20 hover:bg-white/10 text-white font-semibold rounded-xl transition-colors">
                View Live Demo
              </button>
            </div>
            <p className="mt-6 text-xs text-white/60">Includes full access to AI Tutor, Roadmaps, and Quizzes.</p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-200 dark:border-white/10 py-12 px-6 bg-slate-50 dark:bg-[#0B0F19]">
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
