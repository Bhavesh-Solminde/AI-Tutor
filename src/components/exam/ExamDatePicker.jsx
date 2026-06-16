import React from 'react';

const ExamDatePicker = ({ value, onChange }) => {
  const calculateDaysRemaining = (dateStr) => {
    if (!dateStr) return 0;
    const diff = new Date(dateStr) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  };

  const daysRemaining = calculateDaysRemaining(value);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Exam Date</label>
        {value && (
          <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
            daysRemaining <= 3 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
          }`}>
            {daysRemaining} Days Left
          </span>
        )}
      </div>
      
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm font-mono rounded-xl border border-border-light dark:border-border-dark bg-transparent text-text-base-light dark:text-text-base-dark focus:outline-none focus:border-primary dark:focus:border-accent transition-colors duration-200"
      />
    </div>
  );
};

export default ExamDatePicker;
