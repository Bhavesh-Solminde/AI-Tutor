import React from 'react';
import { BarChart2, Star, AlertTriangle, X, Zap } from 'lucide-react';

/**
 * PYQInsightDialog
 *
 * Shown before generating a rescue plan when PYQ data exists.
 * Gives the student a clear picture of:
 *  - Which topics appeared most in past exams
 *  - How many topics are feasible given the time budget
 *  - What will be deprioritized
 *
 * @param {object} pyqInsights   - { topTopics, coveragePercent, topicCount, unfeasibleTopics }
 * @param {number} daysLeft      - days until exam
 * @param {number} hoursPerDay   - hours/day the student will study
 * @param {boolean} loading      - plan generation in progress
 * @param {function} onConfirm   - called when student clicks "Generate"
 * @param {function} onClose     - called to dismiss
 */
const PYQInsightDialog = ({ pyqInsights, daysLeft, hoursPerDay, loading, onConfirm, onClose }) => {
  if (!pyqInsights) return null;

  const { topTopics = [], coveragePercent = 0, unfeasibleTopics = [] } = pyqInsights;
  const maxFreq = Math.max(...topTopics.map((t) => t.frequency), 1);

  const importanceColor = (imp) => {
    if (imp === 'Critical') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    if (imp === 'High')     return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
  };

  const barColor = (imp) => {
    if (imp === 'Critical') return 'bg-red-500';
    if (imp === 'High')     return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg text-left overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-accent/10 flex items-center justify-center flex-shrink-0">
              <BarChart2 className="h-5 w-5 text-primary dark:text-accent" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#333333] dark:text-white">
                PYQ Analysis — What Actually Matters
              </h2>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
                Based on your past year papers · {hoursPerDay}h/day · {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Coverage stat */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 dark:bg-accent/5 border border-primary/20 dark:border-accent/20">
            <Star className="h-4 w-4 text-primary dark:text-accent flex-shrink-0" />
            <p className="text-xs text-[#333333] dark:text-white">
              Past papers cover{' '}
              <span className="font-bold text-primary dark:text-accent">{coveragePercent}%</span>
              {' '}of your syllabus —{' '}
              <span className="font-semibold">focus on these for maximum marks</span>
            </p>
          </div>

          {/* Top topics frequency chart */}
          {topTopics.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
                Top topics by exam frequency
              </p>
              <div className="space-y-2">
                {topTopics.map((t, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${importanceColor(t.importance)}`}>
                          {t.importance}
                        </span>
                        <span className="text-xs font-medium text-[#333333] dark:text-slate-200 truncate">
                          {t.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-text-muted-light dark:text-text-muted-dark flex-shrink-0 ml-2">
                        {t.frequency}× asked
                      </span>
                    </div>
                    {/* Frequency bar */}
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-border-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor(t.importance)}`}
                        style={{ width: `${(t.frequency / maxFreq) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Unfeasible topics warning */}
          {unfeasibleTopics.length > 0 && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {unfeasibleTopics.length} low-priority topic{unfeasibleTopics.length > 1 ? 's' : ''} will be deprioritized
                </p>
                <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">
                  Not enough study time — NeuralNest will focus on what appears in exams.
                </p>
                <p className="text-[10px] text-amber-600/80 dark:text-amber-500/80 mt-1">
                  {unfeasibleTopics.slice(0, 4).join(' · ')}{unfeasibleTopics.length > 4 ? ` +${unfeasibleTopics.length - 4} more` : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-border-light dark:border-border-dark space-y-2">
          <button
            id="pyq-generate-plan-btn"
            onClick={onConfirm}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-full shadow-md transition-all duration-300 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating smart plan…
              </>
            ) : (
              <>
                <Zap className="h-3.5 w-3.5" />
                Generate Smart Rescue Plan
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-2 rounded-full text-xs font-medium text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PYQInsightDialog;
