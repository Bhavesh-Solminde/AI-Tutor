import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Brain, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import ThemeToggle from '../components/layout/ThemeToggle';

const AuthPage = () => {
  const { loginWithGoogle, loginWithGithub, loginWithEmail, register, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Default mode based on URL or location state
  const isRegisterPage = location.pathname === '/register';
  const [mode, setMode] = useState(isRegisterPage ? 'register' : 'login'); // 'login' | 'register'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Update mode if URL changes
  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
    setLocalError('');
    clearError();
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email.trim()) { setLocalError('Email is required.'); return; }
    if (!password || password.length < 8) { setLocalError('Password must be at least 8 characters.'); return; }
    if (mode === 'register' && !name.trim()) { setLocalError('Your name is required.'); return; }

    setLoading(true);
    try {
      let user;
      if (mode === 'register') {
        user = await register({ email, password, name });
      } else {
        user = await loginWithEmail({ email, password });
      }
      navigate(user?.onboarded ? '/roadmap' : '/onboarding');
    } catch (err) {
      setLocalError(err.userMessage || err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (m) => {
    navigate(m === 'register' ? '/register' : '/login');
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#F6F5F1] dark:bg-background-dark text-[#333333] dark:text-text-primary-dark transition-colors duration-300 relative overflow-hidden flex flex-col justify-center items-center py-12 px-6">
      <div className="absolute inset-0 grid-backdrop pointer-events-none opacity-0 dark:opacity-40" />

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-20">
        <Link to="/" className="flex items-center space-x-3 group">
          <img src="/logo_without_text.png" alt="NeuralNest Logo" className="h-14 w-auto object-contain dark:invert dark:brightness-200" />
          <span className="text-xl font-bold tracking-tight text-[#333333] dark:text-white">
            NEURALNEST
          </span>
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl border border-[#EAE8E1] dark:border-border-dark bg-white dark:bg-surface-dark shadow-2xl relative z-10">
        <div className="absolute -top-12 -left-12 w-24 h-24 hidden dark:block bg-accent/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 hidden dark:block bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#333333] dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Join NeuralNest'}
            </h2>
            <p className="text-sm text-[#4A4A4A] dark:text-[#555555] mt-2">
              {mode === 'login' ? 'Sign in to continue your learning journey' : 'Start mastering subjects 10x faster'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              onClick={loginWithGoogle}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-[#EAE8E1] dark:border-border-dark hover:border-[#DFDCD4] dark:hover:border-primary/30 bg-white/60 hover:bg-white dark:bg-elevated-dark dark:hover:bg-elevated-dark/80 text-[#333333] dark:text-text-primary-dark rounded-xl font-medium transition-all duration-300 shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={loginWithGithub}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-[#EAE8E1] dark:border-border-dark hover:border-[#DFDCD4] dark:hover:border-primary/30 bg-white/60 hover:bg-white dark:bg-elevated-dark dark:hover:bg-elevated-dark/80 text-[#333333] dark:text-text-primary-dark rounded-xl font-medium transition-all duration-300 shadow-sm"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-[#EAE8E1] dark:border-border-dark" />
            <span className="flex-shrink mx-4 text-xs font-semibold text-[#555555] dark:text-[#4A4A4A] uppercase tracking-widest">Or</span>
            <div className="flex-grow border-t border-[#EAE8E1] dark:border-border-dark" />
          </div>

          {/* Toggle login / register */}
          <div className="flex border border-[#EAE8E1] dark:border-border-dark rounded-xl overflow-hidden p-1 bg-white/60 dark:bg-elevated-dark">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => handleModeSwitch(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  mode === m
                    ? 'bg-white dark:bg-surface-dark text-[#333333] dark:text-white shadow-sm'
                    : 'text-[#4A4A4A] dark:text-[#555555]'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] dark:text-[#4A4A4A] mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-[#EAE8E1] dark:border-border-dark bg-white/60 dark:bg-elevated-dark text-[#333333] dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary transition-all duration-300"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] dark:text-[#4A4A4A] mb-1.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-[#EAE8E1] dark:border-border-dark bg-white/60 dark:bg-elevated-dark text-[#333333] dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] dark:text-[#4A4A4A] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-10 text-sm rounded-xl border border-[#EAE8E1] dark:border-border-dark bg-white/60 dark:bg-elevated-dark text-[#333333] dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#4A4A4A] dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {displayError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-xs font-semibold text-red-500 dark:text-red-400">{displayError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-primary/20 dark:shadow-accent/20 transition-all duration-300"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-[#4A4A4A] flex items-center justify-center space-x-4">
        <span className="flex items-center">
          <ShieldCheck className="h-4 w-4 text-emerald-500 mr-1.5" />
          Secure & Private
        </span>
      </div>
    </div>
  );
};

export default AuthPage;
