import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, FileText, Sparkles, BookOpen, GraduationCap, CheckCircle, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Components
import DropZone from '../components/onboarding/DropZone';
import ExplanationLevelCard from '../components/onboarding/ExplanationLevelCard';
import MasteryRatingSlider from '../components/onboarding/MasteryRatingSlider';
import ProgressStepper from '../components/onboarding/ProgressStepper';

const Onboarding = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1 States
  const [inputType, setInputType] = useState('pdf');
  const [rawNotes, setRawNotes] = useState('');
  const [singleTopic, setSingleTopic] = useState('');
  const [fileName, setFileName] = useState('');

  // Step 2 States
  const [explanationLevel, setExplanationLevel] = useState('beginner');

  // Step 3 States
  const [ratings, setRatings] = useState({
    'CPU Scheduling Algorithms': 3,
    'Virtual Memory & Paging': 2,
    'Deadlocks & Synchronization': 2,
    'File Systems & Disk I/O': 1
  });

  const handleNextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      updateUser({
        explanationLevel: explanationLevel,
        onboarded: true,
        sessionSetup: {
          inputType,
          fileName: inputType === 'pdf' ? fileName || 'operating_systems_syllabus.pdf' : null,
          ratings
        }
      });
      navigate('/roadmap');
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleRatingChange = (topic, val) => {
    setRatings(prev => ({
      ...prev,
      [topic]: parseInt(val)
    }));
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-text-primary-dark transition-colors duration-300 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute inset-0 grid-backdrop pointer-events-none opacity-40"></div>

      <ProgressStepper
        step={step}
        totalSteps={3}
        title="Setup Your Study Path"
        icon={GraduationCap}
      />

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
                  { id: 'topic', label: 'Single Topic', icon: Sparkles }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setInputType(tab.id)}
                      className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        inputType === tab.id
                          ? 'bg-white dark:bg-elevated-dark text-primary dark:text-primary shadow-sm border border-slate-200 dark:border-border-dark'
                          : 'text-slate-500 dark:text-text-muted-dark hover:text-slate-800 dark:hover:text-text-primary-dark'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4 pt-2">
                {inputType === 'pdf' && (
                  <DropZone
                    selectedFileName={fileName}
                    onFileSelected={(file) => setFileName(file.name)}
                  />
                )}

                {inputType === 'notes' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Paste Your Notes
                    </label>
                    <textarea
                      placeholder="Paste your typed class notes, textbook chapters, or handwritten transcripts here..."
                      rows={5}
                      value={rawNotes}
                      onChange={(e) => setRawNotes(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-elevated-dark text-slate-900 dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-elevated-dark transition-all duration-300 resize-none"
                    />
                  </div>
                )}

                {inputType === 'topic' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Target Topic
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Operating System Scheduling Algorithms"
                      value={singleTopic}
                      onChange={(e) => setSingleTopic(e.target.value)}
                      className="w-full px-4 py-3 text-sm rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-elevated-dark text-slate-900 dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-elevated-dark transition-all duration-300"
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
                <ExplanationLevelCard
                  level="beginner"
                  title="Beginner"
                  recommended={true}
                  icon={BookOpen}
                  active={explanationLevel === 'beginner'}
                  onClick={() => setExplanationLevel('beginner')}
                  points={[
                    "Technical terms and jargon are defined immediately before use.",
                    "Uses real-world analogies (e.g. comparing RAM to a desk surface).",
                    "Simple, conversational tone starting from zero assumptions."
                  ]}
                />

                <ExplanationLevelCard
                  level="intermediate"
                  title="Intermediate"
                  recommended={false}
                  icon={Sparkles}
                  active={explanationLevel === 'intermediate'}
                  onClick={() => setExplanationLevel('intermediate')}
                  points={[
                    "Assumes general tech literacy; briefly explains specific academic terms.",
                    "Balanced blend of technical accuracy and clear phrasing.",
                    "Includes focused textbook-style examples."
                  ]}
                />

                <ExplanationLevelCard
                  level="advanced"
                  title="Advanced"
                  recommended={false}
                  icon={GraduationCap}
                  active={explanationLevel === 'advanced'}
                  onClick={() => setExplanationLevel('advanced')}
                  points={[
                    "Dense, technical, study-notes style explanations.",
                    "Uses high-level domain terminology without hand-holding definitions.",
                    "Focuses on precise edge cases and system engineering parameters."
                  ]}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-left">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Step 3: What do you already know?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Rate your baseline familiarity (1–10). This adjusts the starting roadmap difficulty.</p>
              </div>

              <div className="space-y-5">
                {Object.entries(ratings).map(([topic, rating]) => (
                  <MasteryRatingSlider
                    key={topic}
                    topic={topic}
                    rating={rating}
                    onChange={handleRatingChange}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-border-light dark:border-border-dark flex justify-between">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-sm font-semibold border border-border-light dark:border-border-dark text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition ${
                step === 1 ? 'opacity-30 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              className="flex items-center space-x-1.5 px-6 py-2.5 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 text-white rounded-xl font-bold shadow-md shadow-primary/10 dark:shadow-accent/10 transition-all duration-300"
            >
              <span>{step === 3 ? 'Generate Roadmap' : 'Next Step'}</span>
              {step === 3 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 max-w-4xl mx-auto w-full px-6 py-4 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
        <span>Logged in as: {user?.name || 'Guest'}</span>
        <span>NeuralNest-OS Core Engine</span>
      </footer>
    </div>
  );
};

export default Onboarding;
