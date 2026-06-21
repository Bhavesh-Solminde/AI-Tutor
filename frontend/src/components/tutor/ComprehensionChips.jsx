import React from 'react';
import { ThumbsUp, HelpCircle, Zap } from 'lucide-react';

const ComprehensionChips = ({ onChipClick }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-left">
      <button
        onClick={() => onChipClick('understood')}
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition duration-200"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
        <span>Understood</span>
      </button>
      <button
        onClick={() => onChipClick('help')}
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition duration-200"
      >
        <HelpCircle className="h-3.5 w-3.5" />
        <span>Need more help</span>
      </button>
      <button
        onClick={() => onChipClick('deeper')}
        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition duration-200"
      >
        <Zap className="h-3.5 w-3.5" />
        <span>Go deeper</span>
      </button>
    </div>
  );
};

export default ComprehensionChips;
