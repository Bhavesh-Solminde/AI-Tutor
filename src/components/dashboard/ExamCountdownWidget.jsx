import React from 'react';

const ExamCountdownWidget = ({ daysRemaining = 5, examDate = 'Jan 28, 2025' }) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 flex items-center space-x-4 shadow-sm text-left h-28">
      {/* Orange rounded rectangle */}
      <div className="h-12 w-12 rounded-xl bg-orange-500 flex-shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-md">
        {/* Empty orange block per Dashboard.png */}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Exam Countdown</h3>
        <p className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none mt-0.5">{daysRemaining} Days</p>
        <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
          Remaining — Exam: {examDate}
        </p>
      </div>
    </div>
  );
};

export default ExamCountdownWidget;
