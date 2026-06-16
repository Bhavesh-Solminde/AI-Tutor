import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChatHistoryList = ({ category }) => {
  // Mock data matching the category
  const historyData = {
    exam: [
      { id: '1', title: 'OS Prep: CPU Scheduling', date: '2h ago' },
      { id: '2', title: 'Exam Outline Review', date: 'Yesterday' }
    ],
    roadmap: [
      { id: '3', title: 'Virtual Memory Basics', date: '1d ago' },
      { id: '4', title: 'Deadlock Exercises', date: '3d ago' }
    ],
    other: [
      { id: '5', title: 'Operating Systems Intro', date: 'Jun 12' }
    ]
  };

  const items = historyData[category.toLowerCase()] || [];

  if (items.length === 0) {
    return <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark italic px-2 py-1">No chats</p>;
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            to={`/tutor/${item.id}`}
            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-elevated-dark text-xs text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark transition-colors duration-200"
          >
            <div className="flex items-center space-x-2 truncate">
              <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{item.title}</span>
            </div>
            <span className="text-[9px] font-mono text-text-muted-light/70 dark:text-text-muted-dark/60 ml-1 flex-shrink-0">
              {item.date}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default ChatHistoryList;
