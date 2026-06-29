import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';

// ── Colour per node ──────────────────────────────────────────────────
const NODE_COLORS = {
  ROUTER:     'text-blue-400',
  TUTOR_NODE: 'text-violet-400',
  GRADE_NODE: 'text-amber-400',
  DOUBT_NODE: 'text-emerald-400',
  QUIZ_NODE:  'text-rose-400',
};

// ── Colour per log type ───────────────────────────────────────────────
const LOG_TYPE_COLORS = {
  info:    'text-[#333333] dark:text-slate-100',
  success: 'text-emerald-400',
  warn:    'text-amber-400',
  error:   'text-red-400',
};

/**
 * AgentLogPanel
 *
 * A collapsible terminal panel rendered at the bottom of the Tutor page.
 * Reads `agentLogs` from useTutorStore and renders them as live log lines.
 * Auto-scrolls to the latest entry. Collapses to a single status bar by default.
 */
const AgentLogPanel = ({ logs = [], isStreaming = false }) => {
  const [expanded, setExpanded] = useState(false);
  const logEndRef = useRef(null);

  // Auto-open when streaming starts
  useEffect(() => {
    if (isStreaming && logs.length > 0) {
      setExpanded(true);
    }
  }, [isStreaming, logs.length]);

  // Auto-scroll to bottom when new log lines arrive
  useEffect(() => {
    if (expanded && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, expanded]);

  // Format the timestamp to HH:MM:SS
  const fmt = (iso) => {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const lastLog = logs[logs.length - 1];
  const hasLogs = logs.length > 0;

  return (
    <div className="flex-shrink-0 border-t border-border-light dark:border-border-dark bg-white dark:bg-[#090909] font-mono text-xs">
      {/* ── Header / Collapsed Bar ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/60 dark:hover:bg-[#111111] transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Activity
            className={`h-3.5 w-3.5 flex-shrink-0 ${isStreaming ? 'text-emerald-400 animate-pulse' : 'text-[#555555] dark:text-[#4A4A4A]'}`}
          />
          <span className="text-[#555555] dark:text-[#555555] uppercase tracking-widest text-[10px]">
            Agent Log
          </span>
          {hasLogs && (
            <span className="text-[#666666] dark:text-[#4A4A4A] text-[10px]">
              ({logs.length} events)
            </span>
          )}
          {/* Show last message when collapsed */}
          {!expanded && lastLog && (
            <span className={`hidden sm:inline truncate max-w-xs ml-2 ${NODE_COLORS[lastLog.node] || 'text-[#666666]'}`}>
              {lastLog.node}
            </span>
          )}
          {!expanded && lastLog && (
            <span className={`hidden sm:inline truncate max-w-sm ${LOG_TYPE_COLORS[lastLog.logType]}`}>
              {' '}— {lastLog.message}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              RUNNING
            </span>
          )}
          {expanded
            ? <ChevronDown className="h-3.5 w-3.5 text-[#555555]" />
            : <ChevronUp className="h-3.5 w-3.5 text-[#555555]" />
          }
        </div>
      </button>

      {/* ── Expanded log body ── */}
      {expanded && (
        <div className="px-4 pb-3 max-h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
          {logs.length === 0 ? (
            <div className="text-[#4A4A4A] py-2">Waiting for agent activity...</div>
          ) : (
            logs.map((entry, i) => (
              <div key={i} className="flex gap-3 items-start leading-snug">
                {/* Timestamp */}
                <span className="text-[#666666] dark:text-[#666666] flex-shrink-0 tabular-nums">[{fmt(entry.timestamp)}]</span>
                {/* Node name */}
                <span className={`flex-shrink-0 font-bold w-[88px] ${NODE_COLORS[entry.node] || 'text-[#666666]'}`}>
                  {entry.node}
                </span>
                {/* Message */}
                <span className={LOG_TYPE_COLORS[entry.logType]}>
                  {entry.message}
                </span>
              </div>
            ))
          )}
          {/* Blinking cursor while streaming */}
          {isStreaming && (
            <div className="flex gap-3">
              <span className="text-[#666666] dark:text-[#666666] tabular-nums">[{fmt(new Date().toISOString())}]</span>
              <span className="text-[#4A4A4A] animate-pulse">█</span>
            </div>
          )}
          <div ref={logEndRef} />
        </div>
      )}
    </div>
  );
};

export default AgentLogPanel;
