import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * If the AI accidentally streams the raw JSON object instead of just the
 * explanation text, extract the `explanation` field so the UI never shows
 * raw JSON to the user.
 */
const extractDisplayText = (text) => {
  if (!text) return text;

  // Fast-path: if it doesn't look like JSON, return as-is
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return text;

  try {
    // Strip markdown code fences that the model sometimes wraps around JSON
    const clean = trimmed
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed.explanation === 'string') {
      return parsed.explanation;
    }
  } catch {
    // Not valid JSON — return as-is
  }

  return text;
};

const MessageBubble = ({ msg, children }) => {
  const isUser = msg.sender === 'user';
  const displayText = isUser ? msg.text : extractDisplayText(msg.text);

  // Markdown components — styled to match the app's design system
  const markdownComponents = {
    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-text-primary-light dark:text-text-primary-dark">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    ul: ({ children }) => <ul className="list-disc list-outside space-y-2 my-3 ml-5">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside space-y-2 my-3 ml-5">{children}</ol>,
    li: ({ children }) => <li className="text-sm leading-relaxed pl-1 [&>p]:inline">{children}</li>,
    h2: ({ children }) => <h2 className="text-base font-bold text-text-primary-light dark:text-text-primary-dark mt-3 mb-1">{children}</h2>,
    h3: ({ children }) => <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mt-2 mb-1">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary dark:border-accent pl-3 my-2 text-text-muted-light dark:text-text-muted-dark italic">
        {children}
      </blockquote>
    ),
    code: ({ inline, children }) =>
      inline ? (
        <code className="bg-white/80 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-primary dark:text-accent">
          {children}
        </code>
      ) : (
        <pre className="bg-white/80 dark:bg-slate-800 rounded-lg p-3 my-2 text-xs font-mono overflow-x-auto">
          <code>{children}</code>
        </pre>
      ),
    hr: () => <hr className="border-border-light dark:border-border-dark my-3" />,
  };

  if (msg.sender === 'system') {
    return (
      <div className="flex justify-center my-3 w-full">
        <div className="bg-white/80 dark:bg-slate-800/80 text-text-muted-light dark:text-text-muted-dark text-xs rounded-full px-4 py-1.5 font-medium border border-border-light/50 dark:border-border-dark/50 max-w-[85%] text-center">
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-primary text-white dark:bg-primary dark:text-white rounded-tr-none shadow-md'
            : 'border border-border-light dark:border-border-dark bg-white dark:bg-surface-dark text-text-primary-light dark:text-text-primary-dark rounded-tl-none shadow-sm'
        }`}
      >
        {isUser ? (
          // User messages — plain text
          <div className="whitespace-pre-line">{msg.text}</div>
        ) : (
          // AI messages — render markdown
          <div className="prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {displayText || ''}
            </ReactMarkdown>
            {/* Blinking cursor while streaming */}
            {msg.isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-slate-400 dark:bg-slate-500 ml-0.5 animate-pulse align-middle" />
            )}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default MessageBubble;
