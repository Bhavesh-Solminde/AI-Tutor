import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../stores/useAuthStore';
import useProgressStore from '../stores/useProgressStore';
import useExamStore from '../stores/useExamStore';
import useQuizStore from '../stores/useQuizStore';

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
    recommendations, recommendationsLoading, fetchRecommendations,
  } = useProgressStore();
  const {
    exam, daysLeft, rescuePlan, fetchExam, fetchStudyPlan, loading: examLoading,
  } = useExamStore();
  const { quizHistory, fetchQuizHistory } = useQuizStore();

  useEffect(() => {
    if (user?._id) {
      fetchProgress(user._id);
      fetchExam(user._id);
      fetchStudyPlan(user._id);
      fetchQuizHistory(user._id);
      fetchRecommendations();
    }
  }, [user?._id]);

  // Performance-based recommendation (from backend scoring)
  const topRec = recommendations?.[0] ?? null;
  // nextTopic: prefer the recommended topic; fall back to in-progress or first unstarted
  const nextTopic = topRec?.topic
    ?? topics.find((t) => t.status === 'learning')
    ?? topics.find((t) => t.status === 'unstarted');
  // unmetPrerequisites only comes from topRec — fallback topics have no prereq data
  const unmetPrerequisites = topRec?.unmetPrerequisites ?? [];
  // Continue card: most recently studied (highest masteryScore but not mastered)
  const continueTopic = topics.find((t) => t.status === 'learning' && t.masteryScore > 0);

  // Weekly study streak from user.studyDays
  const studyDaysThisWeek = user?.studyDays?.filter((d) => {
    const day = new Date(d);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return day >= weekAgo;
  }).length || 0;

  // XP earned today — sum xpEarned from all quiz results completed today
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const xpToday = quizHistory
    .filter((r) => r.completedAt && new Date(r.completedAt) >= todayStart)
    .reduce((sum, r) => sum + (r.xpEarned || 0), 0);

  return (
    <MainLayout>
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-2xl font-bold text-[#333333] dark:text-white">Workspace Overview</h1>
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
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
                <p className="text-sm font-semibold text-[#555555] dark:text-[#666666]">No exam set</p>
                <button onClick={() => navigate('/exam')} className="text-xs text-primary dark:text-accent hover:underline">
                  Set up Exam Mode →
                </button>
              </div>
            )}
          </div>
          <div className="md:col-span-4">
            <WeeklyStreakWidget streakDays={studyDaysThisWeek} xpToday={xpToday} totalXp={user?.xp ?? user?.totalXp ?? 0} />
          </div>
        </div>


        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6 flex flex-col justify-between">
            {progressLoading || recommendationsLoading ? (
              <><CardSkeleton /><CardSkeleton /></>
            ) : (
              <>
                {nextTopic && (
                  <AIRecommendedCard
                    topicId={nextTopic._id}
                    topicName={nextTopic.name}
                    difficulty={nextTopic.difficulty}
                    estTime={nextTopic.estimatedMinutes ? `Est. ${nextTopic.estimatedMinutes}m` : 'Est. 30m'}
                    reason={topRec?.reason || ''}
                    unmetPrerequisites={unmetPrerequisites}
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
            {rescuePlan && (daysLeft === null || daysLeft > 0) ? (
              <RescuePlanTimeline rescuePlan={rescuePlan.days || []} />
            ) : (
              <div className="p-6 border border-dashed border-border-light dark:border-border-dark rounded-2xl flex flex-col items-center justify-center text-center space-y-2 h-full">
                <p className="text-sm font-semibold text-text-muted-light dark:text-text-muted-dark">
                  {daysLeft !== null && daysLeft <= 0 ? 'Exam has passed' : 'No rescue plan yet'}
                </p>
                <button onClick={() => navigate('/exam')} className="text-xs text-primary dark:text-accent hover:underline">
                  {daysLeft !== null && daysLeft <= 0 ? 'Archive & start new exam →' : 'Generate Plan →'}
                </button>
              </div>
            )}
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

      </div>
    </MainLayout>
  );
};

export default Dashboard;
