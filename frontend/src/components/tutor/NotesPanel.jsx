import React from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';

const NotesPanel = ({ topicId }) => {
  return (
    <div className="border border-border-light dark:border-border-dark rounded-2xl bg-white dark:bg-surface-dark overflow-y-auto p-6 text-left shadow-sm flex flex-col justify-between h-full">
      <div className="space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-border-light/40 dark:border-border-dark/40">
          <BookOpen className="h-4 w-4 text-[#666666]" />
          <span className="text-xs font-mono text-[#666666]">Class notes: OS_Syllabus_Unit1.pdf</span>
        </div>

        <article className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-4 text-[#4A4A4A] dark:text-slate-300">
          <h3 className="text-lg font-bold text-[#333333] dark:text-white">1.1 Introduction to Processor Scheduling</h3>
          <p>
            In a multi-programmed operating system, scheduling is the core method of multiplexing the physical CPU resource among running threads/processes. By maintaining a pool of ready-to-run processes in memory, the operating system can maximize CPU utilization and throughput.
          </p>
          <h4 className="text-base font-semibold text-[#333333] dark:text-white">Scheduling Criteria</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>CPU Utilization:</strong> Percentage of time the CPU is busy (Target: 40% to 90%).</li>
            <li><strong>Throughput:</strong> Number of processes completed per unit of time.</li>
            <li><strong>Turnaround Time:</strong> Total time from submission to completion.</li>
            <li><strong>Waiting Time:</strong> Total time spent waiting in the ready queue.</li>
            <li><strong>Response Time:</strong> Time from submission to first response (critical for interactive systems).</li>
          </ul>
          <h4 className="text-base font-semibold text-[#333333] dark:text-white">First-Come, First-Served (FCFS)</h4>
          <p>
            The simplest CPU scheduling algorithm is First-Come, First-Served. Ready queue processes are managed in a FIFO queue. The major drawback is the convoy effect, where smaller jobs wait for a single CPU-bound process to release the CPU.
          </p>
        </article>
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 flex items-start space-x-3 text-xs text-[#555555]">
        <AlertCircle className="h-4.5 w-4.5 text-primary dark:text-accent flex-shrink-0 mt-0.5" />
        <p>
          As you read the syllabus, NeuralNest-OS dynamically indexes references. Feel free to highlight text or ask questions directly in the tutor drawer.
        </p>
      </div>
    </div>
  );
};

export default NotesPanel;
