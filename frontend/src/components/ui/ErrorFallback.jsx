import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * Global error boundary fallback — shown when a rendering crash occurs.
 * Never shows a blank white screen.
 */
export default function GlobalErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-[#16161F] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Something went wrong</h1>
          <p className="text-sm text-slate-400">
            {error?.message && !error.message.includes('chunk')
              ? error.message
              : 'An unexpected error occurred. Your progress has been saved.'}
          </p>
        </div>
        {process.env.NODE_ENV !== 'production' && error?.stack && (
          <details className="text-left">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
              Technical details
            </summary>
            <pre className="mt-2 text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-3 overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center space-x-2 px-4 py-2.5 border border-slate-700 hover:border-slate-600 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline error fallback for per-section errors (not full-page crashes).
 */
export function InlineErrorFallback({ error, resetErrorBoundary, message }) {
  return (
    <div className="w-full p-6 rounded-2xl border border-red-500/20 bg-red-500/5 text-center space-y-4">
      <div className="flex items-center justify-center space-x-2 text-red-400">
        <AlertTriangle className="h-5 w-5" />
        <p className="text-sm font-semibold">
          {message || error?.message || 'Failed to load this section.'}
        </p>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/20 transition-colors"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );
}
