import React from 'react';

const ExplanationLevelCard = ({ level, title, recommended, icon: Icon, active, onClick, points }) => {
  let cardBorderClass = 'border-border-light dark:border-border-dark hover:border-slate-300 dark:hover:border-primary/30 bg-slate-50/50 dark:bg-surface-dark';
  let iconBgClass = 'bg-slate-100 dark:bg-elevated-dark text-slate-400';

  if (active) {
    if (level === 'beginner') {
      cardBorderClass = 'border-emerald-500 dark:border-emerald-500 bg-emerald-500/5 shadow-md';
      iconBgClass = 'bg-emerald-500/20 text-emerald-500';
    } else if (level === 'intermediate') {
      cardBorderClass = 'border-yellow-500 dark:border-yellow-500 bg-yellow-500/5 shadow-md';
      iconBgClass = 'bg-yellow-500/20 text-yellow-500';
    } else {
      cardBorderClass = 'border-purple-500 dark:border-purple-500 bg-purple-500/5 shadow-md';
      iconBgClass = 'bg-purple-500/20 text-purple-500';
    }
  }

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 relative flex items-start space-x-4 ${cardBorderClass}`}
    >
      <div className={`p-2 rounded-xl flex-shrink-0 ${iconBgClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h3 className="font-bold text-slate-900 dark:text-text-primary-dark">{title}</h3>
          {recommended && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full">
              Recommended
            </span>
          )}
        </div>
        <ul className="text-xs text-slate-500 dark:text-text-muted-dark mt-2 space-y-1 list-disc pl-4 text-left">
          {points.map((pt, idx) => (
            <li key={idx}>{pt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExplanationLevelCard;
