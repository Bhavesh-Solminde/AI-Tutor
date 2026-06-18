import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Award, Calendar, Brain, Sparkles } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import useQuizStore from '../stores/useQuizStore';
import MathMarkdown from '../components/ui/MathMarkdown';
import { QuizSkeleton } from '../components/ui/LoadingSkeleton';

const QuizResultView = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { fetchQuizResult } = useQuizStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resultId) {
      setLoading(true);
      fetchQuizResult(resultId)
        .then((data) => {
          setResult(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.userMessage || err.message || 'Failed to load quiz result.');
          setLoading(false);
        });
    }
  }, [resultId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex flex-col space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-border-light dark:border-border-dark text-left">
            <button onClick={() => navigate('/active-quizzes')} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-500">Quiz History</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Loading results...</h2>
            </div>
          </div>
          <QuizSkeleton />
        </div>
      </MainLayout>
    );
  }

  if (error || !result) {
    return (
      <MainLayout>
        <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
          <Brain className="h-12 w-12 text-slate-400 animate-bounce" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{error || 'Quiz result not found'}</p>
          <button onClick={() => navigate('/active-quizzes')} className="px-4 py-2 bg-primary dark:bg-accent text-white text-sm font-bold rounded-xl shadow-md hover:bg-primary-hover dark:hover:bg-accent/90 transition">
            Back to Active Quizzes
          </button>
        </div>
      </MainLayout>
    );
  }

  const scorePercentage = Math.round((result.score / result.total) * 100);

  return (
    <MainLayout>
      <div className="space-y-8 text-left max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-border-light dark:border-border-dark">
          <button onClick={() => navigate('/active-quizzes')} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-500">Quiz History & Records</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{result.topicName}</h2>
          </div>
        </div>

        {/* Scorecard Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${result.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              {result.passed ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Status</p>
              <p className={`text-base font-bold ${result.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                {result.passed ? 'Passed' : 'Failed'}
              </p>
            </div>
          </div>

          <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary dark:text-accent dark:bg-accent/10">
              <span className="text-lg font-bold font-mono">{result.score}/{result.total}</span>
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Score</p>
              <p className="text-base font-bold text-slate-950 dark:text-white">{scorePercentage}%</p>
            </div>
          </div>

          <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">XP Gained</p>
              <p className="text-base font-bold text-slate-950 dark:text-white">+{result.xpEarned} XP</p>
            </div>
          </div>

          <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-5 shadow-sm flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase">Completed Date</p>
              <p className="text-xs font-bold text-slate-950 dark:text-white mt-1">
                {new Date(result.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary dark:text-accent" />
            <span>Question-by-Question Review</span>
          </h3>

          <div className="space-y-6">
            {result.questions.map((q, idx) => {
              return (
                <div 
                  key={idx} 
                  className={`border rounded-2xl p-6 shadow-sm space-y-4 bg-white dark:bg-surface-dark ${
                    q.isCorrect 
                      ? 'border-emerald-500/20 dark:border-emerald-500/10' 
                      : 'border-red-500/20 dark:border-red-500/10'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-mono text-slate-400">Question {idx + 1}</span>
                      <div className="text-base font-semibold text-slate-950 dark:text-white leading-relaxed">
                        <MathMarkdown content={q.question} />
                      </div>
                    </div>
                    {q.isCorrect ? (
                      <span className="flex items-center space-x-1 text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-xs font-mono font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {q.options.map((opt, oIdx) => {
                      const isUserSelected = q.userAnswer === oIdx;
                      const isCorrectAnswer = q.correctAnswer === oIdx;
                      
                      let btnClasses = 'w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all duration-200 flex justify-between items-center ';
                      if (isCorrectAnswer) {
                        btnClasses += 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold';
                      } else if (isUserSelected && !q.isCorrect) {
                        btnClasses += 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-semibold';
                      } else {
                        btnClasses += 'border-border-light dark:border-border-dark bg-slate-50/20 dark:bg-slate-900/10 text-slate-500 dark:text-slate-400 opacity-70';
                      }

                      return (
                        <div key={oIdx} className={btnClasses}>
                          <div className="flex-grow text-left">
                            <MathMarkdown content={opt} />
                          </div>
                          {isCorrectAnswer && (
                            <span className="text-[10px] font-bold uppercase font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 ml-2 flex-shrink-0">
                              Correct Answer
                            </span>
                          )}
                          {isUserSelected && !isCorrectAnswer && (
                            <span className="text-[10px] font-bold uppercase font-mono text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 ml-2 flex-shrink-0">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Box */}
                  <div className="p-4 rounded-xl bg-explanation-light dark:bg-explanation-dark border border-emerald-500/10 space-y-1">
                    <p className="text-xs font-bold text-primary dark:text-accent flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                      <span>Explanation</span>
                    </p>
                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      <MathMarkdown content={q.explanation} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-border-light dark:border-border-dark flex justify-end">
          <button
            onClick={() => navigate('/active-quizzes')}
            className="px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 text-white font-bold text-sm rounded-xl shadow-md transition"
          >
            Back to Active Quizzes
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizResultView;
