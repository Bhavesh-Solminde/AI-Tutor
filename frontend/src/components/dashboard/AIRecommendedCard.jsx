import React, { useState } from 'react';
import { Cpu, Sparkles, Lightbulb, AlertTriangle, X, ArrowRight, BookOpen } from 'lucide-react';

const DIFFICULTY_COLORS = {
  hard:   'text-red-500 bg-red-50 dark:bg-red-900/20',
  medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  easy:   'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
};

/**
 * AIRecommendedCard
 *
 * Shows the top AI-recommended next topic. If the topic has unmet prerequisites,
 * clicking "Start Studying" shows a warning modal instead of navigating directly.
 * The user can dismiss and go study the prerequisites, or override and continue anyway.
 */
const AIRecommendedCard = ({
  topicId = '',
  topicName = 'Virtual Memory',
  difficulty = 'medium',
  estTime = 'Est. 30m',
  reason = '',
  unmetPrerequisites = [],
  onCtaClick,
}) => {
  const diffCls = DIFFICULTY_COLORS[difficulty?.toLowerCase()] || DIFFICULTY_COLORS.medium;
  const [showWarning, setShowWarning] = useState(false);

  const handleStartClick = () => {
    if (unmetPrerequisites.length > 0) {
      setShowWarning(true);
    } else {
      onCtaClick?.();
    }
  };

  return (
    <>
      <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col justify-between space-y-5 text-left">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-[10px] font-semibold text-primary uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>AI Recommended Next</span>
          </div>
          <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark">
            Based on your quiz performance &amp; exam timeline
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent flex items-center justify-center flex-shrink-0">
            <Cpu className="h-6 w-6" />
          </div>
          <div className="space-y-1 overflow-hidden flex-1">
            <h4 className="font-bold text-base text-[#333333] dark:text-white truncate">
              {topicName}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize ${diffCls}`}>
                {difficulty}
              </span>
              <span className="text-xs text-text-muted-light dark:text-text-muted-dark">{estTime}</span>
            </div>

            {/* Unmet prerequisites badge */}
            {unmetPrerequisites.length > 0 && (
              <p className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                {unmetPrerequisites.length} prerequisite{unmetPrerequisites.length > 1 ? 's' : ''} not completed
              </p>
            )}

            {/* Normal reason (only shown if no prereq warning) */}
            {reason && unmetPrerequisites.length === 0 && (
              <p className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                <Lightbulb className="h-3 w-3 flex-shrink-0" />
                {reason}
              </p>
            )}
          </div>
        </div>

        <button
          id="ai-rec-start-btn"
          onClick={handleStartClick}
          className="w-full flex items-center justify-center py-2.5 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-full shadow-md transition-all duration-300"
        >
          <span>Start Studying</span>
        </button>
      </div>

      {/* ── Prerequisite Warning Modal ──────────────────────────────────────── */}
      {showWarning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowWarning(false); }}
        >
          <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-[fadeIn_0.18s_ease]">
            {/* Close */}
            <button
              onClick={() => setShowWarning(false)}
              className="absolute top-4 right-4 text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#333333] dark:text-white">
                  Prerequisites not completed
                </h3>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
                  <span className="font-semibold text-[#333333] dark:text-white">{topicName}</span> builds on
                  topics you haven't mastered yet. Jumping ahead may make it harder to understand.
                </p>
              </div>
            </div>

            {/* Unmet prereq list */}
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                Study these first:
              </p>
              {unmetPrerequisites.map((prereq, i) => (
                <div key={i} className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-xs font-medium text-amber-800 dark:text-amber-300">{prereq}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={() => setShowWarning(false)}
                className="w-full py-2.5 rounded-full bg-primary hover:opacity-90 text-white text-xs font-bold transition-all shadow-md"
              >
                Got it — I'll study prerequisites first
              </button>
              <button
                id="prereq-override-btn"
                onClick={() => { setShowWarning(false); onCtaClick?.(); }}
                className="w-full py-2 rounded-full border border-border-light dark:border-border-dark text-xs font-medium text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark hover:border-primary/40 transition-all flex items-center justify-center gap-1.5"
              >
                Continue anyway <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIRecommendedCard;
