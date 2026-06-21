import React from 'react';
import { Clock, Check } from 'lucide-react';

const RescuePlanTimeline = ({ rescuePlan }) => {
  const timelineSteps = rescuePlan || [];

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm space-y-6 text-left flex flex-col h-full min-h-[350px]">
      <div className="flex items-center space-x-2 border-b border-border-light/45 dark:border-border-dark/45 pb-3">
        <Clock className="h-5 w-5 text-red-500" />
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Exam Rescue Timeline</h3>
      </div>

      <div className="relative flex-1 pl-4 space-y-6 text-xs overflow-y-auto pr-2">
        {/* Left vertical timeline bar */}
        <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-border-dark -z-0" />

        {timelineSteps.length > 0 ? timelineSteps.map((step, idx) => {
          const isFirstUncompleted = !step.completed && timelineSteps.slice(0, idx).every(s => s.completed);
          let statusStr = step.completed ? 'completed' : isFirstUncompleted ? 'active' : 'unstarted';

          const getDotStyles = (status) => {
            if (status === 'completed') {
              return 'bg-emerald-500 border-emerald-500 text-white';
            } else if (status === 'active') {
              return 'bg-primary dark:bg-accent border-primary dark:border-accent ring-4 ring-primary/20 dark:ring-accent/20 text-white';
            } else {
              return 'bg-slate-200 dark:bg-border-dark border-slate-300 dark:border-slate-800 text-transparent';
            }
          };

          const dateStr = step.date ? new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
          const title = step.isMockExam ? '🎯 Mock Exam' : `Day ${step.dayNumber} — ${dateStr}`;

          return (
            <div key={step._id || step.id || idx} className="relative flex items-start space-x-4 z-10">
              {/* Dot node */}
              <div className={`h-5 w-5 rounded-full flex items-center justify-center border flex-shrink-0 transition-all duration-300 ${getDotStyles(statusStr)} mt-0.5`}>
                {statusStr === 'completed' && <Check className="h-3 w-3" />}
                {statusStr === 'active' && <Clock className="h-3 w-3" />}
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-text-primary-dark">
                  {title}
                </h4>
                <div className="space-y-0.5">
                  {(step.topics || []).map((t, ti) => (
                    <p key={t.topicId || ti} className="text-xs text-text-muted-light dark:text-text-muted-dark truncate max-w-[200px]" title={t.topicName}>
                      • {t.topicName}
                    </p>
                  ))}
                  {(step.topics || []).length === 0 && !step.isMockExam && (
                    <p className="text-xs text-slate-400 italic">No topics assigned.</p>
                  )}
                  {step.isMockExam && (
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium pt-1">
                      📝 Full mock exam from past papers
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <p className="text-xs text-slate-400 italic">Timeline will appear here.</p>
        )}
      </div>
    </div>
  );
};

export default RescuePlanTimeline;
