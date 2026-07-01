import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../stores/useAuthStore';
import useExamStore from '../stores/useExamStore';
import useProgressStore from '../stores/useProgressStore';
import api from '../lib/axiosClient';
import toast from 'react-hot-toast';
import UserProfileCard from '../components/profile/UserProfileCard';
import MasteryHeatmap from '../components/profile/MasteryHeatmap';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { Trophy, BookOpen, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { exam, fetchExam, examHistory, historyLoading, fetchExamHistory } = useExamStore();
  const { mastered: topicsDone, fetchProgress } = useProgressStore();

  // Compute weekly streak the same way Dashboard does — single source of truth
  const studyDaysThisWeek = user?.studyDays?.filter((d) => {
    const day = new Date(d);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return day >= weekAgo;
  }).length || 0;

  const [explanationLevel, setExplanationLevel] = useState(user?.explanationLevel || 'intermediate');
  const [examDate, setExamDate] = useState('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [savingLevel, setSavingLevel] = useState(false);
  const [savingDate, setSavingDate] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchExam(user._id);
      fetchProgress(user._id);
      fetchExamHistory();
    }
  }, [user?._id]);

  useEffect(() => {
    if (exam?.examDate) setExamDate(exam.examDate.split('T')[0]);
  }, [exam]);

  const handleLevelChange = async () => {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const nextLevel = levels[(levels.indexOf(explanationLevel) + 1) % levels.length];
    setSavingLevel(true);
    try {
      await api.patch('/api/auth/me', { explanationLevel: nextLevel });
      setExplanationLevel(nextLevel);
      updateUser({ explanationLevel: nextLevel });
      toast.success(`Explanation level changed to ${nextLevel}`);
    } catch {
      // Error handled by axiosClient interceptor
    } finally {
      setSavingLevel(false);
    }
  };

  const handleSaveDate = async () => {
    if (!examDate) { toast.error('Please select a valid exam date.'); return; }
    setSavingDate(true);
    try {
      await api.patch(`/api/exam/${user._id}`, { examDate });
      setIsEditingDate(false);
      // Re-fetch exam from backend so the displayed date is in sync
      await fetchExam(user._id);
      toast.success('Exam date updated!');
    } catch {
      // Error handled by axiosClient
    } finally {
      setSavingDate(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Set';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Build heatmap: 84 days. studyDays = array of ISO date strings
  const studyDaysSet = new Set((user?.studyDays || []).map((d) => new Date(d).toDateString()));
  const today = new Date();
  const heatmapDays = Array.from({ length: 84 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (83 - i));
    return studyDaysSet.has(d.toDateString()) ? 3 : 0;
  });

  if (!user) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-4 space-y-6">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={8} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 text-left max-w-2xl mx-auto py-4">
        <UserProfileCard user={{ ...user, explanationLevel }} streakDays={studyDaysThisWeek} topicsDone={topicsDone} />
        <MasteryHeatmap heatmapDays={heatmapDays} />

        <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark divide-y divide-slate-100 dark:divide-border-dark overflow-hidden shadow-sm">
          {/* Explanation Level */}
          <div className="p-5 flex justify-between items-center">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-[#333333] dark:text-white">Explanation Level</h4>
              <p className="text-xs text-[#555555] capitalize">{explanationLevel}</p>
            </div>
            <button
              onClick={handleLevelChange}
              disabled={savingLevel}
              className="text-sm font-semibold text-primary dark:text-accent hover:text-primary-hover dark:hover:text-accent/90 transition-colors disabled:opacity-50"
            >
              {savingLevel ? 'Saving...' : 'Change'}
            </button>
          </div>

          {/* Exam Date */}
          <div className="p-5 flex justify-between items-center">
            <div className="space-y-1 flex-grow pr-4">
              <h4 className="font-bold text-sm text-[#333333] dark:text-white">Exam Date</h4>
              {isEditingDate ? (
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="px-2 py-1 text-xs font-mono rounded-lg border border-border-light dark:border-border-dark bg-transparent text-[#333333] dark:text-white focus:outline-none focus:border-primary dark:focus:border-accent"
                  />
                  <button
                    onClick={handleSaveDate}
                    disabled={savingDate}
                    className="px-2.5 py-1 bg-primary dark:bg-accent text-white text-[10px] font-bold rounded-lg shadow disabled:opacity-50 hover:bg-primary-hover dark:hover:bg-accent/90 transition"
                  >
                    {savingDate ? '...' : 'Save'}
                  </button>
                  <button onClick={() => setIsEditingDate(false)} className="text-[10px] text-[#666666] hover:text-[#4A4A4A]">Cancel</button>
                </div>
              ) : (
                <p className="text-xs text-[#555555]">{formatDate(examDate)}</p>
              )}
            </div>
            {!isEditingDate && (
              <button
                onClick={() => setIsEditingDate(true)}
                className="text-sm font-semibold text-primary dark:text-accent hover:text-primary-hover dark:hover:text-accent/90 transition-colors flex-shrink-0"
              >
                Change
              </button>
            )}
          </div>
        </div>

        {/* Exam History */}
        <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h4 className="font-bold text-sm text-[#333333] dark:text-white">Exam History</h4>
          </div>
          {historyLoading ? (
            <div className="p-5"><CardSkeleton lines={2} /></div>
          ) : examHistory.length === 0 ? (
            <div className="p-5 text-center">
              <p className="text-xs text-[#555555] dark:text-[#666666]">
                No past exams yet. Complete your first exam to see it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-border-dark">
              {examHistory.map((h) => (
                <div key={h._id} className="p-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <BookOpen className="h-3.5 w-3.5 text-primary dark:text-accent flex-shrink-0" />
                      <span className="text-sm font-bold text-[#333333] dark:text-white truncate">{h.subject}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="h-3 w-3 text-[#777777]" />
                      <span className="text-[11px] text-[#666666] dark:text-[#888888]">
                        {new Date(h.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {h.finalTotal > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-[#777777]">
                            {h.finalMastered}/{h.finalTotal} topics mastered
                          </span>
                          <span className="text-[10px] font-bold text-primary dark:text-accent">
                            {h.finalMasteryScore ?? 0}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-border-dark rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary dark:bg-accent rounded-full transition-all"
                            style={{ width: `${h.finalMasteryScore ?? 0}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* <button className="flex-1 py-3 border border-[#EAE8E1] dark:border-border-dark hover:bg-white/60 dark:hover:bg-elevated-dark text-[#333333] dark:text-white text-sm font-bold rounded-2xl transition-all duration-300">
            Settings
          </button> */}
          <button
            onClick={() => logout()}
            className="flex-1 py-3 border border-red-500/30 hover:bg-red-500/5 text-red-500 text-sm font-bold rounded-2xl transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
