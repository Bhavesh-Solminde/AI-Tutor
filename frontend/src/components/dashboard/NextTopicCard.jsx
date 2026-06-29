import React from 'react';

const NextTopicCard = ({ 
  title = "Continue Where You Left Off",
  subtitle = "Memory Management — Page 14 of 32",
  progress = 44,
  onResume,
  onTakeQuiz
}) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col justify-between space-y-5 text-left">
      <div className="space-y-3.5">
        <div className="space-y-1">
          <h4 className="font-mono text-xs text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider font-bold">
            {title}
          </h4>
          <p className="text-sm font-bold text-text-base-light dark:text-text-base-dark">
            {subtitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-white/80 dark:bg-border-dark rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary dark:bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-end">
            <span className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark">{progress}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onResume}
          className="py-2.5 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300 text-center"
        >
          Resume
        </button>
        <button
          onClick={onTakeQuiz}
          className="py-2.5 border border-border-light dark:border-border-dark hover:bg-white/60 dark:hover:bg-elevated-dark text-text-base-light dark:text-text-base-dark text-xs font-bold rounded-xl transition-all duration-300 text-center"
        >
          Take Quiz
        </button>
      </div>
    </div>
  );
};

export default NextTopicCard;
