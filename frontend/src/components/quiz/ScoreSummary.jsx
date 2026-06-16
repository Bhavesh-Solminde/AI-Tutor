import React from 'react';
import { CheckCircle, ArrowUpRight } from 'lucide-react';

const ScoreSummary = ({ score, total, xp, onRetry, onBack }) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-8 shadow-sm text-center max-w-lg mx-auto space-y-6">
      <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
        <CheckCircle className="h-10 w-10" />
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-extrabold text-slate-950 dark:text-white">Quiz Completed!</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Excellent progress made on CPU Scheduling.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-light/40 dark:border-border-dark/40 font-mono">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">Correct Answers</span>
          <span className="text-xl font-bold text-slate-800 dark:text-white">{score} / {total}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400">XP Earned</span>
          <span className="text-xl font-bold text-amber-500">+{xp} XP</span>
        </div>
      </div>

      {/* Mastery Delta Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex justify-between items-center">
        <div className="text-left">
          <p className="text-xs font-mono text-slate-400 uppercase">Topic Mastery</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center mt-0.5">
            Mastered (+60% delta)
          </p>
        </div>
        <div className="flex items-baseline space-x-1">
          <span className="text-sm line-through text-slate-400">30%</span>
          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
          <span className="text-xl font-bold text-emerald-500">90%</span>
        </div>
      </div>

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
