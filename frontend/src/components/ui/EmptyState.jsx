import React from 'react';
import { Inbox } from 'lucide-react';

/**
 * Reusable empty state component — never leaves users staring at a blank section.
 */
export default function EmptyState({ icon: Icon = Inbox, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</p>
        {description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{description}</p>
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
