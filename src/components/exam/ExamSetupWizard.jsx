import React, { useState } from 'react';
import ExamDatePicker from './ExamDatePicker';
import SyllabusUpload from './SyllabusUpload';
import PYQUpload from './PYQUpload';
import { ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';

const ExamSetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [pyqFile, setPyqFile] = useState(null);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ subjectName, examDate, syllabusFile, pyqFile });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isNextDisabled = () => {
    if (step === 1) {
      return !subjectName.trim() || !examDate;
    }
    return false;
  };

  const stepsList = ['Exam Details', 'Syllabus', 'Past Papers'];

  return (
    <div className="max-w-xl mx-auto border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-lg space-y-8 text-left">
      {/* Header with progress step bubbles */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-primary dark:text-accent">
          <BookOpen className="h-5 w-5" />
          <span className="text-xs font-mono uppercase tracking-wider font-bold">Rescue Plan setup</span>
        </div>
        
        {/* Step indicator bar */}
        <div className="flex items-center justify-between pt-1">
          {stepsList.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-white dark:bg-accent'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-elevated-dark text-text-muted-light dark:text-text-muted-dark'
                  }`}>
                    {stepNum}
                  </div>
                  <span className={`text-xs font-semibold hidden sm:inline ${
                    isActive ? 'text-text-base-light dark:text-text-base-dark' : 'text-text-muted-light dark:text-text-muted-dark'
                  }`}>
                    {label}
                  </span>
                </div>
                {index < stepsList.length - 1 && (
                  <div className="h-0.5 flex-grow mx-4 bg-slate-100 dark:bg-border-dark hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="min-h-[220px]">
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-text-muted-light dark:text-text-muted-dark">Subject Name</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-transparent text-text-base-light dark:text-text-base-dark focus:outline-none focus:border-primary dark:focus:border-accent transition-colors duration-200"
              />
            </div>
            
            <ExamDatePicker value={examDate} onChange={setExamDate} />
          </div>
        )}

        {step === 2 && (
          <SyllabusUpload
            file={syllabusFile}
            onFileChange={setSyllabusFile}
            onSkip={handleNext}
          />
        )}

        {step === 3 && (
          <PYQUpload
            file={pyqFile}
            onFileChange={setPyqFile}
            onSkip={handleNext}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-6 mt-4">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={handleNext}
          disabled={isNextDisabled()}
          className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-300 ${
            isNextDisabled()
              ? 'bg-slate-300 dark:bg-elevated-dark text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-cta hover:bg-cta-hover'
          }`}
        >
          <span>{step === 3 ? 'Generate Roadmap' : 'Next'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ExamSetupWizard;
