import React from 'react';
import { Clock, Check } from 'lucide-react';

const RescuePlanTimeline = ({ rescuePlan }) => {
  // Use mock plan from mockup if none provided or customized
  const timelineSteps = rescuePlan || [
    { id: 1, title: 'Day 1 — Today', topic: 'CPU Scheduling', status: 'completed' },
    { id: 2, title: 'Day 2 — Tomorrow', topic: 'Virtual Memory', status: 'active' },
    { id: 3, title: 'Day 3', topic: 'Memory Management', status: 'unstarted' },
    { id: 4, title: 'Day 4', topic: 'File Systems', status: 'unstarted' },
    { id: 5, title: 'Day 5 — Exam Day', topic: 'Quick Revision', status: 'unstarted' }
  ];

  const getDotStyles = (status) => {
    if (status === 'completed') {
      return 'bg-emerald-500 border-emerald-500 text-white';
    } else if (status === 'active') {
      return 'bg-primary dark:bg-accent border-primary dark:border-accent ring-4 ring-primary/20 dark:ring-accent/20';
    } else {
      return 'bg-slate-200 dark:bg-border-dark border-slate-300 dark:border-slate-800';
    }
  };

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm space-y-6 text-left flex flex-col h-full min-h-[350px]">
      <div className="flex items-center space-x-2 border-b border-border-light/45 dark:border-border-dark/45 pb-3">
        <Clock className="h-5 w-5 text-red-500" />
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Exam Rescue Timeline</h3>
      </div>

      <div className="relative flex-1 pl-4 space-y-6 text-xs">
        {/* Left vertical timeline bar */}
        <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-border-dark -z-0" />

        {timelineSteps.map((step, idx) => (
          <div key={step._id || step.id || idx} className="relative flex items-start space-x-4 z-10">
            {/* Dot node */}
            <div className={`h-5 w-5 rounded-full flex items-center justify-center border flex-shrink-0 transition-all duration-300 ${getDotStyles(step.status)}`}>
              {step.status === 'completed' && <Check className="h-3 w-3" />}
            </div>

            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-800 dark:text-text-primary-dark">
                {step.title}
              </h4>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                {step.topic}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RescuePlanTimeline;
