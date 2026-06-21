import React, { useState } from 'react';
import ExamDatePicker from './ExamDatePicker';
import SyllabusUpload from './SyllabusUpload';
import PYQUpload from './PYQUpload';
import { ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import useExamStore from '../../stores/useExamStore';
import toast from 'react-hot-toast';

const ExamSetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [pyqFile, setPyqFile] = useState(null);
  const [localError, setLocalError] = useState('');

  const { setupExam, uploadSyllabus, uploadPYQ, generateStudyPlan, examSessionId, loading } = useExamStore();

  const handleNext = async () => {
    setLocalError('');

    if (step === 1) {
      if (!subjectName.trim()) { setLocalError('Please enter your subject name.'); return; }
      if (!examDate) { setLocalError('Please select your exam date.'); return; }
      const examDay = new Date(examDate);
      if (examDay <= new Date()) { setLocalError('Exam date must be in the future.'); return; }

      try {
        await setupExam({ subject: subjectName, examDate });
        setStep(2);
      } catch {
        // Error already handled by store + toast
      }
      return;
    }

    if (step === 2) {
      if (syllabusFile) {
        try {
          const fd = new FormData();
          fd.append('file', syllabusFile);
          await uploadSyllabus(fd);
        } catch {
          return; // Don't proceed if upload failed
        }
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (pyqFile) {
        try {
          const fd = new FormData();
          fd.append('file', pyqFile);
          const pyqResult = await uploadPYQ(fd);
          if (pyqResult?.recalibrated) {
            toast.success('Past papers analyzed and study plan recalibrated!');
          }
        } catch {
          return;
        }
      }
      // Generate the study plan
      try {
        await generateStudyPlan({ sessionId: examSessionId, examDate });
        toast.success('Your rescue plan is ready!');
        onComplete();
      } catch {
        // Error already toasted
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const stepsList = ['Exam Details', 'Syllabus', 'Past Papers'];

  return (
    <div className="max-w-xl mx-auto border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark rounded-3xl p-8 shadow-lg space-y-8 text-left">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-primary dark:text-accent">
          <BookOpen className="h-5 w-5" />
          <span className="text-xs font-mono uppercase tracking-wider font-bold">Rescue Plan setup</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          {stepsList.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive ? 'bg-primary text-white dark:bg-accent'
                    : isCompleted ? 'bg-emerald-500 text-white'
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
          <SyllabusUpload file={syllabusFile} onFileChange={setSyllabusFile} onSkip={() => setStep(3)} />
        )}
        {step === 3 && (
          <PYQUpload 
          file={pyqFile} 
          onFileChange={setPyqFile} 
          onSkip={() => {
            toast('Skipping PYQ — searching online for past papers...', { icon: '🔍', duration: 3000 });
            handleNext();
          }} 
        />
        )}
      </div>

      {localError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-xs font-semibold text-red-500">{localError}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border-light dark:border-border-dark pt-6 mt-4">
        {step > 1 ? (
          <button onClick={handleBack} className="flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold rounded-xl text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        ) : <div />}
        <button
          onClick={handleNext}
          disabled={loading}
          className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-300 ${
            loading ? 'bg-slate-300 dark:bg-elevated-dark text-slate-400 cursor-not-allowed shadow-none' : 'bg-cta hover:bg-cta-hover'
          }`}
        >
          {loading ? (
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{step === 3 ? 'Generate Roadmap' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExamSetupWizard;
