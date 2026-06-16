import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import ExamSetupWizard from '../components/exam/ExamSetupWizard';
import RoadmapCanvas from '../components/roadmap/RoadmapCanvas';
import { Calendar, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExamMode = () => {
  const navigate = useNavigate();
  const [setupComplete, setSetupComplete] = useState(false);
  const [examData, setExamData] = useState({
    subjectName: '',
    examDate: '',
    daysLeft: 0,
  });

  const [topics] = useState([
    { id: 'cpu-scheduling', name: 'CPU Scheduling Algorithms', difficulty: 'Medium', time: '25m', status: 'mastered', progress: 90, pyqCount: 12, x: 50, y: 150 },
    { id: 'virtual-memory', name: 'Virtual Memory & Paging', difficulty: 'Hard', time: '35m', status: 'learning', progress: 45, pyqCount: 8, x: 270, y: 150 },
    { id: 'deadlocks', name: 'Deadlocks & Synchronization', difficulty: 'Hard', time: '30m', status: 'unstarted', progress: 0, pyqCount: 3, x: 490, y: 150 },
    { id: 'file-systems', name: 'File Systems & Disk I/O', difficulty: 'Easy', time: '20m', status: 'unstarted', progress: 0, pyqCount: 1, x: 710, y: 150 }
  ]);

  const [selectedTopic, setSelectedTopic] = useState(null);

  const handleSetupComplete = (data) => {
    const diff = new Date(data.examDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    setExamData({
      subjectName: data.subjectName,
      examDate: data.examDate,
      daysLeft: days >= 0 ? days : 0,
    });
    setSetupComplete(true);
  };

  const handleNodeClick = (topic) => {
    setSelectedTopic(topic);
  };

  const handleClosePopup = () => {
    setSelectedTopic(null);
  };

  const handleStartTopic = (topic) => {
    navigate(`/tutor/${topic.id}`);
  };

  const rescueTimeline = [
    { day: 1, date: 'Today', topics: ['Virtual Memory & Paging', 'CPU Scheduling Revision'], completed: true },
    { day: 2, date: 'Tomorrow', topics: ['Deadlocks & Synchronization'], completed: false },
    { day: 3, date: 'In 2 Days', topics: ['File Systems & Disk I/O'], completed: false },
    { day: 4, date: 'In 3 Days', topics: ['Full Syllabus Mock Exam'], completed: false, isMock: true }
  ];

  return (
    <MainLayout>
      <div className="h-full flex flex-col justify-between text-left">
        {!setupComplete ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Exam Rescue Planner</h1>
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark max-w-md mx-auto">
                  Set up your exam details and let our AI compile a prioritized, day-by-day rescue plan based on topic importance and difficulty.
                </p>
              </div>
              <ExamSetupWizard onComplete={handleSetupComplete} />
            </div>
          </div>
        ) : (
          <div className="space-y-6 flex flex-col h-full min-h-0">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-primary dark:text-accent">Exam rescue plan</span>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {examData.subjectName} Exam Roadmap
                </h1>
                <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-0.5">
                  Click a node to open details and start studying. Topics are prioritized by frequency.
                </p>
              </div>
              
              {/* Stats & Countdown */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-semibold text-xs font-mono">
                  <Calendar className="h-4 w-4" />
                  <span>{examData.daysLeft} Days Left</span>
                </div>
                
                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl font-semibold text-xs font-mono">
                  <CheckCircle className="h-4 w-4" />
                  <span>1/4 Mastered</span>
                </div>

                <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl font-semibold text-xs font-mono">
                  <Sparkles className="h-4 w-4" />
                  <span>1 Active</span>
                </div>
              </div>
            </div>

            {/* Layout Grid: Roadmap + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow min-h-0">
              {/* Roadmap Canvas */}
              <div className="lg:col-span-8 flex flex-col h-[500px]">
                <RoadmapCanvas
                  topics={topics}
                  onNodeClick={handleNodeClick}
                  selectedTopic={selectedTopic}
                  onClosePopup={handleClosePopup}
                  onStartTopic={handleStartTopic}
                  onQuizTopic={(topic) => navigate(`/quiz/${topic.id}`)}
                />
              </div>

              {/* Day Plan Strip */}
              <div className="lg:col-span-4 border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark p-6 shadow-sm flex flex-col h-[500px] overflow-hidden">
                <div className="flex items-center space-x-2 border-b border-border-light dark:border-border-dark pb-3 mb-4">
                  <Clock className="h-4 w-4 text-text-muted-light dark:text-text-muted-dark" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Day-by-Day Rescue Timeline</h3>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                  {rescueTimeline.map((block) => (
                    <div
                      key={block.day}
                      className={`p-3.5 rounded-xl border transition-colors ${
                        block.completed
                          ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-800 dark:text-emerald-300'
                          : block.isMock
                          ? 'bg-purple-500/5 border-purple-500/25 text-purple-800 dark:text-purple-300'
                          : 'bg-slate-50 dark:bg-elevated-dark border-border-light dark:border-border-dark text-text-base-light dark:text-text-base-dark'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-mono font-bold uppercase">Day {block.day} Plan</span>
                        <span className="text-[10px] font-mono text-text-muted-light dark:text-text-muted-dark">{block.date}</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        {block.topics.map((t) => (
                          <div key={t} className="flex items-center space-x-1.5 text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              block.completed ? 'bg-emerald-500' : block.isMock ? 'bg-purple-500' : 'bg-amber-500'
                            }`} />
                            <span className="font-medium truncate">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ExamMode;
