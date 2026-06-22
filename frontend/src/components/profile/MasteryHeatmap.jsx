import React from 'react';

const MasteryHeatmap = ({ heatmapDays }) => {
  const getHeatmapColor = (level) => {
    switch (level) {
      case 1: return 'bg-primary/25 dark:bg-accent/20';
      case 2: return 'bg-primary/50 dark:bg-accent/40';
      case 3: return 'bg-primary/75 dark:bg-accent/65';
      case 4: return 'bg-primary dark:bg-accent';
      default: return 'bg-slate-100 dark:bg-slate-800/80';
    }
  };

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm space-y-4 text-left">
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Study Activity — Last 12 Weeks</h3>
      </div>
      
      <div className="flex flex-col space-y-4">
        {/* Weekly Grid: 7 rows of days, columns-first layout */}
        <div className="flex justify-start overflow-x-auto pb-1 scrollbar-thin">
          <div className="grid grid-flow-col grid-rows-7 gap-1.5">
            {heatmapDays.map((level, i) => (
              <div
                key={i}
                className={`h-3.5 w-3.5 rounded-[3px] transition-colors duration-300 ${getHeatmapColor(level)}`}
                title={`Study day: ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center space-x-2 text-xs text-slate-400 dark:text-slate-500 pr-2">
          <span>Less</span>
          <div className="w-3 h-3 rounded-[2px] bg-slate-100 dark:bg-slate-800/80" />
          <div className="w-3 h-3 rounded-[2px] bg-primary/25 dark:bg-accent/20" />
          <div className="w-3 h-3 rounded-[2px] bg-primary/50 dark:bg-accent/40" />
          <div className="w-3 h-3 rounded-[2px] bg-primary/75 dark:bg-accent/65" />
          <div className="w-3 h-3 rounded-[2px] bg-primary dark:bg-accent" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default MasteryHeatmap;
