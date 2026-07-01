import React from 'react';
import { Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamCountdownWidget = ({ daysRemaining = 5, examDate = 'Jan 28, 2025' }) => {
  const navigate = useNavigate();
  const formattedDate = new Date(examDate).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const isPast = daysRemaining <= 0;

  if (isPast) {
    return (
      <div className="border border-emerald-500/30 rounded-2xl bg-emerald-50/60 dark:bg-emerald-900/10 p-6 flex items-center justify-between shadow-sm text-left h-28 group transition-colors">
        <div className="space-y-1">
          <h3 className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Exam Complete
          </h3>
          <p className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 leading-none mt-0.5">
            {formattedDate}
          </p>
          <button
            onClick={() => navigate('/exam')}
            className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
          >
            Start next exam <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="h-14 w-14 rounded-full bg-emerald-500/15 flex-shrink-0 flex items-center justify-center text-emerald-500 group-hover:scale-105 transition-transform">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>
    );
  }

  const urgencyClass =
    daysRemaining <= 3  ? 'text-red-500 dark:text-red-400' :
    daysRemaining <= 7  ? 'text-amber-500 dark:text-amber-400' :
    'text-[#333333] dark:text-white';

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 flex items-center justify-between shadow-sm text-left h-28 group hover:border-primary/50 transition-colors">
      <div className="space-y-1">
        <h3 className="text-xs font-mono text-text-muted-light dark:text-text-muted-dark uppercase tracking-wider">
          Exam Countdown
        </h3>
        <p className={`text-3xl font-extrabold leading-none mt-0.5 ${urgencyClass}`}>
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
