import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';

/**
 * OAuth callback page — handles ?token= from Google and GitHub OAuth redirects.
 * Also handles ?error= when OAuth fails.
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuthStore();
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-[#16161F] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="bg-accent/10 p-3 rounded-2xl text-accent w-fit mx-auto">
          <Brain className="h-8 w-8" />
        </div>
        {error ? (
          <>
            <p className="text-red-400 font-semibold text-sm">{error}</p>
            <p className="text-slate-500 text-xs">Redirecting you back...</p>
          </>
        ) : (
          <>
            <div className="h-6 w-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Signing you in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
