import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './hooks/useTheme';

import useAuthStore from './stores/useAuthStore';
import GlobalErrorFallback from './components/ui/ErrorFallback';

// Pages
import Landing from './pages/Landing';
import OAuthCallback from './pages/OAuthCallback';
import Onboarding from './pages/Onboarding';
import Roadmap from './pages/Roadmap';
import Tutor from './pages/Tutor';
import Quiz from './pages/Quiz';
import Dashboard from './pages/Dashboard';
import ExamMode from './pages/ExamMode';
import ActiveQuizzes from './pages/ActiveQuizzes';
import Profile from './pages/Profile';

// Spinner shown while session is being restored
const SessionLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#16161F]">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-8 w-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      <p className="text-sm text-slate-400">Loading NeuralNest...</p>
    </div>
  </div>
);

// ─── Route Guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) return <SessionLoader />;
  if (!user) return <Navigate to="/" replace />;
  if (!user.onboarded) return <Navigate to="/onboarding" replace />;
  return children;
};

const OnboardingRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) return <SessionLoader />;
  if (!user) return <Navigate to="/" replace />;
  if (user.onboarded) return <Navigate to="/roadmap" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  if (loading) return <SessionLoader />;
  if (user) return <Navigate to={user.onboarded ? '/roadmap' : '/onboarding'} replace />;
  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { fetchMe } = useAuthStore();

  // Restore session on app mount
  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <ThemeProvider>
      <ErrorBoundary
        FallbackComponent={GlobalErrorFallback}
        onError={(error, info) => {
          console.error('🔥 Uncaught render error:', error, info);
        }}
        onReset={() => window.location.reload()}
      >
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />

            {/* OAuth callbacks */}
            <Route path="/auth/callback/google" element={<OAuthCallback />} />
            <Route path="/auth/callback/github" element={<OAuthCallback />} />
            {/* Legacy callback path — backend may redirect here */}
            <Route path="/auth/callback" element={<OAuthCallback />} />

            {/* Onboarding */}
            <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

            {/* Protected */}
            <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
            <Route path="/tutor/:topicId" element={<ProtectedRoute><Tutor /></ProtectedRoute>} />
            <Route path="/quiz/:topicId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/exam" element={<ProtectedRoute><ExamMode /></ProtectedRoute>} />
            <Route path="/active-quizzes" element={<ProtectedRoute><ActiveQuizzes /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        {/* Global toast notifications — never silent failures */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#1E1E2C',
              color: '#E8E8F2',
              border: '1px solid #2A2A3E',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#1E1E2C' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#1E1E2C' },
              duration: 7000,
            },
          }}
        />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
