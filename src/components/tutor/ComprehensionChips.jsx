import React from 'react';

const ComprehensionChips = ({ onChipClick }) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-left">
      <button
        onClick={() => onChipClick('understood')}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition duration-200"
      >
        👍 Understood
      </button>
      <button
        onClick={() => onChipClick('help')}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500/20 transition duration-200"
      >
        🤔 Need more help
      </button>
      <button
        onClick={() => onChipClick('deeper')}
        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition duration-200"
      >
        🚀 Go deeper
      </button>
    </div>
  );
};

export default ComprehensionChips;
