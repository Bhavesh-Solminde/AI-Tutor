import React from 'react';
import { PlayCircle } from 'lucide-react';

const TopicMasteryTable = ({ topics, onStudyClick }) => {
  const getDifficultyStyles = (difficulty = 'medium') => {
    const diff = difficulty.toLowerCase();
    if (diff === 'easy') {
      return 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400';
    } else if (diff === 'medium') {
      return 'bg-amber-500/10 text-amber-500 dark:text-amber-400';
    } else {
      return 'bg-red-500/10 text-red-500 dark:text-red-400';
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark shadow-sm overflow-hidden text-left">
      <div className="p-5 border-b border-border-light/40 dark:border-border-dark/40 flex justify-between items-center">
        <h3 className="font-bold text-[#333333] dark:text-white text-base">Topic Mastery</h3>
        <button className="text-xs font-semibold text-[#3B6BFF] hover:underline">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-white/60/50 dark:bg-slate-900/40 text-xs font-mono text-text-muted-light dark:text-text-muted-dark border-b border-border-light/40 dark:border-border-dark/40 uppercase">
              <th className="p-4 font-semibold">Topic</th>
              <th className="p-4 font-semibold">Difficulty</th>
              <th className="p-4 font-semibold">Est. Time</th>
              <th className="p-4 font-semibold">Progress</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light/20 dark:divide-border-dark/20">
            {topics.map((t) => {
              const topicId = t._id || t.id;
              const difficulty = t.difficulty || 'medium';
              const progress = t.masteryScore ?? t.progress ?? 0;
              const estTime = t.estimatedMinutes ? `${t.estimatedMinutes}m` : (t.time || '—');
              return (
                <tr key={topicId} className="hover:bg-white/60/30 dark:hover:bg-slate-900/10 transition">
                  <td className="p-4 font-semibold text-[#333333] dark:text-text-primary-dark">{t.name}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold capitalize ${getDifficultyStyles(difficulty)}`}>
                      {difficulty.toLowerCase()}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-text-muted-light dark:text-text-muted-dark">{estTime}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-48 h-1.5 rounded-full bg-white/80 dark:bg-border-dark overflow-hidden">
                        <div
                          style={{ width: `${progress}%` }}
                          className={`h-full rounded-full ${getProgressColor(progress)}`}
                        />
                      </div>
                      <span className="font-mono text-xs font-semibold text-text-muted-light dark:text-text-muted-dark">{progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onStudyClick(topicId)}
                      className="p-1 rounded-full text-[#3B6BFF] hover:opacity-80 transition"
                      title="Start study session"
                    >
                      <PlayCircle className="h-5.5 w-5.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopicMasteryTable;
