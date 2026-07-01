import React from 'react';

const MasteryRing = ({ progress = 33.7 }) => {
  const r = 32;
  const circ = Math.round(2 * Math.PI * r); // ~201
  const offset = circ - (circ * progress) / 100;
  const displayProgress = Math.round(progress);

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 flex items-center justify-between shadow-sm text-left h-28">
      <div className="space-y-1">
        <h3 className="text-[10px] font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
          Overall Syllabus
        </h3>
        <p className="text-3xl font-extrabold text-[#333333] dark:text-white leading-none mt-0.5">
          {displayProgress}%
        </p>
        <div className="pt-1">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
            Syllabus Covered
          </span>
        </div>
      </div>

      {/* SVG Radial Mastery Ring */}
      <div className="relative h-20 w-20 flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 80 80" className="absolute -rotate-90 w-full h-full">
          <circle cx="40" cy="40" r={r} stroke="currentColor" strokeWidth="6"
            className="text-slate-100 dark:text-[#333333]" fill="transparent" />
          <circle cx="40" cy="40" r={r} stroke="currentColor" strokeWidth="6"
            className="text-emerald-500" fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
      </div>
    </div>
  );
};

export default MasteryRing;
