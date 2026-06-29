import React from 'react';
import { Calendar } from 'lucide-react';

const ExamCountdownWidget = ({ daysRemaining = 5, examDate = 'Jan 28, 2025' }) => {
  const formattedDate = new Date(examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 flex items-center justify-between shadow-sm text-left h-28 group hover:border-primary/50 transition-colors">
      <div className="space-y-1">
        <h3 className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">Exam Countdown</h3>
        <p className="text-3xl font-extrabold text-[#333333] dark:text-white leading-none mt-0.5">
          {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
        </p>
        <p className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block mt-1">
          Target: {formattedDate}
        </p>
      </div>
      <div className="h-14 w-14 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center text-primary shadow-[0_0_15px_-3px_rgba(59,107,255,0.2)] group-hover:scale-105 transition-transform">
        <Calendar className="h-6 w-6" />
      </div>
    </div>
  );
};

export default ExamCountdownWidget;
