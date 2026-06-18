import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../stores/useAuthStore';
import useProgressStore from '../stores/useProgressStore';
import useExamStore from '../stores/useExamStore';

import MasteryRing from '../components/dashboard/MasteryRing';
import TopicMasteryTable from '../components/dashboard/TopicMasteryTable';
import ExamCountdownWidget from '../components/dashboard/ExamCountdownWidget';
import RescuePlanTimeline from '../components/dashboard/RescuePlanTimeline';
import NextTopicCard from '../components/dashboard/NextTopicCard';
import WeeklyStreakWidget from '../components/dashboard/WeeklyStreakWidget';
import AIRecommendedCard from '../components/dashboard/AIRecommendedCard';
import { MasteryRingSkeleton, TopicTableSkeleton, CardSkeleton } from '../components/ui/LoadingSkeleton';
import { InlineErrorFallback } from '../components/ui/ErrorFallback';
import EmptyState from '../components/ui/EmptyState';
import { BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    topics, overallMastery, mastered, total, loading: progressLoading, error: progressError, fetchProgress,
  } = useProgressStore();
  const {
    exam, daysLeft, rescuePlan, fetchExam, fetchStudyPlan, loading: examLoading,
  } = useExamStore();

  useEffect(() => {
    if (user?._id) {
      fetchProgress(user._id);
      fetchExam(user._id);
      fetchStudyPlan(user._id);
    }
  }, [user?._id]);

  // Derive the next recommended topic (last in-progress or first unstarted)
  const nextTopic = topics.find((t) => t.status === 'learning') || topics.find((t) => t.status === 'unstarted');
  // Continue card: most recently studied (highest masteryScore but not mastered)
  const continueTopic = topics.find((t) => t.status === 'learning' && t.masteryScore > 0);

  // Weekly study streak from user.studyDays
  const studyDaysThisWeek = user?.studyDays?.filter((d) => {
    const day = new Date(d);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return day >= weekAgo;
  }).length || 0;

  return (
    <MainLayout>
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Workspace Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back, {user?.name || '—'}. Track your rescue plan and mastery status.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            {progressLoading ? <MasteryRingSkeleton /> : (
              <MasteryRing progress={overallMastery} />
            )}
          </div>
          <div className="md:col-span-4">
            {examLoading ? <MasteryRingSkeleton /> : exam ? (
              <ExamCountdownWidget daysRemaining={daysLeft || 0} examDate={exam.examDate} />
            ) : (
              <div className="p-6 border border-dashed border-border-light dark:border-border-dark rounded-2xl flex flex-col items-center justify-center text-center space-y-2 h-full">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No exam set</p>
                <button onClick={() => navigate('/exam')} className="text-xs text-primary dark:text-accent hover:underline">
                  Set up Exam Mode →
                </button>
              </div>
            )}
          </div>
          <div className="md:col-span-4">
            <WeeklyStreakWidget streakDays={studyDaysThisWeek} xpToday={user?.totalXp || 0} />
          </div>
        </div>

        {/* Topic Mastery Table */}
        <ErrorBoundary
          FallbackComponent={({ error, resetErrorBoundary }) => (
            <InlineErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} message={progressError || 'Failed to load topic data.'} />
          )}
        >
          {progressLoading ? (
            <TopicTableSkeleton />
          ) : topics.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              title="No progress data yet"
              description="Complete a lesson and quiz to see your mastery scores here."
              action={() => navigate('/onboarding')}
              actionLabel="Start Learning"
            />
          ) : (
            <TopicMasteryTable
              topics={topics}
              onStudyClick={(id) => navigate(`/tutor/${id}`)}
            />
          )}
        </ErrorBoundary>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
            {progressLoading ? (
              <><CardSkeleton /><CardSkeleton /></>
            ) : (
              <>
                {nextTopic && (
                  <AIRecommendedCard
                    topicId={nextTopic._id}
                    topicName={nextTopic.name}
                    difficulty={nextTopic.difficulty}
                    estTime={nextTopic.estimatedTime || 'Est. 30m'}
                    onCtaClick={() => navigate(`/tutor/${nextTopic._id}`)}
                  />
                )}
                {continueTopic && (
                  <NextTopicCard
                    title="Continue Where You Left Off"
                    subtitle={`${continueTopic.name} — ${continueTopic.masteryScore}% mastery`}
                    progress={continueTopic.masteryScore}
                    onResume={() => navigate(`/tutor/${continueTopic._id}`)}
                    onTakeQuiz={() => navigate(`/quiz/${continueTopic._id}`)}
                  />
                )}
              </>
            )}
          </div>

          <div className="lg:col-span-4">
            {rescuePlan ? (
              <RescuePlanTimeline rescuePlan={rescuePlan.days || []} />
            ) : (
              <div className="p-6 border border-dashed border-border-light dark:border-border-dark rounded-2xl flex flex-col items-center justify-center text-center space-y-2 h-full">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No rescue plan yet</p>
                <button onClick={() => navigate('/exam')} className="text-xs text-primary dark:text-accent hover:underline">
                  Generate Plan →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
