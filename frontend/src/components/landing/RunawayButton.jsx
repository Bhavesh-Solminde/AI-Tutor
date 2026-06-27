import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const TAUNTS = [
  'Nice try 😅',
  'Too slow! 🏃',
  'Catch me if you can',
  'Your GPA is crying',
  'Not today, friend',
  'The exam awaits 📚',
  'Denied. Study instead.',
  'Missed me!',
  'Bold move. Still no.',
  'Your future self says no',
];

const RunawayButton = () => {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  const [taunt, setTaunt] = useState(null);
  const lastTaunt = useRef(-1);
  const tauntTimer = useRef(null);

  const pickTaunt = () => {
    let i = Math.floor(Math.random() * TAUNTS.length);
    if (i === lastTaunt.current) i = (i + 1) % TAUNTS.length;
    lastTaunt.current = i;
    return TAUNTS[i];
  };

  const flee = () => {
    if (reduce) return;
    
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const pad = 24;

      // Pick random coords in the viewport
      const targetScreenX = pad + Math.random() * (window.innerWidth - w - pad * 2);
      const targetScreenY = pad + Math.random() * (window.innerHeight - h - pad * 2);

      // Find original screen offset by subtracting current transforms
      const originalScreenX = rect.left - (pos?.x || 0);
      const originalScreenY = rect.top - (pos?.y || 0);

      const offsetX = targetScreenX - originalScreenX;
      const offsetY = targetScreenY - originalScreenY;

      setPos({ x: offsetX, y: offsetY });
    }
    
    setTaunt(pickTaunt());
    if (tauntTimer.current) clearTimeout(tauntTimer.current);
    tauntTimer.current = setTimeout(() => setTaunt(null), 1400);
  };

  const button = (
    <button
      ref={ref}
      type="button"
      onMouseEnter={flee}
      onFocus={flee}
      onClick={flee}
      className="w-full sm:w-auto px-8 py-3.5 border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-white font-semibold rounded-xl transition-colors relative inline-flex items-center justify-center whitespace-nowrap shadow-sm"
    >
      No thanks, I'll fail my exam alone
      <AnimatePresence mode="wait">
        {taunt && (
          <motion.span
            key={taunt}
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-2.5 py-1 text-[11px] text-slate-900 dark:text-white shadow-lg"
          >
            {taunt}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );

  return (
    <div className="relative inline-block w-full sm:w-auto h-[52px] sm:min-w-[300px]">
      <motion.div
        className="absolute left-0 top-0 z-[9999] w-full"
        animate={{ x: pos?.x || 0, y: pos?.y || 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {button}
      </motion.div>
    </div>
  );
};

export default RunawayButton;
