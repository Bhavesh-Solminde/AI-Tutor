import React from 'react';
import { Heart, Flame } from 'lucide-react';

const LivesBar = ({ lives, maxLives = 5, xp }) => {
  return (
    <div className="flex items-center space-x-5">
      <div className="flex items-center space-x-1.5">
        {Array.from({ length: maxLives }).map((_, idx) => (
          <Heart
            key={idx}
            className={`h-5 w-5 ${
              idx < lives
                ? 'text-red-500 fill-red-500'
                : 'text-slate-300 dark:text-slate-700'
            } transition-colors duration-300`}
          />
        ))}
      </div>
      <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold border border-amber-500/20">
        <Flame className="h-4 w-4" />
        <span>{xp} XP</span>
      </div>
    </div>
  );
};

export default LivesBar;
