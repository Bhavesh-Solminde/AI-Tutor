import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, FileText, Sparkles, BookOpen, GraduationCap, CheckCircle, Upload } from 'lucide-react';
import useAuthStore from '../stores/useAuthStore';
import useSessionStore from '../stores/useSessionStore';

import DropZone from '../components/onboarding/DropZone';
import ExplanationLevelCard from '../components/onboarding/ExplanationLevelCard';
import MasteryRatingSlider from '../components/onboarding/MasteryRatingSlider';
import ProgressStepper from '../components/onboarding/ProgressStepper';
import { MasterySliderSkeleton } from '../components/ui/LoadingSkeleton';

const Onboarding = () => {
  const { user, updateUser } = useAuthStore();
  const { uploadFile, uploadText, openSession, saveBaseline, topics, uploading, topicsProcessing, error: sessionError } = useSessionStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [inputType, setInputType] = useState('pdf');
  const [rawNotes, setRawNotes] = useState('');
  const [singleTopic, setSingleTopic] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // Actual File object
  const [explanationLevel, setExplanationLevel] = useState('beginner');
  const [ratings, setRatings] = useState({});
  const [localError, setLocalError] = useState('');
  const [nextLoading, setNextLoading] = useState(false);

  // When topics arrive (after step 1 upload), build initial ratings at 1 (Beginner)
  useEffect(() => {
    if (topics && topics.length > 0) {
      const initial = {};
      topics.forEach((t) => { initial[t._id] = 1; });
      setRatings(initial);
    }
  }, [topics]);

  const handleNextStep = async () => {
    setLocalError('');

    if (step === 1) {
      setNextLoading(true);
      try {
        if (inputType === 'pdf') {
          if (!selectedFile) { setLocalError('Please select a PDF file to upload.'); setNextLoading(false); return; }
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('sessionName', selectedFile.name);
          await uploadFile(formData);
        } else if (inputType === 'notes') {
          if (!rawNotes.trim()) { setLocalError('Please paste your study notes.'); setNextLoading(false); return; }
          await uploadText(rawNotes);
        } else if (inputType === 'topic') {
          if (!singleTopic.trim()) { setLocalError('Please enter a topic name.'); setNextLoading(false); return; }
          await openSession({ inputType: 'topic', content: singleTopic });
        }
        setNextLoading(false);
        setStep(2);
      } catch (err) {
        setLocalError(err.userMessage || err.message || 'Failed to process your input. Please try again.');
        setNextLoading(false);
      }
      return;
    }

    if (step === 2) { setStep(3); return; }

    if (step === 3) {
      setNextLoading(true);
      try {
        const result = await saveBaseline(ratings, explanationLevel);
        // Use the user returned by the API (has onboarded: true persisted in DB)
        if (result?.user) {
          updateUser(result.user);
        } else {
          updateUser({ explanationLevel, onboarded: true });
        }
        navigate('/roadmap');
      } catch (err) {
        setLocalError(err.userMessage || 'Failed to save your settings. Please try again.');
        setNextLoading(false);
      }
    }
  };

  const handleRatingChange = (topicId, val) => {
    setRatings((prev) => ({ ...prev, [topicId]: parseInt(val) }));
  };

  const displayError = localError || sessionError;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-text-primary-dark transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 grid-backdrop pointer-events-none opacity-40" />
      <ProgressStepper step={step} totalSteps={3} title="Setup Your Study Path" icon={GraduationCap} />

      <main className="relative z-10 max-w-3xl mx-auto w-full px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="p-8 rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark shadow-xl space-y-8">

          {step === 1 && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Step 1: Feed your AI Tutor</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Upload files, paste study sheets, or type a topic to teach you.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
                {[
                  { id: 'pdf', label: 'Upload Syllabus', icon: Upload },
                  { id: 'notes', label: 'Paste Notes', icon: FileText },
                  { id: 'topic', label: 'Single Topic', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => { setInputType(tab.id); setLocalError(''); }}
                      className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        inputType === tab.id
                          ? 'bg-white dark:bg-elevated-dark text-primary dark:text-primary shadow-sm border border-slate-200 dark:border-border-dark'
                          : 'text-slate-500 dark:text-text-muted-dark hover:text-slate-800 dark:hover:text-text-primary-dark'
                      }`}>
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="space-y-4 pt-2">
                {inputType === 'pdf' && (
                  <DropZone
                    selectedFileName={selectedFile?.name}
                    onFileSelected={(file) => setSelectedFile(file)}
                  />
                )}
                {inputType === 'notes' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Paste Your Notes</label>
                    <textarea
                      placeholder="Paste your typed class notes, textbook chapters, or handwritten transcripts here..."
                      rows={5}
                      value={rawNotes}
                      onChange={(e) => setRawNotes(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-elevated-dark text-slate-900 dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary transition-all duration-300 resize-none"
                    />
                  </div>
                )}
                {inputType === 'topic' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Operating System Scheduling Algorithms"
                      value={singleTopic}
                      onChange={(e) => setSingleTopic(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-elevated-dark text-slate-900 dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary transition-all duration-300"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Step 2: Choose Explanation Style</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Calibrate how simple or technical the AI should explain concepts.</p>
              </div>
              <div className="space-y-4">
                {[
                  { level: 'beginner', title: 'Beginner', icon: BookOpen, recommended: true, points: ['Terms defined immediately before use.', 'Real-world analogies for every concept.', 'Simple, conversational tone from zero.'] },
                  { level: 'intermediate', title: 'Intermediate', icon: Sparkles, recommended: false, points: ['Assumes general tech literacy.', 'Balanced technical accuracy and clarity.', 'Focused textbook-style examples.'] },
                  { level: 'advanced', title: 'Advanced', icon: GraduationCap, recommended: false, points: ['Dense, study-notes style explanations.', 'High-level domain terminology throughout.', 'Precise edge cases and engineering details.'] },
                ].map(({ level, title, icon, recommended, points }) => (
                  <ExplanationLevelCard
                    key={level}
                    level={level} title={title} icon={icon}
                    recommended={recommended}
                    active={explanationLevel === level}
                    onClick={() => setExplanationLevel(level)}
                    points={points}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Step 3: What do you already know?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rate your baseline familiarity (1–10). Adjusts starting difficulty.</p>
              </div>

              {/* Processing banner — shown while o4-mini extracts topics in background */}
              {topicsProcessing && topics.length === 0 && (
                <div className="flex items-center space-x-3 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                  <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary dark:text-accent">Generating your roadmap…</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">AI is analysing your syllabus and building study nodes. This takes ~60s.</p>
                  </div>
                </div>
              )}

              {uploading ? (
                <MasterySliderSkeleton />
              ) : topicsProcessing && topics.length === 0 ? (
                <MasterySliderSkeleton />
              ) : topics.length > 0 ? (
                <div className="space-y-5">
                  {topics.map((topic) => (
                    <MasteryRatingSlider
                      key={topic._id}
                      topic={topic.name}
                      rating={ratings[topic._id] || 1}
                      onChange={(_, val) => handleRatingChange(topic._id, val)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No topics extracted. You can adjust later from the roadmap.</p>
              )}
            </div>
          )}

          {displayError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-semibold text-red-500 dark:text-red-400">{displayError}</p>
            </div>
          )}

          <div className="pt-6 border-t border-border-light dark:border-border-dark flex justify-between">
            <button
              onClick={() => setStep((p) => Math.max(1, p - 1))}
              disabled={step === 1}
              className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition ${step === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleNextStep}
              disabled={nextLoading || uploading || (step === 3 && topicsProcessing && topics.length === 0)}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md shadow-primary/10 dark:shadow-accent/10 transition-all duration-300"
            >
              {(nextLoading || uploading) ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{step === 3 ? 'Generate Roadmap' : 'Next Step'}</span>
                  {step === 3 ? <CheckCircle className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-4xl mx-auto w-full px-6 py-4 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span>Logged in as: {user?.name || '—'}</span>
        <span>NeuralNest-OS</span>
      </footer>
    </div>
  );
};

export default Onboarding;
