import React from 'react';
import { Handle, Position } from 'reactflow';
import { Lock, Check, Sparkles } from 'lucide-react';

const TopicNode = ({ data }) => {
  const { topic, onClick } = data;
  const isMastered = topic.status === 'mastered';
  const isLearning = topic.status === 'learning';
  const isUnstarted = topic.status === 'unstarted';

  // Resolve circles styles based on mockup RoadmapLight.png
  let circleClasses = 'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 relative ';
  if (isMastered) {
    circleClasses += 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10';
  } else if (isLearning) {
    circleClasses += 'bg-white dark:bg-surface-dark border-2 border-amber-500 text-amber-500 ring-8 ring-amber-500/10 shadow-lg';
  } else {
    circleClasses += 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 text-slate-400 shadow-sm';
  }

  // Resolve status pills
  const renderStatusPill = () => {
    if (!topic.statusPill) return null;
    const pillText = topic.statusPill;
    let pillBg = '';
    if (pillText === 'Mastered') pillBg = 'bg-emerald-500';
    else if (pillText === 'Active') pillBg = 'bg-amber-500';
    else if (pillText === 'Locked') pillBg = 'bg-slate-800 dark:bg-slate-900';

    return (
      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white uppercase tracking-wider ${pillBg}`}>
        {pillText}
      </span>
    );
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick(topic);
      }}
      className="flex flex-col items-center justify-center select-none cursor-pointer w-32 relative"
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: 'transparent', border: 'none', width: 0, height: 0 }}
      />

      {/* Circle Icon Container */}
      <div className={circleClasses}>
        {isMastered && <Check className="h-7 w-7" />}
        {isLearning && <Sparkles className="h-7 w-7 fill-amber-500/10 text-amber-500 animate-pulse" />}
        {isUnstarted && <Lock className="h-5 w-5 text-slate-400" />}

        {/* PYQ Count Badge if exists */}
        {topic.pyqCount && (
          <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 text-[8px] font-bold font-mono bg-red-500 text-white rounded-full flex items-center space-x-0.5 shadow-sm border border-red-600 z-10">
            <span>🔥</span>
            <span>{topic.pyqCount}</span>
          </span>
        )}
      </div>

      {/* Label and Status Badge below circle */}
      <div className="mt-2.5 flex flex-col items-center space-y-1 text-center w-full">
        <span className="text-xs font-bold text-slate-800 dark:text-text-primary-dark max-w-[110px] leading-tight truncate px-1">
          {topic.name.split(' & ')[0]}
        </span>
        {renderStatusPill()}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: 'transparent', border: 'none', width: 0, height: 0 }}
      />
    </div>
  );
};

export default TopicNode;
