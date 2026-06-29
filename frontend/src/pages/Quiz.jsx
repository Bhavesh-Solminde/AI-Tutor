import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import useTimer from '../hooks/useTimer';
import useQuizStore from '../stores/useQuizStore';
import useAuthStore from '../stores/useAuthStore';
import useExamStore from '../stores/useExamStore';

import LivesBar from '../components/quiz/LivesBar';
import QuizCard from '../components/quiz/QuizCard';
import ScoreSummary from '../components/quiz/ScoreSummary';
import QuizSteps from '../components/quiz/QuizSteps';
import QuizTimer from '../components/quiz/QuizTimer';
import { QuizSkeleton } from '../components/ui/LoadingSkeleton';
import useAutoplayNature from '../hooks/useAutoplayNature';

const Quiz = () => {
  useAutoplayNature();
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { exam } = useExamStore();
  const {
    questions, timeLimit, loading, submitting, error, result,
    generateQuiz, submitQuiz, clearResult,
  } = useQuizStore();

  const [currQ, setCurrQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(5);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(0);
  const [showXpPopup, setShowXpPopup] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());

  const handleTimeExpired = () => setQuizFinished(true);
  const { seconds, pause, reset: resetTimer, formatTime } = useTimer(timeLimit || 600, handleTimeExpired);

  // Generate questions on mount
  useEffect(() => {
    clearResult();
    setCurrQ(0); setSelectedOpt(null); setIsAnswered(false);
    setLives(5); setScore(0); setXp(0);
    setQuizFinished(false); setAnswers({});

    generateQuiz(topicId).catch(() => {
      // Error already handled by store and toast
    });
  }, [topicId]);

  // Reset timer when questions load
  useEffect(() => {
    if (timeLimit) resetTimer(timeLimit);
  }, [timeLimit]);

  // Auto-finish when lives run out
  useEffect(() => {
    if (lives <= 0) { setQuizFinished(true); pause(); }
  }, [lives]);

  const handleOptionSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    const isCorrect = idx === questions[currQ]?.correct;
    setAnswers((prev) => ({ ...prev, [currQ]: { selected: idx, isCorrect } }));
    if (isCorrect) {
      setScore((p) => p + 1);
      setXp((p) => p + 20);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 1200);
    } else {
      setLives((p) => Math.max(0, p - 1));
    }
  };

  const handleNext = () => {
    setSelectedOpt(null); setIsAnswered(false); setShowExplanation(false);
    if (currQ < questions.length - 1) {
      setCurrQ((p) => p + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    pause();
    setQuizFinished(true);
    const timeTaken = Math.round((Date.now() - startTime) / 60000);
    await submitQuiz({
      topicId,
      answers,
      questions,
      selfRatingAfter: Math.round((score / Math.max(questions.length, 1)) * 10),
      examDate: exam?.examDate,
      timeTaken,
    });
  };

  const handleRestart = () => {
    clearResult();
    setCurrQ(0); setSelectedOpt(null); setIsAnswered(false);
    setLives(5); setScore(0); setXp(0);
    setQuizFinished(false); setShowExplanation(false); setAnswers({});
    generateQuiz(topicId);
  };

  // Loading state
  if (loading) {
    return (
      <MainLayout>
        <div className="h-full flex flex-col space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-border-light dark:border-border-dark">
            <button onClick={() => navigate(`/tutor/${topicId}`)} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-white/80 dark:hover:bg-slate-800 transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-primary">Practice Module</span>
              <h2 className="text-lg font-bold text-[#333333] dark:text-white">Generating Quiz...</h2>
            </div>
          </div>
          <QuizSkeleton />
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error && questions.length === 0) {
    return (
      <MainLayout>
        <div className="h-full flex flex-col items-center justify-center space-y-4 text-center">
          <Brain className="h-12 w-12 text-[#666666]" />
          <p className="text-sm font-semibold text-[#333333] dark:text-slate-300">{error}</p>
          <button onClick={() => generateQuiz(topicId)} className="px-4 py-2 bg-primary dark:bg-accent text-white text-sm font-bold rounded-xl">
            Try Again
          </button>
          <button onClick={() => navigate(`/tutor/${topicId}`)} className="text-xs text-[#666666] hover:text-[#4A4A4A] dark:hover:text-slate-300">
            Back to lesson
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-full flex flex-col justify-between text-left">
        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(`/tutor/${topicId}`)} className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-white/80 dark:hover:bg-slate-800 transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-primary">Practice Module</span>
              <h2 className="text-lg font-bold text-[#333333] dark:text-white">Topic Mastery Quiz</h2>
            </div>
          </div>
          {!quizFinished && (
            <div className="flex items-center space-x-4">
              <QuizTimer seconds={seconds} maxSeconds={timeLimit || 600} formattedTime={formatTime()} />
              <LivesBar lives={lives} xp={xp} />
            </div>
          )}
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 items-start">
          {!quizFinished && questions.length > 0 && (
            <div className="lg:col-span-3">
              <QuizSteps totalQuestions={questions.length} currentIdx={currQ} answers={answers} />
            </div>
          )}
          <div className={`${quizFinished ? 'lg:col-span-12' : 'lg:col-span-9'} space-y-6`}>
            {!quizFinished && questions.length > 0 ? (
              <QuizCard
                question={questions[currQ]}
                selectedOpt={selectedOpt}
                isAnswered={isAnswered}
                onSelect={handleOptionSelect}
                onNext={handleNext}
                showExplanation={showExplanation}
                setShowExplanation={setShowExplanation}
                currQ={currQ}
                totalQs={questions.length}
                showXpPopup={showXpPopup}
              />
            ) : quizFinished ? (
              <ScoreSummary
                score={score}
                total={questions.length}
                xp={result?.xpEarned || xp}
                passed={result?.passed}
                masteryDelta={result?.masteryDelta}
                onRetry={handleRestart}
                onBack={() => navigate('/roadmap')}
              />
            ) : null}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Quiz;
