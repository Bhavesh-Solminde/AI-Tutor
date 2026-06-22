import React from 'react';
import { Zap, Flame, CheckCircle } from 'lucide-react';
import { getXpLevel } from '../../utils/xpLevels';

const UserProfileCard = ({ user, streakDays = 0, topicsDone = 0 }) => {
  const name = user?.name || 'Guest Scholar';
  const email = user?.email || 'aryan.sharma@college.edu';
  
  // Use real fields from the DB — user.xp is the actual field name
  const totalXP = user?.xp ?? user?.totalXp ?? 0;

  return (
    <div className="flex flex-col items-center justify-center text-center py-6">
      {/* Large Avatar */}
      <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl flex-shrink-0 bg-slate-100 dark:bg-slate-900">
        <img
          src="/aryan_avatar.png"
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B6BFF&color=fff&size=128`;
          }}
        />
      </div>

      {/* User Details */}
      <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mt-4 tracking-tight">{name}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{email}</p>

      {/* Mastery Badge — dynamic based on XP */}
      {(() => {
        const level = getXpLevel(totalXP);
        return (
          <div className={`mt-3 flex items-center space-x-1 px-3.5 py-1.5 bg-amber-500/10 ${level.color} border border-amber-500/20 rounded-full text-xs font-bold shadow-sm`}>
            <span>{level.emoji}</span>
            <span>{level.title}</span>
          </div>
        );
      })()}

      {/* Row of 3 Stats */}
      <div className="mt-8 flex flex-wrap justify-center items-center gap-10 md:gap-14 w-full px-4">
        {/* Stat 1: Total XP */}
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <Zap className="h-6 w-6 text-primary fill-primary/10 dark:text-accent dark:fill-accent/10" />
          <span className="text-xl md:text-2xl font-extrabold text-primary dark:text-accent tracking-tight">
            {totalXP.toLocaleString()}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total XP
          </span>
        </div>

        {/* Stat 2: Current Streak */}
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <Flame className="h-6 w-6 text-primary fill-primary/10 dark:text-accent dark:fill-accent/10" />
          <span className="text-xl md:text-2xl font-extrabold text-primary dark:text-accent tracking-tight">
            {streakDays} Days
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Current Streak
          </span>
        </div>

        {/* Stat 3: Topics Done */}
        <div className="flex flex-col items-center justify-center text-center space-y-1">
          <CheckCircle className="h-6 w-6 text-emerald-500 fill-emerald-500/10" />
          <span className="text-xl md:text-2xl font-extrabold text-emerald-500 tracking-tight">
            {topicsDone}
          </span>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Topics Done
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
