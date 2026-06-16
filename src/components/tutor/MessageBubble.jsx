import React from 'react';

const MessageBubble = ({ msg, children }) => {
  const isUser = msg.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white dark:bg-primary dark:text-white rounded-tr-none shadow-md'
            : 'border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-slate-800 dark:text-text-primary-dark rounded-tl-none shadow-sm'
        }`}
      >
        <div className="whitespace-pre-line">{msg.text}</div>
      </div>
      {children}
    </div>
  );
};

export default MessageBubble;
