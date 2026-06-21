import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const CollapsibleSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="space-y-1.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-sans font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors duration-200"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>
      
      {isOpen && (
        <div className="px-3 pl-6 space-y-1 border-l border-border-light dark:border-border-dark ml-6 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
