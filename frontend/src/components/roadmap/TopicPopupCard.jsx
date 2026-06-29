import React from 'react';
import { Clock, BarChart2, Target, X } from 'lucide-react';

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
        <h3 className="text-lg font-bold text-[#333333] dark:text-white leading-tight pr-2">
          {topic.name}
        </h3>
        <div className="flex flex-shrink-0 items-center space-x-4">
          {getStatusBadge()}
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#666666] hover:text-[#333333] dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-elevated-dark transition-colors focus:outline-none"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-3">
        {/* Time */}
        <div className="border border-slate-100 dark:border-border-dark bg-white/60/50 dark:bg-elevated-dark/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-sans font-bold text-[#555555] dark:text-[#666666] flex items-center mb-1">
            <Clock className="h-4 w-4 mr-1.5 text-blue-500/70 dark:text-blue-400/80" />
            <span>Time</span>
          </span>
          <span className="text-sm font-bold text-[#333333] dark:text-white">
            {topic.timeEst || '2h 45m'}
          </span>
        </div>

        {/* Level */}
        <div className="border border-slate-100 dark:border-border-dark bg-white/60/50 dark:bg-elevated-dark/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-sans font-bold text-[#555555] dark:text-[#666666] flex items-center mb-1">
            <BarChart2 className="h-4 w-4 mr-1.5 text-purple-500/70 dark:text-purple-400/80" />
            <span>Level</span>
          </span>
          <span className="text-sm font-bold text-[#333333] dark:text-white">
            {topic.difficulty || 'Medium'}
          </span>
        </div>

        {/* Mastery */}
        <div className="border border-slate-100 dark:border-border-dark bg-white/60/50 dark:bg-elevated-dark/20 rounded-2xl p-3 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] font-sans font-bold text-[#555555] dark:text-[#666666] flex items-center mb-1">
            <Target className="h-4 w-4 mr-1.5 text-emerald-500/70 dark:text-emerald-400/80" />
            <span>Mastery</span>
          </span>
          <span className="text-sm font-bold text-emerald-500">
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
    </div>
  );
};

export default TopicPopupCard;
