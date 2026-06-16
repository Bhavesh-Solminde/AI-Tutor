import React from 'react';
import { Zap } from 'lucide-react';

const WeeklyStreakWidget = ({ streakDays = 4, xpToday = 180 }) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 flex flex-col justify-between shadow-sm text-left h-28">
      <div className="space-y-1">
        <h3 className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Weekly Streak</h3>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none mt-0.5">{streakDays} Days</p>
      </div>

      <div className="mt-2.5">
        <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-bold shadow-sm">
          <Zap className="h-3.5 w-3.5 fill-current" />
          <span>+{xpToday} XP today</span>
        </span>
      </div>
    </div>
  );
};

export default WeeklyStreakWidget;
