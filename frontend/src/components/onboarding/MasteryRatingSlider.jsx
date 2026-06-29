import React from 'react';

const MasteryRatingSlider = ({ topic, rating, onChange }) => {
  return (
    <div className="p-4 rounded-xl border border-border-light dark:border-border-dark bg-white/60 dark:bg-surface-dark space-y-3">
      <div className="flex justify-between items-center text-left">
        <span className="text-sm font-semibold text-[#333333] dark:text-text-primary-dark">{topic}</span>
        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent">
          Familiarity: {rating}/3
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-xs text-[#666666]">Beginner</span>
        <input
          type="range"
          min="1"
          max="3"
          step="1"
          value={rating}
          onChange={(e) => onChange(topic, e.target.value)}
          className="flex-1 h-1.5 bg-slate-200 dark:bg-border-dark rounded-lg appearance-none cursor-pointer accent-primary dark:accent-primary"
        />
        <span className="text-xs text-[#666666]">Expert</span>
      </div>
    </div>
  );
};

export default MasteryRatingSlider;
