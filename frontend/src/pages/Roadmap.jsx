import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Clock, GitFork, ChevronDown, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import MainLayout from '../components/layout/MainLayout';
import RoadmapCanvas from '../components/roadmap/RoadmapCanvas';
import { InlineErrorFallback } from '../components/ui/ErrorFallback';
import { RoadmapSkeleton } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import useSessionStore from '../stores/useSessionStore';
import useExamStore from '../stores/useExamStore';
import toast from 'react-hot-toast';
import YoutubeSuggestions from '../components/tutor/YoutubeSuggestions';

const Roadmap = () => {
  const navigate = useNavigate();
  const {
    currentSession, allSessions, roadmapNodes, roadmapEdges, fetchRoadmap,
    fetchUserSessions, switchSession, deleteCurrentSession, loading, error,
  } = useSessionStore();
  const { daysLeft } = useExamStore();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const switcherRef = useRef(null);

  // YouTube suggestions state
  const [showVideos, setShowVideos] = useState(false);
  const [hasVideos, setHasVideos] = useState(false);

  const handleVideosLoaded = (videos) => {
    setHasVideos(videos && videos.length > 0);
  };

  useEffect(() => {
    if (currentSession?._id) fetchRoadmap(currentSession._id);
    fetchUserSessions();
  }, [currentSession?._id]);

  // Re-fetch when user returns to this tab
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && currentSession?._id) fetchRoadmap(currentSession._id);
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [currentSession?._id]);

  // Close switcher on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSwitchSession = (session) => {
    setShowSwitcher(false);
    if (session._id === currentSession?._id) return;
    switchSession(session);
    fetchRoadmap(session._id);
  };

  const handleDelete = async () => {
    if (!currentSession?._id) return;
    setDeleting(true);
    try {
      await deleteCurrentSession(currentSession._id);
      toast.success('Roadmap deleted. Topics are archived.');
      setShowDeleteConfirm(false);
      // If there are other sessions, switch to the first one
      const remaining = allSessions.filter((s) => s._id !== currentSession._id);
      if (remaining.length > 0) {
        switchSession(remaining[0]);
        fetchRoadmap(remaining[0]._id);
      } else {
        navigate('/onboarding');
      }
    } catch {
      toast.error('Failed to delete roadmap.');
    } finally {
      setDeleting(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 text-left">
          <div className="flex flex-col gap-2">
            {/* Session name + switcher dropdown */}
            <div className="relative" ref={switcherRef}>
              <button
                onClick={() => setShowSwitcher((v) => !v)}
                className="flex items-center gap-2 group"
                disabled={allSessions.length <= 1}
              >
                <h1 className="text-2xl font-bold text-[#333333] dark:text-white truncate max-w-xs">
                  {sessionName}
                </h1>
                {allSessions.length > 1 && (
                  <ChevronDown className={`h-5 w-5 text-[#666666] transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
                )}
              </button>

              {showSwitcher && allSessions.length > 1 && (
                <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-xl z-50 overflow-hidden">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[#666666] px-3 pt-3 pb-1">
                    Switch Roadmap
                  </p>
                  {allSessions.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => handleSwitchSession(s)}
                      className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-white/60 dark:hover:bg-elevated-dark transition-colors ${
                        s._id === currentSession?._id ? 'font-bold text-primary dark:text-accent' : 'text-[#333333] dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{s.name}</span>
                      {s._id === currentSession?._id && (
                        <Check className="h-3.5 w-3.5 flex-shrink-0 text-primary dark:text-accent" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-[#555555] dark:text-[#666666]">
              Click any node to open details and start studying.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {total > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/80 dark:bg-slate-800 text-[#4A4A4A] dark:text-slate-300">
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
              <span className="flex items-center space-x-1.5 px-3 py-1 bg-primary text-white rounded-full text-xs font-semibold shadow-sm">
                <Clock className="h-3.5 w-3.5" /><span>{daysLeft} Days Left</span>
              </span>
            )}

            {/* New Roadmap */}
            {currentSession && (
              <button
                onClick={() => navigate('/onboarding')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-border-light dark:border-border-dark hover:bg-white/60 dark:hover:bg-elevated-dark text-[#4A4A4A] dark:text-slate-300 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                New Roadmap
              </button>
            )}

            {/* Delete — only when roadmap exists */}
            {currentSession && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}

            {/* Inline delete confirmation */}
            {showDeleteConfirm && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Topics will be archived.</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg disabled:opacity-50 transition"
                >
                  {deleting ? 'Deleting…' : 'Confirm'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs font-semibold text-[#555555] hover:text-[#333333] dark:text-[#666666]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* YouTube Suggestions Collapsible Panel */}
        {currentSession?.name && (
          <div className={`border border-[#EAE8E1]/60 dark:border-slate-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur rounded-2xl p-4 shadow-sm transition-all duration-300 ${hasVideos ? 'block' : 'hidden'}`}>
            <button
              onClick={() => setShowVideos((v) => !v)}
              className="flex items-center justify-between w-full text-left font-bold text-sm text-[#333333] dark:text-white"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.582 6.186a2.6 2.6 0 0 0-1.838-1.848C18.125 3.9 12 3.9 12 3.9s-6.125 0-7.744.438a2.6 2.6 0 0 0-1.838 1.848C2 7.82 2 12 2 12s0 4.18.418 5.814a2.6 2.6 0 0 0 1.838 1.848C5.875 20.1 12 20.1 12 20.1s6.125 0 7.744-.438a2.6 2.6 0 0 0 1.838-1.848C22 16.18 22 12 22 12s0-4.18-.418-5.814Z" fill="#FF0000"/>
                  <path d="M9.9 15.6 15.4 12 9.9 8.4v7.2Z" fill="#FFFFFF"/>
                </svg>
                <span className="font-extrabold uppercase tracking-wider text-xs">Recommended Videos for "{sessionName}"</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-[#666666] transition-transform duration-300 ${showVideos ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-4 transition-all duration-300 ${showVideos ? 'block' : 'hidden'}`}>
              <YoutubeSuggestions
                topic={currentSession.name}
                hideHeader={true}
                onLoaded={handleVideosLoaded}
              />
            </div>
          </div>
        )}

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
              serverEdges={roadmapEdges || []}
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
