import React from 'react';

const ExplanationLevelCard = ({ level, title, recommended, icon: Icon, active, onClick, points }) => {
  let cardBorderClass = 'border-border-light dark:border-border-dark hover:border-[#DFDCD4] dark:hover:border-primary/30 bg-white/60/50 dark:bg-surface-dark';
  let iconBgClass = 'bg-white/80 dark:bg-elevated-dark text-[#666666]';

  if (active) {
    cardBorderClass = 'border-primary dark:border-accent bg-primary/5 dark:bg-accent/5 shadow-md';
    iconBgClass = 'bg-primary/20 dark:bg-accent/20 text-primary dark:text-accent';
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
          <h3 className="font-bold text-[#333333] dark:text-text-primary-dark">{title}</h3>
          {recommended && (
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full">
              Recommended
            </span>
          )}
        </div>
        <ul className="text-xs text-[#555555] dark:text-text-muted-dark mt-2 space-y-1 list-disc pl-4 text-left">
          {points.map((pt, idx) => (
            <li key={idx}>{pt}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExplanationLevelCard;
