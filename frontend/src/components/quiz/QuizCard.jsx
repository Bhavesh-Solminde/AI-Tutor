import React from 'react';
import { AlertTriangle, HelpCircle, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import AnswerOptionButton from './AnswerOptionButton';
import XPPopup from './XPPopup';

const QuizCard = ({
  question,
  selectedOpt,
  isAnswered,
  onSelect,
  onNext,
  showExplanation,
  setShowExplanation,
  currQ,
  totalQs,
  showXpPopup
}) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-8 shadow-sm relative text-left">
      {/* XP Popup animation */}
      <XPPopup show={showXpPopup} />

      <div className="space-y-4">
        <span className="text-xs font-mono text-slate-400">
          Question {currQ + 1} of {totalQs}
        </span>
        <h3 className="text-xl font-bold text-slate-950 dark:text-white leading-snug">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="mt-8 space-y-3">
        {question.options.map((opt, idx) => (
          <AnswerOptionButton
            key={idx}
            opt={opt}
            idx={idx}
            isSelected={selectedOpt === idx}
            isCorrect={idx === question.correct}
            isAnswered={isAnswered}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Actions & Feedback */}
      {isAnswered && (
        <div className="mt-8 pt-6 border-t border-border-light dark:border-border-dark flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {selectedOpt === question.correct ? (
            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Correct! You gained +20 XP.</span>
            </div>
          ) : (
            <div className="text-left space-y-2 p-3 rounded-xl bg-wrong-answer-light dark:bg-wrong-answer-dark">
              <p className="text-red-500 text-sm font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Incorrect answer! Lost 1 heart.</span>
              </p>
              <button
                onClick={() => setShowExplanation(true)}
                className="text-xs text-primary dark:text-primary hover:underline flex items-center space-x-1 font-semibold"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Explain correct answer</span>
              </button>
            </div>
          )}

          <button
            onClick={onNext}
            className="flex items-center space-x-1.5 px-6 py-2 bg-primary dark:bg-accent text-white font-bold text-sm rounded-xl shadow hover:bg-primary-hover dark:hover:bg-accent/90 transition"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Adaptive explanation box */}
      {showExplanation && (
        <div className="mt-4 p-4 rounded-xl bg-explanation-light dark:bg-explanation-dark border border-emerald-500/20 text-xs text-left leading-relaxed">
          <p className="font-bold text-primary dark:text-accent flex items-center space-x-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Adaptive Tutor Explanation</span>
          </p>
          <p className="text-slate-600 dark:text-slate-400">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default QuizCard;
