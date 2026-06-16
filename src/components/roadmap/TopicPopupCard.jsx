import React from 'react';
import { Clock, BarChart2, Target } from 'lucide-react';

const TopicPopupCard = ({ topic, onClose, onStart, onQuiz }) => {
  const isMastered = topic.status === 'mastered';
  const isLearning = topic.status === 'learning';

  const getStatusBadge = () => {
    if (isMastered) {
      return <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-extrabold uppercase rounded-lg">Mastered</span>;
    } else if (isLearning) {
      return <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-extrabold uppercase rounded-lg">In Progress</span>;
    } else {
      return <span className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-extrabold uppercase rounded-lg">Locked</span>;
    }
  };

  return (
    <div className="absolute left-1/2 bottom-8 -translate-x-1/2 w-full max-w-[380px] bg-white/95 dark:bg-surface-dark/95 border border-slate-100 dark:border-border-dark p-6 rounded-3xl shadow-2xl z-30 transition-all duration-300 text-left flex flex-col space-y-5 backdrop-blur-md">
      
      {/* Title & Badge */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight pr-2">
          {topic.name}
        </h3>
        <div className="flex-shrink-0">
          {getStatusBadge()}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Time */}
        <div className="border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-elevated-dark/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 flex items-center mb-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Time</span>
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
            {topic.timeEst || '2h 45m'}
          </span>
        </div>

        {/* Level */}
        <div className="border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-elevated-dark/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 flex items-center mb-1">
            <BarChart2 className="h-3 w-3 mr-1" />
            <span>Level</span>
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-white">
            {topic.difficulty || 'Medium'}
          </span>
        </div>

        {/* Mastery */}
        <div className="border border-slate-100 dark:border-border-dark bg-slate-50/50 dark:bg-elevated-dark/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 flex items-center mb-1">
            <Target className="h-3.5 w-3.5 mr-1" />
            <span>Mastery</span>
          </span>
          <span className="text-xs font-bold text-emerald-500 font-mono">
            {topic.mastery}%
          </span>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col space-y-2.5">
        <button
          onClick={() => onStart(topic)}
          className="w-full py-2.5 bg-cta hover:bg-cta-hover text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/10 transition-all duration-300"
        >
          Start Learning
        </button>
        <button
          onClick={() => onQuiz ? onQuiz(topic) : onStart(topic)}
          className="w-full py-2.5 border border-[#3B6BFF] hover:bg-primary/5 text-[#3B6BFF] text-sm font-bold rounded-2xl transition-all duration-300"
        >
          Test my Skills
        </button>
      </div>

      {/* Close button at top corner or underneath */}
      <button 
        onClick={onClose}
        className="absolute top-2 right-4 text-xs font-mono font-bold text-slate-300 hover:text-slate-500 focus:outline-none"
      >
        [x]
      </button>
    </div>
  );
};

export default TopicPopupCard;
