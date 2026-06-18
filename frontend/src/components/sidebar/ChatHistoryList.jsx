import React, { useEffect } from 'react';
import { MessageSquare, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useChatHistoryStore from '../../stores/useChatHistoryStore';
import useAuthStore from '../../stores/useAuthStore';
import { ChatHistorySkeleton } from '../ui/LoadingSkeleton';

const ChatHistoryList = ({ category }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { chatHistory, loading, fetchChatHistory } = useChatHistoryStore();

  useEffect(() => {
    if (user?._id) fetchChatHistory(user._id);
  }, [user?._id]);

  const items = chatHistory[category?.toLowerCase()] || [];

  if (loading) return <ChatHistorySkeleton />;

  if (items.length === 0) {
    return (
      <div className="text-center py-2 space-y-1">
        <p className="text-[11px] text-text-muted-light dark:text-text-muted-dark italic">No chats yet</p>
        <button
          onClick={() => navigate('/tutor/new')}
          className="inline-flex items-center space-x-1 text-[10px] font-semibold text-primary dark:text-accent hover:underline"
        >
          <PlusCircle className="h-3 w-3" />
          <span>Start a session</span>
        </button>
      </div>
    );
  }

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        // Navigate to the topic if available, otherwise fall back to the chat's own ID
        const destination = item.topicId
          ? `/tutor/${item.topicId}`
          : `/tutor/new`;

        return (
          <li key={item._id}>
            <button
              onClick={() => navigate(destination)}
              className="w-full flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-elevated-dark text-xs text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark transition-colors duration-200 text-left"
            >
              <div className="flex items-center space-x-2 truncate min-w-0">
                <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{item.title || 'Untitled Chat'}</span>
              </div>
              <span className="text-[9px] font-mono text-text-muted-light/70 dark:text-text-muted-dark/60 ml-1 flex-shrink-0">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default ChatHistoryList;
