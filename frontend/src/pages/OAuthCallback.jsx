import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

/**
 * OAuth callback page — handles ?token= from Google and GitHub OAuth redirects.
 * Also handles ?error= when OAuth fails.
 *
 * Theme is read directly from document.documentElement.classList so it works
 * whether dark mode is toggled at runtime or baked in at build time.
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuthStore();
  const [error, setError] = useState('');

  // Detect current theme from the <html> class — updates if toggled
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err) {
      setError(
        err === 'auth_failed'
          ? 'Sign-in was cancelled or failed. Please try again.'
          : 'Authentication error. Please try again.'
      );
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!token) {
      setError('No authentication token received. Please try signing in again.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    handleOAuthCallback(token)
      .then((user) => navigate(user?.onboarded ? '/roadmap' : '/onboarding'))
      .catch(() => {
        setError('Failed to verify your account. Please try again.');
        setTimeout(() => navigate('/'), 3000);
      });
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div
      className="min-h-screen flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor: isDark ? '#111118' : '#F5F4F0' }}
    >
      <div className="text-center space-y-5">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img
            src="/logo_without_text.png"
            alt="NeuralNest"
            className="h-14 w-14 rounded-2xl object-contain"
            style={{ filter: isDark ? 'none' : 'brightness(0.95)' }}
          />
        </div>

        {/* Wordmark */}
        <p
          className="text-base font-bold tracking-tight"
          style={{ color: isDark ? '#E8E6E1' : '#1A1A2E' }}
        >
          NeuralNest
        </p>

        {error ? (
          <div className="space-y-1">
            <p className="text-red-500 font-semibold text-sm">{error}</p>
            <p style={{ color: isDark ? '#666677' : '#888899' }} className="text-xs">
              Redirecting you back…
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Spinner — colour matches accent */}
            <div
              className="h-5 w-5 rounded-full border-2 animate-spin mx-auto"
              style={{
                borderColor: isDark ? 'rgba(99,117,255,0.25)' : 'rgba(59,107,255,0.2)',
                borderTopColor: isDark ? '#6375FF' : '#3B6BFF',
              }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: isDark ? '#888899' : '#666677' }}
            >
              Signing you in…
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
