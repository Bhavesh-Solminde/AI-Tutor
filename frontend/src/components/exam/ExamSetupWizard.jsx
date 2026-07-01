import React, { useState } from 'react';
import ExamDatePicker from './ExamDatePicker';
import SyllabusUpload from './SyllabusUpload';
import PYQUpload from './PYQUpload';
import PYQInsightDialog from './PYQInsightDialog';
import { ArrowRight, ArrowLeft, BookOpen, Clock, Lightbulb, Info } from 'lucide-react';
import useExamStore from '../../stores/useExamStore';
import toast from 'react-hot-toast';

const ExamSetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [pyqFile, setPyqFile] = useState(null);
  const [hoursPerDay, setHoursPerDay] = useState(6);
  const [localError, setLocalError] = useState('');

  // PYQ insight dialog state
  const [showPYQDialog, setShowPYQDialog] = useState(false);
  const [pyqInsights, setPyqInsights] = useState(null);
  const [generating, setGenerating] = useState(false);

  const { setupExam, uploadSyllabus, uploadPYQ, generateStudyPlan, examSessionId, loading, daysLeft } = useExamStore();

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
          return;
        }
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      // Step 3: ask study hours per day, then upload PYQ (if any)
      setStep(4);
      return;
    }

    if (step === 4) {
      // Upload PYQ if provided
      let pyqData = null;
      if (pyqFile) {
        try {
          const fd = new FormData();
          fd.append('file', pyqFile);
          pyqData = await uploadPYQ(fd);
          if (pyqData?.recalibrated) {
            toast.success('Past papers analyzed and topics weighted!');
          }
        } catch {
          return;
        }
      }

      // Show PYQ insight dialog before generating plan
      // Pre-compute insights from pyqData or skip if none
      if (pyqData?.topicFrequencies && Object.keys(pyqData.topicFrequencies).length > 0) {
        const freqEntries = Object.entries(pyqData.topicFrequencies)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8);
        const insights = {
          topTopics: freqEntries.map(([name, freq]) => ({
            name,
            frequency: freq,
            importance: freq >= 5 ? 'Critical' : freq >= 3 ? 'High' : 'Medium',
          })),
          coveragePercent: 0, // will be computed server-side
          topicCount: freqEntries.length,
          unfeasibleTopics: [],
        };
        setPyqInsights(insights);
        setShowPYQDialog(true);
      } else {
        // No PYQ — generate immediately
        await doGeneratePlan();
      }
    }
  };

  const doGeneratePlan = async () => {
    setGenerating(true);
    try {
      const sessionId = examSessionId;
      const result = await generateStudyPlan({ sessionId, examDate, hoursPerDay });

      // Update insights with server response (includes unfeasibleTopics)
      if (result?.pyqInsights) {
        setPyqInsights(result.pyqInsights);
      }
      toast.success('Your rescue plan is ready! 🎯');
      setShowPYQDialog(false);
      onComplete();
    } catch {
      // Error already toasted
    } finally {
      setGenerating(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const stepsList = ['Exam Details', 'Syllabus', 'Study Hours', 'Past Papers'];

  return (
    <>
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
                      : 'bg-white/80 dark:bg-elevated-dark text-text-muted-light dark:text-text-muted-dark'
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
                    <div className="h-0.5 flex-grow mx-4 bg-white/80 dark:bg-border-dark hidden sm:block" />
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

          {/* Step 3 — How many hours/day can you study? */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 dark:bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-primary dark:text-accent" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#333333] dark:text-white">Daily Study Hours</h3>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    How many hours can you realistically study each day?
                    <br />Your plan will be scheduled around this budget.
                  </p>
                </div>
              </div>

              {/* Hours slider */}
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-extrabold text-[#333333] dark:text-white">{hoursPerDay}</span>
                  <span className="text-sm text-text-muted-light dark:text-text-muted-dark mb-2">hours / day</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full h-2 rounded-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-text-muted-light dark:text-text-muted-dark">
                  <span>1h (light)</span>
                  <span>6h (normal)</span>
                  <span>12h (crunch)</span>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="flex gap-2">
                {[3, 6, 8, 10].map((h) => (
                  <button
                    key={h}
                    onClick={() => setHoursPerDay(h)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      hoursPerDay === h
                        ? 'bg-primary text-white border-primary dark:bg-accent dark:border-accent'
                        : 'border-border-light dark:border-border-dark text-text-muted-light dark:text-text-muted-dark hover:border-primary/50'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>

              <p className="flex items-center gap-1.5 text-[10px] text-text-muted-light dark:text-text-muted-dark">
                <Lightbulb className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                Hard topics are given more time automatically. Mastered topics get a quick revision slot only.
              </p>
            </div>
          )}

          {step === 4 && (
            <PYQUpload
              file={pyqFile}
              onFileChange={setPyqFile}
              onSkip={() => {
                toast('Skipping PYQ — plan will be weighted by mastery only', { icon: '📖', duration: 3000 });
                doGeneratePlan();
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
            disabled={loading || generating}
            className={`flex items-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-md transition-all duration-300 ${
              loading || generating ? 'bg-slate-300 dark:bg-elevated-dark text-[#666666] cursor-not-allowed shadow-none' : 'bg-cta hover:bg-cta-hover'
            }`}
          >
            {loading || generating ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{step === 4 ? 'Analyse & Generate Plan' : 'Next'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* PYQ Insight Dialog — shown after PYQ upload, before plan generation */}
      {showPYQDialog && (
        <PYQInsightDialog
          pyqInsights={pyqInsights}
          daysLeft={daysLeft}
          hoursPerDay={hoursPerDay}
          loading={generating}
          onConfirm={doGeneratePlan}
          onClose={() => setShowPYQDialog(false)}
        />
      )}
    </>
  );
};

export default ExamSetupWizard;
