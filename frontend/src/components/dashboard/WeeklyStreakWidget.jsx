import React from 'react';
import { Zap } from 'lucide-react';
import { getXpLevel } from '../../utils/xpLevels';

const WeeklyStreakWidget = ({ streakDays = 4, xpToday = 180, totalXp = 0 }) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 flex items-center justify-between shadow-sm text-left h-28 group hover:border-amber-500/50 transition-colors">
      <div className="space-y-1">
        <h3 className="text-[10px] font-semibold text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Weekly Streak</h3>
        <p className="text-3xl font-extrabold text-[#333333] dark:text-white leading-none mt-0.5">
          {streakDays} {streakDays === 1 ? 'Day' : 'Days'}
        </p>
        <div className="flex items-center space-x-2 pt-1">
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">+{xpToday} XP</span>
          <span className={`text-[10px] font-bold truncate ${getXpLevel(totalXp).color}`}>
            {getXpLevel(totalXp).emoji} {getXpLevel(totalXp).title}
          </span>
        </div>
      </div>
      <div className="h-14 w-14 rounded-full bg-amber-500/10 flex-shrink-0 flex items-center justify-center text-amber-500 shadow-[0_0_15px_-3px_rgba(245,158,11,0.2)] relative group-hover:scale-105 transition-transform">
        <Zap className="h-6 w-6 fill-current" />
      </div>
    </div>
  );
};

export default WeeklyStreakWidget;
