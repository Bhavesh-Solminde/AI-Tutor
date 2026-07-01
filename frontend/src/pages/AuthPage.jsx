import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, ShieldCheck, CheckCircle2, XCircle, Circle } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import { useTheme } from '../hooks/useTheme';

// ─── Validation helpers ────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateName(v) {
  if (!v.trim()) return 'Name is required.';
  if (v.trim().length < 2) return 'Name must be at least 2 characters.';
  if (v.trim().length > 50) return 'Name must not exceed 50 characters.';
  if (!/^[a-zA-Z\s\-'.]+$/.test(v.trim())) return 'Name contains invalid characters.';
  return '';
}

function validateEmail(v) {
  if (!v.trim()) return 'Email is required.';
  if (!EMAIL_RE.test(v.trim())) return 'Please enter a valid email address.';
  return '';
}

function validatePassword(v, isRegister) {
  if (!v) return 'Password is required.';
  if (v.length < 8) return 'Password must be at least 8 characters.';
  if (!isRegister) return '';
  if (v.length > 128) return 'Password must not exceed 128 characters.';
  if (!/[A-Z]/.test(v)) return 'Must include at least one uppercase letter.';
  if (!/[a-z]/.test(v)) return 'Must include at least one lowercase letter.';
  if (!/[0-9]/.test(v)) return 'Must include at least one number.';
  return '';
}

function validateConfirmPassword(v, password) {
  if (!v) return 'Please confirm your password.';
  if (v !== password) return 'Passwords do not match.';
  return '';
}

// ─── Password strength meter ───────────────────────────────────────────────────

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#EF4444' };
  if (score === 3) return { score, label: 'Fair', color: '#F59E0B' };
  if (score === 4) return { score, label: 'Good', color: '#3B82F6' };
  return { score, label: 'Strong', color: '#10B981' };
}

// ─── Password requirement row ──────────────────────────────────────────────────

