import React from 'react';
import { CheckCircle, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';

const ScoreSummary = ({ score, total, xp, passed, masteryDelta, onRetry, onBack }) => {
  const renderMasteryDelta = () => {
    if (!masteryDelta) {
      return (
        <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 flex justify-between items-center animate-pulse">
          <div className="text-left space-y-1">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Topic Mastery</p>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-1" />
          </div>
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      );
    }

    const before = masteryDelta.before ?? 0;
    const after = masteryDelta.after ?? 0;
    const delta = after - before;

    const isMastered = passed;
    
    let bannerBgClass = "bg-emerald-500/5 dark:bg-emerald-500/10";
    let bannerBorderClass = "border-emerald-500/20 dark:border-emerald-500/30";
    let statusTextClass = "text-emerald-600 dark:text-emerald-400";
    let valueTextClass = "text-emerald-500";
    let statusLabel = isMastered ? "Mastered" : "Learning";
    const DeltaIcon = delta < 0 ? ArrowDownRight : ArrowUpRight;

    if (delta < 0) {
      bannerBgClass = "bg-rose-500/5 dark:bg-rose-500/10";
      bannerBorderClass = "border-rose-500/20 dark:border-rose-500/30";
      statusTextClass = "text-rose-600 dark:text-rose-400";
      valueTextClass = "text-rose-500";
      statusLabel = "Needs Review";
    } else if (!isMastered) {
      bannerBgClass = "bg-amber-500/5 dark:bg-amber-500/10";
      bannerBorderClass = "border-amber-500/20 dark:border-amber-500/30";
      statusTextClass = "text-amber-600 dark:text-amber-400";
      valueTextClass = "text-amber-500";
      statusLabel = "In Progress";
    }

    const deltaSign = delta >= 0 ? "+" : "";

    return (
      <div className={`p-4 rounded-xl ${bannerBgClass} border ${bannerBorderClass} flex justify-between items-center`}>
        <div className="text-left">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Topic Mastery</p>
          <p className={`text-sm font-bold ${statusTextClass} flex items-center mt-0.5`}>
            {statusLabel} ({deltaSign}{delta}% delta)
          </p>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-sm line-through text-slate-400">{before}%</span>
          <DeltaIcon className={`h-3.5 w-3.5 ${valueTextClass}`} />
          <span className={`text-xl font-bold ${valueTextClass}`}>{after}%</span>
        </div>
      </div>
    );
  };

  const headerText = passed ? "Quiz Passed!" : "Needs Review";
  const HeaderIcon = passed ? CheckCircle : AlertTriangle;
  const headerColors = passed 
    ? "bg-emerald-500/10 text-emerald-500" 
    : "bg-rose-500/10 text-rose-500";

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-8 shadow-sm text-center max-w-lg mx-auto space-y-6">
      <div className={`h-16 w-16 mx-auto rounded-full ${headerColors} flex items-center justify-center font-bold`}>
        <HeaderIcon className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">{headerText}</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-light/40 dark:border-border-dark/40 font-mono">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">Correct Answers</span>
          <span className="text-xl font-bold text-slate-800 dark:text-white">{score} / {total}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">XP Earned</span>
          <span className="text-xl font-bold text-primary dark:text-accent">+{xp} XP</span>
        </div>
      </div>

      {/* Mastery Delta Banner */}
      {renderMasteryDelta()}

      <div className="flex space-x-3 pt-2">
        <button
          onClick={onRetry}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition"
        >
          Retry Quiz
        </button>
        <button
          onClick={onBack}
          className="flex-grow py-2.5 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 text-white text-sm font-bold rounded-xl shadow-lg transition"
        >
          Back to Roadmap
        </button>
      </div>
    </div>
  );
};

export default ScoreSummary;
