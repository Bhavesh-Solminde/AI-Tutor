import React from 'react';
import { Handle, Position } from 'reactflow';
import { Lock, Check, Sparkles, Clock, ChevronRight } from 'lucide-react';

const DIFF_CONFIG = {
  easy:   { label: 'Easy',   ring: 'ring-emerald-400/30', dot: 'bg-emerald-400', text: 'text-emerald-400' },
  medium: { label: 'Medium', ring: 'ring-amber-400/30',   dot: 'bg-amber-400',   text: 'text-amber-400'   },
  hard:   { label: 'Hard',   ring: 'ring-rose-400/30',    dot: 'bg-rose-400',    text: 'text-rose-400'    },
};

const TopicNode = ({ data }) => {
  const { topic, onClick, index } = data;

  // Support both 'name' (local) and 'label' (API) fields
  const topicName   = topic?.name || topic?.label || 'Untitled Topic';
  const isMastered  = topic?.status === 'mastered';
  const isLearning  = topic?.status === 'learning';
  const isUnstarted = !isMastered && !isLearning;
  const diff        = DIFF_CONFIG[topic?.difficulty] || DIFF_CONFIG.medium;
  const estTime     = topic?.estimatedMinutes ? `${topic.estimatedMinutes}m` : null;

  // ── Card styles ────────────────────────────────────────────────────────────
  let cardBase =
    'relative w-52 rounded-2xl border transition-all duration-300 cursor-pointer group ' +
    'shadow-sm hover:shadow-xl hover:-translate-y-0.5 select-none ';

  let cardBg, iconBg, iconColor, statusLabel, statusColor;

  if (isMastered) {
    cardBg      = 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-500/10 dark:border-emerald-500/25';
    iconBg      = 'bg-emerald-500';
    iconColor   = 'text-white';
    statusLabel = 'Mastered';
    statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  } else if (isLearning) {
    cardBg      = 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/10 dark:border-amber-500/25';
    iconBg      = 'bg-amber-500';
    iconColor   = 'text-white';
    statusLabel = 'In Progress';
    statusColor = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  } else {
    cardBg      = 'bg-white border-[#EAE8E1]/70 dark:bg-slate-900/60 dark:border-slate-700/50';
    iconBg      = 'bg-white/80 dark:bg-slate-800';
    iconColor   = 'text-[#666666] dark:text-[#555555]';
    statusLabel = 'Not Started';
    statusColor = 'text-[#666666] bg-white/80/80 dark:bg-slate-800/80 border-[#EAE8E1]/50 dark:border-slate-700/30';
  }

  return (
    <div
      className={cardBase + cardBg}
      onClick={(e) => { e.stopPropagation(); onClick?.(topic); }}
    >
      {/* ── Handles (invisible) ── */}
      <Handle type="target" position={Position.Left}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1, left: -1 }} />
      <Handle type="source" position={Position.Right}
        style={{ background: 'transparent', border: 'none', width: 1, height: 1, right: -1 }} />

      {/* ── Glow ring for active ── */}
      {isLearning && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-400/40 animate-pulse pointer-events-none" />
      )}

      <div className="p-4 space-y-3">
        {/* ── Top row: index badge + icon ── */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-[#666666] dark:text-[#555555] tracking-widest">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${iconBg}`}>
            {isMastered  && <Check    className={`h-4.5 w-4.5 ${iconColor}`} />}
            {isLearning  && <Sparkles className={`h-4 w-4 ${iconColor} animate-pulse`} />}
            {isUnstarted && <Lock     className={`h-4 w-4 ${iconColor}`} />}
          </div>
        </div>

        {/* ── Topic name ── */}
        <p className="text-sm font-bold text-[#333333] dark:text-white leading-snug line-clamp-2">
          {topicName}
        </p>

        {/* ── Bottom row: difficulty dot + time + chevron ── */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-1.5">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${diff.dot}`} />
            <span className={`text-[10px] font-semibold ${diff.text}`}>{diff.label}</span>
            {estTime && (
              <>
                <span className="text-slate-300 dark:text-[#333333]">·</span>
                <Clock className="h-2.5 w-2.5 text-[#666666]" />
                <span className="text-[10px] font-mono text-[#666666]">{estTime}</span>
              </>
            )}
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 dark:text-[#4A4A4A] group-hover:text-[#555555] dark:group-hover:text-[#666666] transition-colors" />
        </div>

        {/* ── Status pill ── */}
        <div className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${statusColor}`}>
          {statusLabel}
        </div>

        {/* ── PYQ hot badge ── */}
        {topic?.pyqCount > 0 && (
          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[9px] font-bold bg-rose-500 text-white rounded-full shadow-lg border-2 border-white dark:border-slate-900">
            🔥 {topic.pyqCount}x
          </span>
        )}

        {/* ── Mastery bar ── */}
        {(topic?.masteryScore ?? 0) > 0 && (
          <div className="pt-1">
            <div className="h-1 w-full rounded-full bg-white/80 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isMastered ? 'bg-emerald-500' : isLearning ? 'bg-amber-500' : 'bg-slate-300'
                }`}
                style={{ width: `${Math.min(topic.masteryScore, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicNode;
