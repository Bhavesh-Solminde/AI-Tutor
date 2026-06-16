import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Clock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import RoadmapCanvas from '../components/roadmap/RoadmapCanvas';

const topics = [
  {
    id: 'cpu-scheduling',
    name: 'CPU Scheduling',
    description: 'First-Come First-Served (FCFS), Shortest Job First (SJF), and Round Robin CPU resource allocators.',
    status: 'mastered',
    mastery: 85,
    timeEst: '2h 30m',
    difficulty: 'Easy',
    statusPill: 'Mastered',
    connectedTo: 'virtual-memory',
    x: 230,
    y: 80
  },
  {
    id: 'virtual-memory',
    name: 'Virtual Memory',
    description: 'Demand paging, page faults, translation lookaside buffers (TLB), and LRU replacement policies.',
    status: 'learning',
    mastery: 40,
    timeEst: '2h 45m',
    difficulty: 'Medium',
    statusPill: 'Active',
    connectedTo: 'deadlocks',
    x: 430,
    y: 80
  },
  {
    id: 'deadlocks',
    name: 'Deadlocks',
    description: "Mutexes, semaphores, Banker's algorithm, and detection and recovery protocols.",
    status: 'unstarted',
    mastery: 0,
    timeEst: '3h 30m',
    difficulty: 'Hard',
    statusPill: 'Locked',
    noSequentialEdge: true,
    x: 630,
    y: 80
  },
  {
    id: 'process-sync',
    name: 'Process Sync',
    description: 'Critical section problem, synchronization hardware, Mutex locks, and semaphores.',
    status: 'unstarted',
    mastery: 0,
    timeEst: '2h 00m',
    difficulty: 'Medium',
    noSequentialEdge: true,
    x: 300,
    y: 280
  },
  {
    id: 'file-systems',
    name: 'File Systems',
    description: 'File concepts, access methods, directory structures, mount processes, and filesystem implementation.',
    status: 'unstarted',
    mastery: 0,
    timeEst: '4h 00m',
    difficulty: 'Hard',
    noSequentialEdge: true,
    x: 470,
    y: 280
  },
  {
    id: 'io-systems',
    name: 'I/O Systems',
    description: 'I/O hardware, application I/O interface, kernel I/O subsystem, and performance scheduling.',
    status: 'unstarted',
    mastery: 0,
    timeEst: '1h 30m',
    difficulty: 'Easy',
    noSequentialEdge: true,
    x: 640,
    y: 280
  }
];

const Roadmap = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState(null);

  return (
    <MainLayout>
      <div className="h-full flex flex-col justify-between relative">
        {/* Header section with pills */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 text-left">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operating Systems Roadmap</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Click a node to open details and start studying.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Orange Days Left Pill */}
            <span className="flex items-center space-x-1.5 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold shadow-sm">
              <Clock className="h-3.5 w-3.5" />
              <span>5 Days Left</span>
            </span>

            {/* Green Mastered Pill */}
            <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-sm">
              <Check className="h-3.5 w-3.5" />
              <span>1 Mastered</span>
            </span>

            {/* Yellow Active Pill */}
            <span className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-semibold shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>1 Active</span>
            </span>
          </div>
        </div>

        {/* Zoomable Canvas */}
        <RoadmapCanvas
          topics={topics}
          selectedTopic={selectedTopic}
          onNodeClick={(t) => setSelectedTopic(t)}
          onClosePopup={() => setSelectedTopic(null)}
          onStartTopic={(topic) => navigate(`/tutor/${topic.id}`)}
          onQuizTopic={(topic) => navigate(`/quiz/${topic.id}`)}
        />
      </div>
    </MainLayout>
  );
};

export default Roadmap;
