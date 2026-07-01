import React from 'react';
import { Cpu, Sparkles, Lightbulb } from 'lucide-react';

const DIFFICULTY_COLORS = {
  hard:   'text-red-500 bg-red-50 dark:bg-red-900/20',
  medium: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
  easy:   'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
};

const AIRecommendedCard = ({
  topicId = '',
  topicName = 'Virtual Memory',
  difficulty = 'medium',
  estTime = 'Est. 30m',
  reason = '',
  onCtaClick,
}) => {
  const diffCls = DIFFICULTY_COLORS[difficulty?.toLowerCase()] || DIFFICULTY_COLORS.medium;

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col justify-between space-y-5 text-left">
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-accent dark:text-accent-light uppercase tracking-wider font-bold">
          <Sparkles className="h-4 w-4 text-primary" />
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
          <h4 className="font-bold text-base text-text-base-light dark:text-text-base-dark truncate">
            {topicName}
          </h4>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md capitalize ${diffCls}`}>
              {difficulty}
            </span>
            <span className="text-xs text-text-muted-light dark:text-text-muted-dark">{estTime}</span>
          </div>
          {reason && (
            <p className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              <Lightbulb className="h-3 w-3 flex-shrink-0" />
              {reason}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={onCtaClick}
        className="w-full flex items-center justify-center py-2.5 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300"
      >
        <span>Start Studying</span>
      </button>
    </div>
  );
};

export default AIRecommendedCard;
