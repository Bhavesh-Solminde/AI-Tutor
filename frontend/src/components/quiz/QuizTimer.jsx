import React from 'react';
import { Timer } from 'lucide-react';

const QuizTimer = ({ seconds, maxSeconds = 60, formattedTime }) => {
  const percentRemaining = (seconds / maxSeconds) * 100;
  
  let progressColor = 'bg-primary dark:bg-accent';
  if (percentRemaining < 25) {
    progressColor = 'bg-red-500 animate-pulse';
  } else if (percentRemaining < 50) {
    progressColor = 'bg-amber-500';
  }

  return (
    <div className="flex items-center space-x-3 bg-white/60 dark:bg-elevated-dark px-3 py-1.5 rounded-xl border border-slate-100 dark:border-border-dark flex-shrink-0">
      <Timer className={`h-4 w-4 ${percentRemaining < 25 ? 'text-red-500 animate-spin-slow' : 'text-text-muted-light dark:text-text-muted-dark'}`} />
      
      <div className="flex flex-col space-y-1">
        <span className="text-xs font-mono font-bold text-text-base-light dark:text-text-base-dark w-10 text-center">
          {formattedTime}
        </span>
        <div className="w-16 h-1 bg-slate-200 dark:bg-border-dark rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${progressColor}`} 
            style={{ width: `${percentRemaining}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default QuizTimer;
