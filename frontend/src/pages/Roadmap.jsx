import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Clock, GitFork } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import MainLayout from '../components/layout/MainLayout';
import RoadmapCanvas from '../components/roadmap/RoadmapCanvas';
import { InlineErrorFallback } from '../components/ui/ErrorFallback';
import { RoadmapSkeleton } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import useSessionStore from '../stores/useSessionStore';
import useAuthStore from '../stores/useAuthStore';
import useExamStore from '../stores/useExamStore';

const Roadmap = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession, roadmapNodes, fetchRoadmap, loading, error } = useSessionStore();
  const { daysLeft } = useExamStore();
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    if (currentSession?._id) {
      fetchRoadmap(currentSession._id);
    }
  }, [currentSession?._id]);

  // Re-fetch when the user returns to this tab (e.g. navigating back from quiz page)
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && currentSession?._id) {
        fetchRoadmap(currentSession._id);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [currentSession?._id]);

  // Normalize: API returns `label`; TopicNode expects `name`
  const normalizedNodes = (roadmapNodes || []).map((n) => ({
    ...n,
    name: n.name || n.label || 'Untitled Topic',
    x: n.position?.x ?? n.x ?? 0,
    y: n.position?.y ?? n.y ?? 0,
  }));

  const mastered    = normalizedNodes.filter((t) => t.status === 'mastered').length;
  const active      = normalizedNodes.filter((t) => t.status === 'learning').length;
  const total       = normalizedNodes.length;
  const sessionName = currentSession?.name || 'Your Study Roadmap';

  return (
    <MainLayout>
      <div className="h-full flex flex-col gap-4 relative">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-left">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{sessionName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Click any node to open details and start studying.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {total > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {total} Topics
              </span>
            )}
            {mastered > 0 && (
              <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-sm">
                <Check className="h-3.5 w-3.5" /><span>{mastered} Mastered</span>
              </span>
            )}
            {active > 0 && (
              <span className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold shadow-sm">
                <Sparkles className="h-3.5 w-3.5" /><span>{active} In Progress</span>
              </span>
            )}
            {daysLeft !== null && (
              <span className="flex items-center space-x-1.5 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold shadow-sm">
                <Clock className="h-3.5 w-3.5" /><span>{daysLeft} Days Left</span>
              </span>
            )}
          </div>
        </div>

        {/* ── Canvas ── */}
        <ErrorBoundary
          FallbackComponent={({ error: err, resetErrorBoundary }) => (
            <InlineErrorFallback
              error={err}
              resetErrorBoundary={resetErrorBoundary}
              message="Failed to render roadmap. Please try again."
            />
          )}
          onReset={() => currentSession?._id && fetchRoadmap(currentSession._id)}
        >
          {loading ? (
            <RoadmapSkeleton />
          ) : !currentSession ? (
            <EmptyState
              icon={GitFork}
              title="No roadmap yet"
              description="Upload a syllabus, paste notes, or pick a topic during onboarding to build your study roadmap."
              action={() => navigate('/onboarding')}
              actionLabel="Set Up Study Path"
            />
          ) : error ? (
            <InlineErrorFallback
              error={{ message: error }}
              resetErrorBoundary={() => fetchRoadmap(currentSession._id)}
              message={error}
            />
          ) : (
            <RoadmapCanvas
              topics={normalizedNodes}
              onNodeClick={(t) => setSelectedTopic(t)}
              selectedTopic={selectedTopic}
              onClosePopup={() => setSelectedTopic(null)}
              onStartTopic={(topic) => navigate(`/tutor/${topic._id || topic.id}?section=roadmap`)}
              onQuizTopic={(topic) => navigate(`/quiz/${topic._id || topic.id}?section=roadmap`)}
            />
          )}
        </ErrorBoundary>
      </div>
    </MainLayout>
  );
};

export default Roadmap;
