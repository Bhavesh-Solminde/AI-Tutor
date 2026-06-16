import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import useTimer from '../hooks/useTimer';

// Components
import LivesBar from '../components/quiz/LivesBar';
import QuizCard from '../components/quiz/QuizCard';
import ScoreSummary from '../components/quiz/ScoreSummary';
import QuizSteps from '../components/quiz/QuizSteps';
import QuizTimer from '../components/quiz/QuizTimer';

const Quiz = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();

  const questions = [
    {
      q: "Which CPU scheduling algorithm is non-preemptive and can suffer from the Convoy Effect?",
      options: [
        "Round Robin (RR)",
        "First-Come, First-Served (FCFS)",
        "Shortest Remaining Time First (SRTF)",
        "Priority Scheduling (Preemptive)"
      ],
      optionsTags: ["A", "B", "C", "D"], // added tags support
      correct: 1,
      explanation: "FCFS executes processes in the exact order they arrive. If a long process runs first, smaller processes are queued behind it, creating a Convoy Effect."
    },
    {
      q: "What is the primary formula used to calculate a process's waiting time in a FIFO queue?",
      options: [
        "Waiting Time = Start Time - Arrival Time",
        "Waiting Time = Burst Time + Response Time",
        "Waiting Time = Turnaround Time + Arrival Time",
        "Waiting Time = Finish Time - Burst Time"
      ],
      optionsTags: ["A", "B", "C", "D"],
      correct: 0,
      explanation: "Waiting time is the total duration a process waits in the ready queue before execution starts: Waiting Time = Start Time - Arrival Time."
    },
    {
      q: "Which metric is critical to minimize in interactive operating systems?",
      options: [
        "Throughput",
        "CPU Utilization",
        "Response Time",
        "Turnaround Time"
      ],
      optionsTags: ["A", "B", "C", "D"],
      correct: 2,
      explanation: "Response time is the duration from command submission to first output. Interactive systems must minimize response time to feel snappy to users."
    }
  ];

  const MAX_SECONDS = 180; // 3 minutes

  const handleTimeExpired = () => {
    setQuizFinished(true);
  };

  const { seconds, pause, reset: resetTimer, formatTime } = useTimer(MAX_SECONDS, handleTimeExpired);

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

  const handleOptionSelect = (idx) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);

    const isCorrect = idx === questions[currQ].correct;
    
    setAnswers(prev => ({
      ...prev,
      [currQ]: { selected: idx, isCorrect }
    }));

    if (isCorrect) {
      setScore(prev => prev + 1);
      setXp(prev => prev + 20);
      setShowXpPopup(true);
      setTimeout(() => setShowXpPopup(false), 1200);
    } else {
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    setSelectedOpt(null);
    setIsAnswered(false);
    setShowExplanation(false);
    
    if (currQ < questions.length - 1) {
      setCurrQ(prev => prev + 1);
    } else {
      setQuizFinished(true);
      pause();
    }
  };

  const handleRestart = () => {
    setCurrQ(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setLives(5);
    setScore(0);
    setXp(0);
    setQuizFinished(false);
    setShowExplanation(false);
    setAnswers({});
    resetTimer(MAX_SECONDS);
  };

  useEffect(() => {
    if (lives <= 0) {
      setQuizFinished(true);
      pause();
    }
  }, [lives, pause]);

  return (
    <MainLayout>
      <div className="h-full flex flex-col justify-between text-left">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(`/tutor/${topicId}`)}
              className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-500">Practice Module</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Topic Mastery Quiz</h2>
            </div>
          </div>

          {!quizFinished && (
            <div className="flex items-center space-x-4">
              <QuizTimer 
                seconds={seconds} 
                maxSeconds={MAX_SECONDS} 
                formattedTime={formatTime()} 
              />
              <LivesBar
                lives={lives}
                xp={xp}
              />
            </div>
          )}
        </div>

        {/* Main Grid content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 items-start">
          {!quizFinished && (
            <div className="lg:col-span-3">
              <QuizSteps
                totalQuestions={questions.length}
                currentIdx={currQ}
                answers={answers}
              />
            </div>
          )}

          <div className={`${quizFinished ? 'lg:col-span-12' : 'lg:col-span-9'} space-y-6`}>
            {!quizFinished ? (
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
            ) : (
              <ScoreSummary
                score={score}
                total={questions.length}
                xp={xp}
                onRetry={handleRestart}
                onBack={() => navigate('/roadmap')}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Quiz;
