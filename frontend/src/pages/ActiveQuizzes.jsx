import React, { useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, XCircle, BookOpen } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import useQuizStore from '../stores/useQuizStore';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';

const ActiveQuizzes = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { quizHistory, activeQuizzes, fetchQuizHistory, fetchActiveQuizzes, loading } = useQuizStore();

  useEffect(() => {
    if (user?._id) {
      fetchQuizHistory(user._id);
      fetchActiveQuizzes(user._id);
    }
  }, [user?._id]);

  return (
    <MainLayout>
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Modules & Quizzes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resume in-progress practice modules or review your historical testing record.
          </p>
        </div>

        {/* Active Quizzes */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Active Quizzes</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton lines={4} />
              <CardSkeleton lines={4} />
            </div>
          ) : activeQuizzes.length === 0 ? (
            <EmptyState
              icon={Play}
              title="No active quizzes"
              description="Start a lesson and click 'Proceed to Quiz' to begin a practice session."
              action={() => navigate('/roadmap')}
              actionLabel="Go to Roadmap"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeQuizzes.map((quiz) => (
                <div key={quiz._id} className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-text-base-light dark:text-text-base-dark text-base leading-tight">{quiz.topicName}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-bold">
                        ⏱ In Progress
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-text-muted-light dark:text-text-muted-dark">
                      <span>Progress: {quiz.answeredCount || 0}/{quiz.totalQuestions || 10} Questions</span>
                      <span>{Math.round(((quiz.answeredCount || 0) / (quiz.totalQuestions || 10)) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-border-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary dark:bg-accent transition-all duration-300"
                        style={{ width: `${Math.round(((quiz.answeredCount || 0) / (quiz.totalQuestions || 10)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/quiz/${quiz.topicId}`)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300 mt-2"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Resume Quiz</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz History */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Quiz History & Records</h2>
          {loading ? (
            <CardSkeleton lines={5} />
          ) : quizHistory.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No quiz history yet"
              description="Complete your first quiz to see your scores and results here."
            />
          ) : (
            <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/10 text-text-muted-light dark:text-text-muted-dark text-[10px] font-mono uppercase tracking-wider text-left">
                      <th className="px-6 py-3 font-semibold">Topic Module</th>
                      <th className="px-6 py-3 font-semibold">Score</th>
                      <th className="px-6 py-3 font-semibold">Result</th>
                      <th className="px-6 py-3 font-semibold">Completed Date</th>
                      <th className="px-6 py-3 font-semibold text-right">Time Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light dark:divide-border-dark text-xs">
                    {quizHistory.map((row) => (
                      <tr
                        key={row._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-elevated-dark/20 transition cursor-pointer"
                        onClick={() => navigate(`/quiz/result/${row._id}`)}
                        title="Click to review this attempt"
                      >
                        <td className="px-6 py-4 font-bold text-text-base-light dark:text-text-base-dark">{row.topicName || row.topicId}</td>
                        <td className="px-6 py-4 font-mono font-bold text-text-base-light dark:text-text-base-dark">
                          {row.correctAnswers}/{row.totalQuestions}
                        </td>
                        <td className="px-6 py-4">
                          {row.passed ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                              <CheckCircle2 className="h-3 w-3" /><span>Passed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 font-mono">
                              <XCircle className="h-3 w-3" /><span>Failed</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-text-muted-light dark:text-text-muted-dark">
                          {new Date(row.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right text-text-muted-light dark:text-text-muted-dark font-mono">
                          {row.timeTaken ? `${row.timeTaken}m` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ActiveQuizzes;
