import React from 'react';
import { CheckCircle } from 'lucide-react';

const AnswerOptionButton = ({ opt, idx, isSelected, isCorrect, isAnswered, onSelect }) => {
  let optClasses = 'w-full text-left p-4 rounded-xl border font-medium text-sm transition-all duration-200 ';
  if (isAnswered) {
    if (isCorrect) {
      optClasses += 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
    } else if (isSelected) {
      optClasses += 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-400';
    } else {
      optClasses += 'border-border-light dark:border-border-dark opacity-60 text-[#666666]';
    }
  } else {
    optClasses += 'border-border-light dark:border-border-dark hover:border-primary dark:hover:border-accent hover:bg-white/60 dark:hover:bg-slate-900 bg-white/60/20 dark:bg-slate-900/10 text-[#333333] dark:text-slate-300';
  }

  return (
    <button
      disabled={isAnswered}
      onClick={() => onSelect(idx)}
      className={optClasses}
    >
      <div className="flex justify-between items-center">
        <span>{opt}</span>
        {isAnswered && isCorrect && <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 ml-2" />}
      </div>
    </button>
  );
};

export default AnswerOptionButton;