function Requirement({ met, text }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${met ? 'text-emerald-500' : 'text-[#777777]'}`}>
      {met
        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        : <Circle className="h-3.5 w-3.5 shrink-0" />
      }
      <span>{text}</span>
    </div>
  );
}

// ─── Field error message ───────────────────────────────────────────────────────

function FieldError({ msg }) {
  if (!msg || msg.trim() === '') return null;
  return (
    <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-500 dark:text-red-400 animate-[fadeIn_0.2s_ease]">
      <XCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

// ─── Input class helper ────────────────────────────────────────────────────────

function inputCls(hasError) {
  return `w-full px-4 py-3 text-sm rounded-xl border ${
    hasError
      ? 'border-red-400 dark:border-red-500 bg-red-50/40 dark:bg-red-900/10 focus:border-red-400 dark:focus:border-red-500'
      : 'border-[#EAE8E1] dark:border-border-dark bg-white/60 dark:bg-elevated-dark focus:border-primary dark:focus:border-primary'
  } text-[#333333] dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none transition-all duration-300`;
}

// ─── AuthPage ──────────────────────────────────────────────────────────────────

const AuthPage = () => {
  const { loginWithGoogle, loginWithGithub, loginWithEmail, register, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isRegisterPage = location.pathname === '/register';
  const [mode, setMode] = useState(isRegisterPage ? 'register' : 'login');

  // Field values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Per-field errors (set on blur or submit)
  const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  // Fields that have been touched (blurred at least once)
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false });

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { theme } = useTheme();
  const passwordStrength = getPasswordStrength(password);
  const isRegister = mode === 'register';

  // Sync mode with URL
  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
    resetForm();
  }, [location.pathname]);

  // Force light mode on auth page
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    return () => {
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      }
    };
  }, [theme]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFieldErrors({ name: '', email: '', password: '', confirmPassword: '' });
    setTouched({ name: false, email: false, password: false, confirmPassword: false });
    setServerError('');
    clearError();
  };

  // Live validation after a field is touched
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':    return validateName(value);
      case 'email':   return validateEmail(value);
      case 'password': return validatePassword(value, isRegister);
      case 'confirmPassword': return validateConfirmPassword(value, password);
      default: return '';
    }
  }, [isRegister, password]);

  // Re-validate confirmPassword live if password changes
  useEffect(() => {
    if (touched.confirmPassword) {
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: validateConfirmPassword(confirmPassword, password),
      }));
    }
    if (touched.password) {
      setFieldErrors(prev => ({
        ...prev,
        password: validatePassword(password, isRegister),
      }));
    }
  }, [password, confirmPassword, touched.confirmPassword, touched.password, isRegister]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = { name, email, password, confirmPassword }[field];
    setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleChange = (field, value) => {
    const setters = { name: setName, email: setEmail, password: setPassword, confirmPassword: setConfirmPassword };
    setters[field](value);
    setServerError('');
    // Clear error as user types (only if already touched)
    if (touched[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  // Run all validations and return whether form is valid
  const validateAll = () => {
    const errors = {
      name: isRegister ? validateName(name) : '',
      email: validateEmail(email),
      password: validatePassword(password, isRegister),
      confirmPassword: isRegister ? validateConfirmPassword(confirmPassword, password) : '',
    };
    setFieldErrors(errors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    clearError();
    if (!validateAll()) return;

    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await register({ email: email.trim(), password, name: name.trim() });
      } else {
        user = await loginWithEmail({ email: email.trim(), password });
      }
      navigate(user?.onboarded ? '/roadmap' : '/onboarding');
    } catch (err) {
      // Try to use field-level errors from backend
      const fieldErrs = err?.response?.data?.fieldErrors;
      if (fieldErrs) {
        setFieldErrors(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(fieldErrs).map(([k, v]) => [k, String(v).trim()])
          ),
        }));
      }
      const msg = err?.response?.data?.error
        || err?.userMessage
        || err?.message
        || 'Authentication failed. Please try again.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (m) => {
    navigate(m === 'register' ? '/register' : '/login');
  };

  return (
    <div className="min-h-screen bg-[#F6F5F1] dark:bg-background-dark text-[#333333] dark:text-text-primary-dark transition-colors duration-300 relative overflow-hidden flex flex-col justify-center items-center py-12 px-6">
      <div className="absolute inset-0 grid-backdrop pointer-events-none opacity-0 dark:opacity-40" />

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-20">
        <Link to="/" className="flex items-center space-x-3 group">
          <img src="/logo_without_text.png" alt="NeuralNest Logo" className="h-14 w-auto object-contain dark:invert dark:brightness-200" />
          <span className="text-xl font-bold tracking-tight text-[#333333] dark:text-white">NEURALNEST</span>
        </Link>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl border border-[#EAE8E1] dark:border-border-dark bg-white dark:bg-surface-dark shadow-2xl relative z-10">
        <div className="absolute -top-12 -left-12 w-24 h-24 hidden dark:block bg-accent/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 hidden dark:block bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[#333333] dark:text-white">
              {isRegister ? 'Join NeuralNest' : 'Welcome back'}
            </h2>
            <p className="text-sm text-[#4A4A4A] dark:text-[#555555] mt-2">
              {isRegister ? 'Start mastering subjects 10x faster' : 'Sign in to continue your learning journey'}
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

          {/* Mode toggle */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name — register only */}
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] dark:text-[#4A4A4A] mb-1.5">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={inputCls(!!fieldErrors.name)}
                />
                <FieldError msg={fieldErrors.name} />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] dark:text-[#4A4A4A] mb-1.5">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                className={inputCls(!!fieldErrors.email)}
              />
              <FieldError msg={fieldErrors.email} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] dark:text-[#4A4A4A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  placeholder={isRegister ? 'Min. 8 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`${inputCls(!!fieldErrors.password)} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#333333] dark:hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError msg={fieldErrors.password} />

              {/* Password strength — register only, shows after typing */}
              {isRegister && password.length > 0 && (
                <div className="mt-2.5 space-y-2">
                  {/* Strength bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor:
                              passwordStrength.score >= i * 1.5
                                ? passwordStrength.color
                                : '#E5E7EB',
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="text-xs font-semibold min-w-[42px] text-right transition-colors duration-300"
                      style={{ color: passwordStrength.color || '#9CA3AF' }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  {/* Requirements checklist */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <Requirement met={password.length >= 8} text="8+ characters" />
                    <Requirement met={/[A-Z]/.test(password)} text="Uppercase letter" />
                    <Requirement met={/[a-z]/.test(password)} text="Lowercase letter" />
                    <Requirement met={/[0-9]/.test(password)} text="Number" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password — register only */}
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#555555] dark:text-[#4A4A4A] mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    onBlur={() => handleBlur('confirmPassword')}
                    className={`${inputCls(!!fieldErrors.confirmPassword)} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#333333] dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <FieldError msg={fieldErrors.confirmPassword} />
              </div>
            )}

            {/* Server / global error */}
            {serverError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-red-500 dark:text-red-400">{serverError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="auth-submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-primary/20 dark:shadow-accent/20 transition-all duration-300"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
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
          Secure &amp; Private
        </span>
      </div>
    </div>
  );
};

export default AuthPage;
