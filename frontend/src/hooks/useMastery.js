import { useCallback } from 'react';

export const useMastery = () => {
  const resolveStatus = useCallback((score) => {
    if (score === 0) return 'unstarted';
    if (score >= 85) return 'mastered';
    return 'learning';
  }, []);

  const resolveColor = useCallback((status) => {
    switch (status) {
      case 'mastered':
        return 'border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400';
      case 'learning':
        return 'border-yellow-500 bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 animate-pulse-glow';
      default:
        return 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-400';
    }
  }, []);

  return { resolveStatus, resolveColor };
};
export default useMastery;
