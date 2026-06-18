import React from 'react';

/**
 * Reusable loading skeletons for different sections.
 */

// Generic pulsing bar
const Pulse = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg ${className}`} />
);

// Dashboard stats ring skeleton
export const MasteryRingSkeleton = () => (
  <div className="p-6 border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark animate-pulse space-y-4">
    <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto" />
    <Pulse className="h-4 w-24 mx-auto" />
    <Pulse className="h-3 w-16 mx-auto" />
  </div>
);

// Dashboard topic table skeleton
export const TopicTableSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border border-border-light dark:border-border-dark rounded-xl">
        <Pulse className="h-4 w-4 rounded-full flex-shrink-0" />
        <Pulse className="h-4 flex-1" />
        <Pulse className="h-4 w-20" />
        <Pulse className="h-4 w-16" />
      </div>
    ))}
  </div>
);

// Roadmap node skeleton
export const RoadmapSkeleton = () => (
  <div className="w-full h-[400px] flex items-center justify-center space-x-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse space-y-2">
        <div className="w-36 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700" />
        <Pulse className="h-3 w-24 mx-auto" />
      </div>
    ))}
  </div>
);

// Quiz question skeleton
export const QuizSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="p-6 border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark space-y-4">
      <Pulse className="h-5 w-3/4" />
      <Pulse className="h-4 w-1/2" />
      <div className="space-y-3 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <Pulse key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

// Chat history list skeleton
export const ChatHistorySkeleton = () => (
  <div className="space-y-1.5 animate-pulse">
    {[1, 2, 3].map((i) => (
      <Pulse key={i} className="h-7 w-full rounded-lg" />
    ))}
  </div>
);

// Mastery rating slider skeleton (Onboarding step 3)
export const MasterySliderSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-4 border border-border-light dark:border-border-dark rounded-xl space-y-3">
        <Pulse className="h-4 w-48" />
        <Pulse className="h-3 w-full rounded-full" />
      </div>
    ))}
  </div>
);

// Generic card skeleton
export const CardSkeleton = ({ lines = 3 }) => (
  <div className="p-6 border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark animate-pulse space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <Pulse key={i} className={`h-4 ${i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
    ))}
  </div>
);
