import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';

// Components
import MasteryRing from '../components/dashboard/MasteryRing';
import TopicMasteryTable from '../components/dashboard/TopicMasteryTable';
import ExamCountdownWidget from '../components/dashboard/ExamCountdownWidget';
import RescuePlanTimeline from '../components/dashboard/RescuePlanTimeline';
import NextTopicCard from '../components/dashboard/NextTopicCard';
import WeeklyStreakWidget from '../components/dashboard/WeeklyStreakWidget';
import AIRecommendedCard from '../components/dashboard/AIRecommendedCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const topics = [
    { id: 'cpu-scheduling', name: 'CPU Scheduling', difficulty: 'easy', time: '2h 30m', progress: 85 },
    { id: 'memory-management', name: 'Memory Management', difficulty: 'medium', time: '3h 15m', progress: 60 },
    { id: 'virtual-memory', name: 'Virtual Memory', difficulty: 'medium', time: '2h 45m', progress: 40 },
    { id: 'file-systems', name: 'File Systems', difficulty: 'hard', time: '4h 00m', progress: 20 },
    { id: 'deadlocks', name: 'Deadlocks', difficulty: 'hard', time: '3h 30m', progress: 5 },
    { id: 'process-sync', name: 'Process Synchronization', difficulty: 'medium', time: '2h 00m', progress: 70 }
  ];

  const rescuePlan = [
    { id: 1, title: 'Day 1 — Today', topic: 'CPU Scheduling', status: 'completed' },
    { id: 2, title: 'Day 2 — Tomorrow', topic: 'Virtual Memory', status: 'active' },
    { id: 3, title: 'Day 3', topic: 'Memory Management', status: 'unstarted' },
    { id: 4, title: 'Day 4', topic: 'File Systems', status: 'unstarted' },
    { id: 5, title: 'Day 5 — Exam Day', topic: 'Quick Revision', status: 'unstarted' }
  ];

  return (
    <MainLayout>
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name || 'Dhruv'}. Track your rescue plan and mastery status.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <MasteryRing
              progress={33.7}
            />
          </div>
          <div className="md:col-span-4">
            <ExamCountdownWidget
              daysRemaining={5}
              examDate="Jan 28, 2025"
            />
          </div>
          <div className="md:col-span-4">
            <WeeklyStreakWidget
              streakDays={4}
              xpToday={180}
            />
          </div>
        </div>

        {/* Topic Mastery Table */}
        <div className="w-full">
          <TopicMasteryTable
            topics={topics}
            onStudyClick={(id) => navigate(`/tutor/${id}`)}
          />
        </div>

        {/* Main Content Layout (AI Recommended & Timeline) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Recommended & Left Cards (Left Panel) */}
          <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
            <AIRecommendedCard
              topicId="virtual-memory"
              topicName="Virtual Memory"
              difficulty="Medium"
              estTime="2h 45m estimated"
              onCtaClick={() => navigate('/tutor/virtual-memory')}
            />
            
            <NextTopicCard
              title="Continue Where You Left Off"
              subtitle="Memory Management — Page 14 of 32"
              progress={44}
              onResume={() => navigate('/tutor/memory-management')}
              onTakeQuiz={() => navigate('/quiz/memory-management')}
            />
          </div>

          {/* Timeline (Right Panel) */}
          <div className="lg:col-span-4">
            <RescuePlanTimeline
              rescuePlan={rescuePlan}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
