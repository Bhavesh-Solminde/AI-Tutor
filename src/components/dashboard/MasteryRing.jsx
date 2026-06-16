import React from 'react';

const MasteryRing = ({ progress = 33.7 }) => {
  const circ = 201; // 2 * PI * r = 2 * 3.14159 * 32
  const offset = circ - (circ * progress) / 100;

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 flex items-center justify-between shadow-sm text-left h-28">
      <div className="space-y-1">
        <h3 className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Overall Syllabus</h3>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{progress}%</p>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">of syllabus covered</p>
      </div>
      
      {/* SVG Radial Mastery Ring */}
      <div className="relative h-20 w-20 flex items-center justify-center flex-shrink-0">
        <svg className="absolute transform -rotate-90 w-full h-full">
          <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" fill="transparent" />
          <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="6" className="text-emerald-500" fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
      </div>
    </div>
  );
};

export default MasteryRing;
