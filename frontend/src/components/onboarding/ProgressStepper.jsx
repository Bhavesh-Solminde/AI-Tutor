import React from 'react';
import ThemeToggle from '../layout/ThemeToggle';

const ProgressStepper = ({ step, totalSteps = 3, title, icon: Icon }) => {
  return (
    <header className="relative z-10 max-w-4xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-border-light dark:border-border-dark">
      <div className="flex items-center space-x-3">
        {Icon && <Icon className="h-6 w-6 text-primary dark:text-accent" />}
        <span className="text-lg font-bold tracking-tight text-[#333333] dark:text-white">
          {title}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const sNum = idx + 1;
            return (
              <div
                key={sNum}
                className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                  sNum === step
                    ? 'bg-primary dark:bg-accent w-12'
                    : sNum < step
                    ? 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            );
          })}
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default ProgressStepper;
