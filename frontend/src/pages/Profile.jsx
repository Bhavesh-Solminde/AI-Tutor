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
import { getCompletedTopicsCount, getStudyStreakDays } from '../utils/userStats';

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { exam, fetchExam } = useExamStore();
  const { mastered, topics, fetchProgress } = useProgressStore();

  const [explanationLevel, setExplanationLevel] = useState(user?.explanationLevel || 'intermediate');
  const [examDate, setExamDate] = useState('');
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [savingLevel, setSavingLevel] = useState(false);
  const [savingDate, setSavingDate] = useState(false);

  useEffect(() => {
    if (user?._id) fetchExam(user._id);
  }, [user?._id]);

  useEffect(() => {
    if (user?._id) fetchProgress(user._id);
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

  const streakDays = getStudyStreakDays(user?.studyDays);
  const topicsDone = getCompletedTopicsCount({ mastered, topics });

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
        <UserProfileCard
          user={{ ...user, explanationLevel }}
          totalXP={user?.totalXp || 0}
          streakDays={streakDays}
          topicsDone={topicsDone}
        />
        <MasteryHeatmap heatmapDays={heatmapDays} />

        <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark divide-y divide-slate-100 dark:divide-border-dark overflow-hidden shadow-sm">
          {/* Explanation Level */}
          <div className="p-5 flex justify-between items-center">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Explanation Level</h4>
              <p className="text-xs text-slate-500 capitalize">{explanationLevel}</p>
            </div>
            <button
              onClick={handleLevelChange}
              disabled={savingLevel}
              className="text-sm font-semibold text-[#3B6BFF] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              {savingLevel ? 'Saving...' : 'Change'}
            </button>
          </div>

          {/* Exam Date */}
          <div className="p-5 flex justify-between items-center">
            <div className="space-y-1 flex-grow pr-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Exam Date</h4>
              {isEditingDate ? (
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="px-2 py-1 text-xs font-mono rounded-lg border border-border-light dark:border-border-dark bg-transparent text-slate-800 dark:text-white focus:outline-none focus:border-[#3B6BFF]"
                  />
                  <button
                    onClick={handleSaveDate}
                    disabled={savingDate}
                    className="px-2.5 py-1 bg-[#3B6BFF] text-white text-[10px] font-bold rounded-lg shadow disabled:opacity-50"
                  >
                    {savingDate ? '...' : 'Save'}
                  </button>
                  <button onClick={() => setIsEditingDate(false)} className="text-[10px] text-slate-400 hover:text-slate-600">Cancel</button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-mono">{formatDate(examDate)}</p>
              )}
            </div>
            {!isEditingDate && (
              <button
                onClick={() => setIsEditingDate(true)}
                className="text-sm font-semibold text-[#3B6BFF] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex-shrink-0"
              >
                Change
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button className="flex-1 py-3 border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-elevated-dark text-slate-700 dark:text-white text-sm font-bold rounded-2xl transition-all duration-300">
            Settings
          </button>
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
