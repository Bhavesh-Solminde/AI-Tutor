import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Play, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ActiveQuizzes = () => {
  const navigate = useNavigate();

  const activeQuizzes = [
    { id: 'virtual-memory', name: 'Virtual Memory & Paging', answered: 4, total: 10, timeLeft: '04:12', progress: 40 },
    { id: 'cpu-scheduling', name: 'CPU Scheduling Algorithms', answered: 0, total: 10, timeLeft: '15:00', progress: 0 }
  ];

  const quizHistory = [
    { id: 'h1', topic: 'CPU Scheduling Algorithms', score: '9/10', status: 'pass', date: 'June 15, 2026', timeTaken: '8m 22s' },
    { id: 'h2', topic: 'OS Process Intro', score: '5/10', status: 'fail', date: 'June 12, 2026', timeTaken: '12m 45s' }
  ];

  return (
    <MainLayout>
      <div className="space-y-8 text-left">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Modules & Quizzes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resume in-progress practice modules, or review your historical testing record.
          </p>
        </div>

        {/* Active Quizzes */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
            Active Quizzes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeQuizzes.map((quiz) => (
              <div 
                key={quiz.id}
                className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-text-base-light dark:text-text-base-dark text-base leading-tight">
                      {quiz.name}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full font-bold">
                      ⏱ {quiz.timeLeft}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-text-muted-light dark:text-text-muted-dark">
                    <span>Progress: {quiz.answered}/{quiz.total} Questions</span>
                    <span>{quiz.progress}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-border-dark rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary dark:bg-accent transition-all duration-300"
                      style={{ width: `${quiz.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300 mt-2"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Resume Quiz</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz History */}
        <div className="space-y-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">
            Quiz History & Records
          </h2>
          
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
                      key={row.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-elevated-dark/20 transition cursor-pointer"
                      onClick={() => navigate(`/quiz/${row.id === 'h1' ? 'cpu-scheduling' : 'virtual-memory'}`)}
                    >
                      <td className="px-6 py-4 font-bold text-text-base-light dark:text-text-base-dark">
                        {row.topic}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-text-base-light dark:text-text-base-dark">
                        {row.score}
                      </td>
                      <td className="px-6 py-4">
                        {row.status === 'pass' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize font-mono">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Passed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20 capitalize font-mono">
                            <XCircle className="h-3 w-3" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-muted-light dark:text-text-muted-dark">
                        {row.date}
                      </td>
                      <td className="px-6 py-4 text-right text-text-muted-light dark:text-text-muted-dark font-mono">
                        {row.timeTaken}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ActiveQuizzes;
