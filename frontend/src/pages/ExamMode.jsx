import React, { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Calendar, Sparkles, CheckCircle, Clock, Trash2, AlertTriangle, ChevronDown, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import useExamStore from '../stores/useExamStore';
import ExamSetupWizard from '../components/exam/ExamSetupWizard';
import RoadmapCanvas from '../components/roadmap/RoadmapCanvas';
import { RoadmapSkeleton, CardSkeleton } from '../components/ui/LoadingSkeleton';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const ExamMode = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    exam, topics, daysLeft, rescuePlan, setupComplete, loading,
    fetchExam, fetchStudyPlan, setSetupComplete, deleteExam,
  } = useExamStore();

  const [selectedTopic, setSelectedTopic] = React.useState(null);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const [resetting, setResetting] = React.useState(false);
  // Which day block is expanded in the timeline (null = all collapsed)
  const [expandedDay, setExpandedDay] = React.useState(null);

  const handleReset = async () => {
    if (!user?._id) return;
    setResetting(true);
    try {
      await deleteExam(user._id);
      toast.success('Exam setup reset. You can now start fresh.');
      setShowResetConfirm(false);
    } catch {
      toast.error('Failed to reset exam setup.');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchExam(user._id);
      fetchStudyPlan(user._id);
    }
  }, [user?._id]);

  const normalizedTopics = (topics || []).map((t) => ({
    ...t,
    id: t.id || t._id,
    name: t.name || t.label || 'Untitled Topic',
  }));

  const mastered = normalizedTopics.filter((t) => t.status === 'mastered').length;
  const active   = normalizedTopics.filter((t) => t.status === 'learning').length;

  return (
    <MainLayout>
      <div className="h-full flex flex-col justify-between text-left">
        {!setupComplete ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Exam Rescue Planner</h1>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark max-w-md mx-auto">
                  Set up your exam details and let our AI compile a prioritized, day-by-day rescue plan.
                </p>
              </div>
              <ExamSetupWizard onComplete={() => setSetupComplete(true)} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 flex flex-col h-full min-h-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-primary dark:text-accent">Exam rescue plan</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {exam?.subject || 'Your Exam'} Roadmap
                </h1>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
                  Click a node to open details and start studying.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {daysLeft !== null && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-semibold text-xs font-mono">
                    <Calendar className="h-4 w-4" />
                    <span>{daysLeft} Days Left</span>
                  </div>
                )}
                {mastered > 0 && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-semibold text-xs font-mono">
                    <CheckCircle className="h-4 w-4" />
                    <span>{mastered}/{topics.length} Mastered</span>
                  </div>
                )}
                {active > 0 && (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl font-semibold text-xs font-mono">
                    <Sparkles className="h-4 w-4" />
                    <span>{active} Active</span>
                  </div>
                )}
              </div>
              {/* Reset exam button */}
              <div className="flex items-center gap-2">
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset Exam Setup
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">This will clear your exam and rescue plan.</span>
                    <button
                      onClick={handleReset}
                      disabled={resetting}
                      className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded-lg disabled:opacity-50 transition"
                    >
                      {resetting ? 'Resetting…' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
              <div className="lg:col-span-8 flex flex-col h-[500px]">
                {loading ? <RoadmapSkeleton /> : normalizedTopics.length > 0 ? (
                  <RoadmapCanvas
                    topics={normalizedTopics}
                    onNodeClick={setSelectedTopic}
                    selectedTopic={selectedTopic}
                    onClosePopup={() => setSelectedTopic(null)}
                    onStartTopic={(topic) => navigate(`/tutor/${topic._id || topic.id}?section=exam`)}
                    onQuizTopic={(topic) => navigate(`/quiz/${topic._id || topic.id}`)}
                  />
                ) : (
                  <EmptyState
                    title="Generating your exam roadmap..."
                    description="The AI is analyzing your syllabus and building a prioritized topic list."
                  />
                )}
              </div>

              <div className="lg:col-span-4 border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col h-[500px] overflow-hidden">
                <div className="flex items-center space-x-2 border-b border-border-light dark:border-border-dark pb-3 mb-4">
                  <Clock className="h-4 w-4 text-text-muted-light dark:text-text-muted-dark" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Day-by-Day Rescue Timeline</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {loading ? (
                    <CardSkeleton lines={4} />
                  ) : rescuePlan?.days?.length > 0 ? (
                    rescuePlan.days.map((block) => {
                      const isExpanded = expandedDay === (block._id || block.dayNumber);
                      const dotColor = block.completed ? 'bg-emerald-500' : block.isMockExam ? 'bg-purple-500' : 'bg-amber-500';
                      return (
                        <div
                          key={block._id || block.dayNumber}
                          className={`rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                            block.completed
                              ? 'bg-emerald-500/5 border-emerald-500/25'
                              : block.isMockExam
                              ? 'bg-purple-500/5 border-purple-500/25'
                              : 'bg-slate-50 dark:bg-elevated-dark border-border-light dark:border-border-dark'
                          } ${isExpanded ? 'shadow-sm' : 'hover:border-slate-300 dark:hover:border-slate-600'}`}
                        >
                          {/* ── Header row — always visible, click to expand ── */}
                          <div
                            className="flex justify-between items-center p-3.5"
                            onClick={() => setExpandedDay(isExpanded ? null : (block._id || block.dayNumber))}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
                              <span className={`text-xs font-mono font-bold uppercase ${
                                block.completed ? 'text-emerald-700 dark:text-emerald-300'
                                : block.isMockExam ? 'text-purple-700 dark:text-purple-300'
                                : 'text-slate-700 dark:text-slate-200'
                              }`}>
                                {block.isMockExam ? '🎯 Mock Exam' : `Day ${block.dayNumber} Plan`}
                              </span>
                              {block.completed && (
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark">
                                {block.date ? new Date(block.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                              </span>
                              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>

                          {/* ── Expanded topics list ── */}
                          {isExpanded && (
                            <div className="border-t border-border-light dark:border-border-dark px-3.5 pb-3.5 pt-3 space-y-2">
                              {(block.topics || []).length === 0 ? (
                                <p className="text-xs text-slate-400 italic">No topics assigned to this day.</p>
                              ) : (
                                (block.topics || []).map((t, ti) => (
                                  <div key={t.topicId || t._id || ti} className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
                                      <span className="text-xs font-medium truncate text-slate-700 dark:text-slate-300">
                                        {t.topicName || t.name || 'Unnamed topic'}
                                      </span>
                                      {t.estimatedMinutes && (
                                        <span className="text-[10px] text-slate-400 flex-shrink-0">· {t.estimatedMinutes}m</span>
                                      )}
                                    </div>
                                    {t.topicId && !block.isMockExam && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/tutor/${t.topicId}?section=exam`); }}
                                        className="flex items-center gap-1 text-[10px] font-bold text-primary dark:text-accent hover:underline flex-shrink-0"
                                      >
                                        <BookOpen className="h-3 w-3" />
                                        Study
                                      </button>
                                    )}
                                  </div>
                                ))
                              )}
                              {block.isMockExam && (
                                <p className="text-xs text-purple-600 dark:text-purple-300 font-medium pt-1">
                                  📝 Full mock exam from past papers.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      Your rescue timeline will appear here after setup.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExamMode;
