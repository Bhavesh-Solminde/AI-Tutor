import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Brain } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import api from '../lib/axiosClient';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';

const QuizResultView = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/api/quiz/result/${resultId}`);
        setResult(data.result);
      } catch (err) {
        setError('Could not load quiz result.');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-4 max-w-3xl mx-auto">
          <CardSkeleton lines={5} />
          <CardSkeleton lines={5} />
        </div>
      </MainLayout>
    );
  }

  if (error || !result) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
          <Brain className="h-10 w-10 text-slate-400" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            {error || 'Result not found.'}
          </p>
          <button
            onClick={() => navigate('/active-quizzes')}
            className="px-4 py-2 bg-primary dark:bg-accent text-white text-sm font-bold rounded-xl"
          >
            Back to History
          </button>
        </div>
      </MainLayout>
    );
  }

  const correctCount = result.questions?.filter((q) => q.isCorrect).length ?? result.score ?? 0;
  const totalCount = result.questions?.length ?? result.total ?? 0;
  const completedDate = result.completedAt
    ? new Date(result.completedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <MainLayout>
      <div className="space-y-6 text-left max-w-3xl mx-auto pb-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/active-quizzes')}
              className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-500">
                Quiz Review
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{result.topicName}</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500">{completedDate}</p>
            <div className="flex items-center space-x-2 justify-end mt-1">
              <span className="font-bold text-sm text-slate-800 dark:text-white font-mono">
                {correctCount}/{totalCount}
              </span>
              {result.passed ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="h-3 w-3" /><span>Passed</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                  <XCircle className="h-3 w-3" /><span>Failed</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        {result.questions && result.questions.length > 0 ? (
          <div className="space-y-5">
            {result.questions.map((q, idx) => (
              <div
                key={idx}
                className={`border rounded-2xl p-5 space-y-4 ${
                  q.isCorrect
                    ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5'
                    : 'border-red-500/20 bg-red-500/5 dark:bg-red-500/5'
                }`}
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-slate-800 dark:text-white leading-snug flex-1">
                    <span className="text-slate-400 font-mono mr-2">Q{idx + 1}.</span>
                    {q.question}
                  </p>
                  {q.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isCorrectOpt = oIdx === q.correctAnswer;
                    const isUserAnswer = oIdx === q.userAnswer;
                    let optClass = 'border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-400';
                    if (isCorrectOpt) optClass = 'border border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold';
                    else if (isUserAnswer && !isCorrectOpt) optClass = 'border border-red-400 bg-red-500/10 text-red-600 dark:text-red-400 line-through';

                    return (
                      <div key={oIdx} className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm ${optClass}`}>
                        <span className="font-mono font-bold text-[11px] opacity-60">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span>{opt}</span>
                        {isCorrectOpt && (
                          <span className="ml-auto text-[10px] font-bold text-emerald-600 dark:text-emerald-400">✓ Correct</span>
                        )}
                        {isUserAnswer && !isCorrectOpt && (
                          <span className="ml-auto text-[10px] font-bold text-red-500">✗ Your answer</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="px-4 py-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                      Explanation
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm">
            Question details not available for this attempt.
          </div>
        )}

        {/* Retry button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={() => navigate(`/quiz/${result.topicId}`)}
            className="px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow transition"
          >
            Retake This Quiz
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default QuizResultView;
