import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, Brain, Globe, MessageSquare, Layers, ArrowUp, AlertCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ComprehensionChips from './ComprehensionChips';
import QuickActionCards from './QuickActionCards';
import YoutubeSuggestions from './YoutubeSuggestions';

const TutorChatPanel = ({
  messages,
  isTyping,
  inputVal,
  setInputVal,
  onSend,
  onChipClick,
  showDoubtBox,
  setShowDoubtBox,
  explanationLevel,
  onAttachClick,
  materialsCount = 0,
  topicName,
  isNewSession = true
}) => {
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const isChatEmpty = messages.filter(m => m.type !== 'system').length === 0;
  const hideInputBox = isChatEmpty && !isNewSession;

  return (
    <div className="flex flex-col justify-between h-full text-left relative bg-transparent overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-4 min-h-0 flex flex-col scrollbar-thin">
        <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col justify-center">
          {isChatEmpty ? (
            isNewSession ? (
              <div className="flex-grow flex flex-col items-center justify-center space-y-7 py-8 my-auto">
              {/* Mascot Logo - Solid Blue Squircle with White Brain Icon */}
              <div className="w-16 h-16 bg-primary dark:bg-accent rounded-[20px] text-white flex items-center justify-center shadow-lg shadow-primary/20 dark:shadow-accent/20 flex-shrink-0">
                <Brain className="h-8 w-8 text-white" />
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="font-extrabold text-2xl text-[#333333] dark:text-white">Hello, I'm NeuralNest</h3>
                <p className="text-sm text-[#555555] dark:text-[#666666] max-w-md mx-auto">
                  Your AI-powered learning companion. What would you like to explore today?
                </p>
              </div>

              {/* Suggestions Grid */}
              <QuickActionCards onActionClick={onSend} />

              {/* Footer Quick Links */}
              <div className="flex items-center justify-center space-x-2 text-xs text-[#666666] dark:text-[#555555] pt-3">
                <button className="hover:text-[#4A4A4A] dark:hover:text-slate-300 transition-colors">View More</button>
                <span>•</span>
                <button className="hover:text-[#4A4A4A] dark:hover:text-slate-300 transition-colors">View Previous Chat Sessions</button>
              </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center space-y-4 py-8 my-auto text-center">
                <div className="w-16 h-16 bg-primary/10 dark:bg-accent/10 rounded-2xl text-primary dark:text-accent flex items-center justify-center mb-2 shadow-sm">
                  <Brain className="h-8 w-8" />
                </div>
                <h3 className="font-extrabold text-2xl text-[#333333] dark:text-white">Ready to master this topic?</h3>
                <p className="text-sm text-[#555555] dark:text-[#666666] max-w-md">
                  Click the button below to have your AI tutor start teaching <strong>{topicName}</strong> from the beginning.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-6 pt-4 w-full flex-grow">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} msg={msg}>
                  {msg.sender === 'ai' && msg.showChips && (
                    <div className="space-y-3 mt-3 w-full">
                      <YoutubeSuggestions topic={topicName} />
                      <ComprehensionChips onChipClick={onChipClick} />
                      <p className="text-xs text-[#666666] dark:text-[#555555] italic font-medium mt-1">
                        Do you have any doubts or questions before we move on?
                      </p>
                    </div>
                  )}
                </MessageBubble>
              ))}
            </div>
          )}

          {isTyping && (
            <div className="flex items-center space-x-2 text-[#666666] mt-4 px-1 flex-shrink-0">
              <div className="h-2 w-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <span className="text-xs font-sans">Tutor is teaching...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Floating Pinned Input Card at bottom */}
      {!hideInputBox && (
        <div className="px-2 pb-2 pt-0 bg-transparent border-none flex-shrink-0">
          <div className="w-full bg-white dark:bg-surface-dark border border-[#EAE8E1] dark:border-border-dark rounded-[24px] shadow-lg p-3.5 transition-all duration-300">
          
          {/* Top part: Borderless input/textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask your AI tutor anything..."
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-1 bg-transparent text-[#333333] dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none text-sm border-none resize-none overflow-y-auto"
            style={{ minHeight: '28px', maxHeight: '150px' }}
          />

          {/* Bottom part: Tools Row */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 px-1">
            {/* Left side actions */}
            <div className="flex items-center space-x-3 text-[#666666] dark:text-[#555555]">
              <button
                onClick={onAttachClick}
                className="hover:text-primary dark:hover:text-accent transition-colors p-1"
                title="Attach materials"
              >
                <Paperclip className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`transition-colors p-1 ${
                  webSearchEnabled
                    ? 'text-primary dark:text-accent'
                    : 'hover:text-primary dark:hover:text-accent'
                }`}
                title={webSearchEnabled ? 'Web Search: ON' : 'Web Search: OFF'}
              >
                <Globe className="h-4.5 w-4.5" />
              </button>

              <button
                onClick={() => setShowDoubtBox(!showDoubtBox)}
                className={`transition-colors p-1 ${showDoubtBox ? 'text-primary dark:text-accent' : 'hover:text-primary dark:hover:text-accent'}`}
                title="Toggle Doubt Mode"
              >
                <MessageSquare className="h-4.5 w-4.5" />
              </button>

              {/* Materials Badge */}
              <button
                onClick={onAttachClick}
                className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-elevated-dark text-[#4A4A4A] dark:text-slate-300 text-[10px] font-bold font-sans flex items-center space-x-1 hover:bg-slate-200 transition-colors"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>{materialsCount} materials</span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              <span className="text-[10px] text-[#666666] font-sans hidden sm:inline">
                Mode: {explanationLevel}{webSearchEnabled ? ' · Web' : ''}
              </span>



              <button
                onClick={() => {
                  onSend();
                  if (textareaRef.current) textareaRef.current.style.height = 'auto';
                }}
                className="h-9 w-9 bg-primary hover:bg-primary-hover dark:bg-accent dark:hover:bg-accent/90 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-md shadow-primary/20 dark:shadow-accent/20 flex-shrink-0"
                title="Send message"
              >
                <ArrowUp className="h-4.5 w-4.5 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating active Doubt Mode details */}
        {showDoubtBox && (
          <div className="w-full mt-2.5">
            <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-left">
              <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Q&A Doubt Mode Active</span>
              </p>
              <p className="text-[#555555] dark:text-[#666666] mt-1">
                The tutor will focus on answering your immediate queries or equations before resuming lessons.
              </p>
            </div>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default TutorChatPanel;
