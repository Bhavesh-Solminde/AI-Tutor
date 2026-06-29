import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component — never leaves users staring at a blank section.
 */
export default function EmptyState({ icon: Icon = Inbox, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-white/80 dark:bg-slate-800 flex items-center justify-center">
        <Icon className="h-6 w-6 text-[#666666] dark:text-[#555555]" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[#333333] dark:text-slate-300">{title}</p>
        {description && (
          <p className="text-xs text-[#555555] dark:text-[#666666] max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
