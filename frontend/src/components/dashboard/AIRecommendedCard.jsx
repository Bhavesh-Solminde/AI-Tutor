import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

const AIRecommendedCard = ({ 
  topicId = 'virtual-memory',
  topicName = 'Virtual Memory', 
  difficulty = 'Medium',
  estTime = '2h 45m estimated',
  onCtaClick
}) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col justify-between space-y-5 text-left">
      <div className="space-y-1">
        <div className="flex items-center space-x-1.5 text-xs font-mono text-accent dark:text-accent-light uppercase tracking-wider font-bold">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI Recommended Next</span>
        </div>
        <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark">
          Based on your progress and exam timeline
        </p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Cpu/Brain square icon background */}
        <div className="h-12 w-12 rounded-xl bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent flex items-center justify-center flex-shrink-0">
          <Cpu className="h-6 w-6" />
        </div>
        
        <div className="space-y-0.5 overflow-hidden">
          <h4 className="font-bold text-base text-text-base-light dark:text-text-base-dark truncate">
            {topicName}
          </h4>
          <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
            {difficulty} • {estTime}
          </p>
        </div>
      </div>

      <button
        onClick={onCtaClick}
        className="w-full flex items-center justify-center py-2.5 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300"
      >
        <span>Resume Study Pacing</span>
      </button>
    </div>
  );
};

export default AIRecommendedCard;
