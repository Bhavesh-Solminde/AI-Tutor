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

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { exam, fetchExam } = useExamStore();
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
