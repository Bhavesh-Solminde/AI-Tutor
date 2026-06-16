import React from 'react';
import { Check, X } from 'lucide-react';

const QuizSteps = ({ totalQuestions = 10, currentIdx = 0, answers = {} }) => {
  const stepNumbers = Array.from({ length: totalQuestions }, (_, i) => i);

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col h-full text-left">
      <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark border-b border-border-light dark:border-border-dark pb-3 mb-4">
        Quiz Steps
      </h3>
      
      <div className="space-y-3 flex-1 overflow-y-auto">
        {stepNumbers.map((index) => {
          const qNum = index + 1;
          const isActive = index === currentIdx;
          const answer = answers[index];
          const isAnswered = answer !== undefined;
          const isCorrect = isAnswered && answer.isCorrect;

          let bubbleClasses = 'w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-300 ';
          let labelClasses = 'text-xs font-medium ';

          if (isActive) {
            bubbleClasses += 'bg-primary text-white dark:bg-accent ring-2 ring-primary/20 dark:ring-accent/20';
            labelClasses += 'text-text-base-light dark:text-text-base-dark font-bold';
          } else if (isAnswered) {
            if (isCorrect) {
              bubbleClasses += 'bg-emerald-500 text-white';
              labelClasses += 'text-emerald-500 dark:text-emerald-400 font-semibold';
            } else {
              bubbleClasses += 'bg-red-500 text-white';
              labelClasses += 'text-red-500 dark:text-red-400 font-semibold';
            }
          } else {
            bubbleClasses += 'bg-slate-100 dark:bg-elevated-dark text-text-muted-light dark:text-text-muted-dark';
            labelClasses += 'text-text-muted-light dark:text-text-muted-dark';
          }

          return (
            <div key={index} className="flex items-center space-x-3">
              <div className={bubbleClasses}>
                {isAnswered ? (
                  isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
                ) : (
                  qNum
                )}
              </div>
              <span className={labelClasses}>
                Question {qNum}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizSteps;
