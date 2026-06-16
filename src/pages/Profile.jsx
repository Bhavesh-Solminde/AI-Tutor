import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import UserProfileCard from '../components/profile/UserProfileCard';
import MasteryHeatmap from '../components/profile/MasteryHeatmap';

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [explanationLevel, setExplanationLevel] = useState(user?.explanationLevel || 'intermediate');
  const [examDate, setExamDate] = useState('2025-01-28'); // Initial date matching Profile.png
  const [isEditingDate, setIsEditingDate] = useState(false);

  const handleLevelChange = () => {
    const levels = ['beginner', 'intermediate', 'advanced'];
    const currentIdx = levels.indexOf(explanationLevel);
    const nextLevel = levels[(currentIdx + 1) % levels.length];
    
    setExplanationLevel(nextLevel);
    if (updateUser) {
      updateUser({ explanationLevel: nextLevel });
    }
  };

  const handleDateChange = (e) => {
    setExamDate(e.target.value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not Set';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // 12-week mock study activity array (84 days)
  const fullHeatmapDays = Array.from({ length: 84 }, (_, i) => {
    const seed = Math.sin(i) + Math.cos(i * 1.5);
    if (seed < -0.3) return 0;
    if (seed < 0.2) return 1;
    if (seed < 0.6) return 2;
    if (seed < 0.9) return 3;
    return 4;
  });

  return (
    <MainLayout>
      <div className="space-y-6 text-left max-w-2xl mx-auto py-4">
        
        {/* Centered User Header Profile Card */}
        <UserProfileCard user={{ ...user, explanationLevel }} />

        {/* Consistency Heatmap Card */}
        <MasteryHeatmap heatmapDays={fullHeatmapDays} />

        {/* Settings Lists */}
        <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark divide-y divide-slate-100 dark:divide-border-dark overflow-hidden shadow-sm">
          
          {/* Explanation Level Card */}
          <div className="p-5 flex justify-between items-center transition-colors">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Explanation Level</h4>
              <p className="text-xs text-slate-500 capitalize">{explanationLevel}</p>
            </div>
            <button
              onClick={handleLevelChange}
              className="text-sm font-semibold text-[#3B6BFF] dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              Change
            </button>
          </div>

          {/* Exam Target Date Card */}
          <div className="p-5 flex justify-between items-center transition-colors">
            <div className="space-y-1 flex-grow pr-4">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Exam Date</h4>
              {isEditingDate ? (
                <div className="flex items-center space-x-2 mt-1">
                  <input
                    type="date"
                    value={examDate}
                    onChange={handleDateChange}
                    className="px-2 py-1 text-xs font-mono rounded-lg border border-border-light dark:border-border-dark bg-transparent text-slate-800 dark:text-white focus:outline-none focus:border-[#3B6BFF]"
                  />
                  <button
                    onClick={() => setIsEditingDate(false)}
                    className="px-2.5 py-1 bg-[#3B6BFF] text-white text-[10px] font-bold rounded-lg shadow"
                  >
                    Save
                  </button>
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

        {/* Footer Actions buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button className="flex-1 py-3 border border-slate-200 dark:border-border-dark hover:bg-slate-50 dark:hover:bg-elevated-dark text-slate-700 dark:text-white text-sm font-bold rounded-2xl transition-all duration-300">
            Settings
          </button>
          <button
            onClick={() => logout && logout()}
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
