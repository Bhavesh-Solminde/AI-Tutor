import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import useAuthStore from '../stores/useAuthStore';
import useTutorStore from '../stores/useTutorStore';
import useChatHistoryStore from '../stores/useChatHistoryStore';
import useSessionStore from '../stores/useSessionStore';
import api from '../lib/axiosClient';

import TutorChatPanel from '../components/tutor/TutorChatPanel';
import MaterialsModal from '../components/tutor/MaterialsModal';
import AgentLogPanel from '../components/tutor/AgentLogPanel';
import useAutoplayNature from '../hooks/useAutoplayNature';

const Tutor = () => {
  useAutoplayNature();
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession } = useSessionStore();
  const {
    messages, isStreaming, currentTopic, chatHistoryId, error, agentLogs,
    sendMessage, clearMessages, setCurrentTopic, setChatHistoryId, loadMessages, retryLastMessage,
  } = useTutorStore();
  const { findChatByTopicId, createChat, fetchChatHistory } = useChatHistoryStore();

  const [inputVal, setInputVal] = useState('');
  const [showDoubtBox, setShowDoubtBox] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [attachedMaterials, setAttachedMaterials] = useState([]);
  const [resolving, setResolving] = useState(false); // true while fetching topic name

  const isNewSession = !topicId || topicId === 'new';

  // Determine which section this chat belongs to:
  // ?section=exam → exam, ?section=roadmap → roadmap, default for open-mode → other
  const sectionFromQuery = searchParams.get('section');
  const chatSection = isNewSession
    ? (sectionFromQuery || 'other')
    : (sectionFromQuery || 'roadmap');

  // Extracted so it can be a useEffect dependency — switching between two open-mode
  // chats changes this value while topicId stays 'new', triggering a re-load.
  const chatIdFromUrl = searchParams.get('chatId');

  // On mount / when topicId or chatIdFromUrl changes: resolve topic name & load messages
  useEffect(() => {
    // React StrictMode mounts twice — use a cancelled flag so only one run proceeds
    let cancelled = false;

    // ── Guard: skip reset if this effect fired because onChatCreated just called navigate ──
    // When the backend auto-creates a chat and we navigate to ?chatId=xxx, React Router
    // re-fires this effect. But chatHistoryId in the store is ALREADY set to that ID
    // (set from the SSE event before navigate was called) and messages are in memory.
    // Clearing here would wipe the live conversation — so bail out early.
    if (isNewSession && chatIdFromUrl && chatIdFromUrl === chatHistoryId) {
      setCurrentTopic((t) => t || { _id: null, name: 'New Study Chat' });
      return () => { cancelled = true; };
    }

    // Reset messages & topic, but NOT chatHistoryId —
    // the Sidebar's "New Session" button may have pre-created a chat and set it already.
    clearMessages();
    setCurrentTopic(null);

    if (isNewSession) {
      // Open-mode: user can type anything.
      setCurrentTopic({ _id: null, name: 'New Study Chat' });

      // Restore an existing open-mode chat if ?chatId= is in the URL.
      // chatIdFromUrl is declared outside the effect so it is a stable dependency.
      if (chatIdFromUrl) {
        // Sidebar clicked a specific chat — load it
        setChatHistoryId(chatIdFromUrl);
        loadMessages(chatIdFromUrl);
      } else {
        // New Session button (no chatId) — always start fresh, clear any
        // stale chatHistoryId left over from a previous open-mode session
        setChatHistoryId(null);
      }
      return () => { cancelled = true; };
    }

    // Topic-mode: clear any open-mode chat ID so we resolve/create the right one
    setChatHistoryId(null);

    const init = async () => {
      setResolving(true);
      try {
        // 0. If a specific chatId came from the sidebar, use it directly
        if (chatIdFromUrl) {
          const { data: topicData } = await api.get(`/api/topics/${topicId}`, { _silent: true }).catch(() => ({ data: null }));
          if (cancelled) return;
          setCurrentTopic({ _id: topicId, name: topicData?.name || topicData?.topic?.name || topicId });
          setChatHistoryId(chatIdFromUrl);
          await loadMessages(chatIdFromUrl);
          return;
        }

        // 1. Fetch the real topic from the API to get its name
        const { data: topicData } = await api.get(`/api/topics/${topicId}`, { _silent: true }).catch(() => ({ data: null }));
        if (cancelled) return;
        const resolvedName = topicData?.name || topicData?.topic?.name || topicId;
        setCurrentTopic({ _id: topicId, name: resolvedName });

        // 2. Check if an existing chat exists for this topic — reuse it
        const existingChat = await findChatByTopicId(topicId);
        if (cancelled) return;

        if (existingChat) {
          setChatHistoryId(existingChat._id);
          await loadMessages(existingChat._id);   // ← restore messages
        } else {
          // Create a new chat entry with the real topic name as title
          // The backend uses findOrCreate so concurrent calls won't produce duplicates
          const chat = await createChat({
            sessionId: currentSession?._id,
            topicId,
            section: chatSection,
            title: resolvedName,
          });
          if (cancelled) return;
          if (chat) {
            setChatHistoryId(chat._id);
            // Refresh sidebar so it shows this new chat immediately
            if (user?._id) fetchChatHistory(user._id);
          }
        }
      } catch (err) {
        if (cancelled) return;
        // Fallback: show topicId as name, let user continue
        setCurrentTopic({ _id: topicId, name: 'Study Session' });
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    init();

    // Cleanup: mark as cancelled so any in-flight async work is discarded
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId, chatIdFromUrl]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isStreaming) return;
    if (!textToSend) setInputVal('');

    // For open-mode, let the backend auto-create the chat on the first message.
    // It sends back chatHistoryId over SSE → onChatCreated picks it up below.
    // Do NOT pre-create a chat here — that causes two duplicate documents per message.
    const activeChatId = chatHistoryId;

    await sendMessage({
      topicId: isNewSession ? null : topicId,
      message: text,
      type: (() => {
        if (messages.length === 0) return 'teach';
        // Classify as doubt only for genuine follow-up questions:
        //   - Contains a question mark, OR
        //   - Starts with why/how/what (not "explain X" teaching commands)
        const startsWithQuestion = /^(why|how|what|when|where|who)\b/i.test(text.trim());
        const hasQuestionMark = text.includes('?');
        return (startsWithQuestion || hasQuestionMark) ? 'doubt' : 'teach';
      })(),
      chatHistoryId: activeChatId,
      materialSessionIds: attachedMaterials.map((m) => m._id),
      onChatCreated: (newId) => {
        // Backend auto-created a chat — update URL so refresh re-loads this exact chat
        navigate(`/tutor/new?chatId=${newId}&section=${chatSection}`, { replace: true });
        // Refresh sidebar so the new chat appears
        if (user?._id) fetchChatHistory(user._id);
      },
    });
  };

  const handleChipClick = (chipType) => {
    const texts = {
      understood: "Understood! Let's proceed.",
      help: "I need more help — can you explain it more simply?",
      deeper: "Let's go deeper into this concept.",
    };
    handleSend(texts[chipType] || "Let's continue.");
  };

  const topicName = currentTopic?.name
    ? currentTopic.name.charAt(0).toUpperCase() + currentTopic.name.slice(1)
    : resolving ? '…' : isNewSession ? 'New Study Chat' : 'Study Session';

  // What message to send when user clicks "Start Teaching"
  const startTeachingText = isNewSession
    ? "Let's start learning something new!"
    : `Start teaching me about ${topicName} from the beginning.`;

  return (
    <MainLayout>
      <div className="font-inter absolute inset-0 pt-4 px-4 pb-2 md:pt-8 md:px-8 md:pb-3 flex flex-col justify-between overflow-hidden text-left bg-background-light dark:bg-background-dark">
        {messages.length > 0 && (
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-3 mb-3 md:pb-4 md:mb-4">
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
              <button
                onClick={() => navigate('/roadmap')}
                className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-white/80 dark:hover:bg-slate-800 transition flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <span className="text-[10px] font-sans tracking-wider uppercase text-primary dark:text-accent">Active Session</span>
                <h2 className="text-base md:text-lg font-bold text-[#333333] dark:text-white truncate max-w-[140px] sm:max-w-xs md:max-w-none">{topicName}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {error && (
                <button
                  onClick={retryLastMessage}
                  className="flex items-center space-x-1.5 px-2 md:px-3 py-1.5 text-xs font-bold text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Retry</span>
                </button>
              )}
              {!isNewSession && (
                <button
                  onClick={() => navigate(`/quiz/${topicId}`)}
                  className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover dark:bg-accent dark:hover:bg-accent/90 rounded-xl shadow-md transition-all duration-300"
                >
                  <span className="hidden sm:inline">Proceed to Quiz</span>
                  <span className="sm:hidden">Quiz</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TutorChatPanel — always rendered so input box and quick-actions are always visible */}
        <div className="flex-1 overflow-hidden min-h-0 w-full">
          <TutorChatPanel
            messages={messages}
            isTyping={isStreaming}
            inputVal={inputVal}
            setInputVal={setInputVal}
            onSend={handleSend}
            onChipClick={handleChipClick}
            showDoubtBox={showDoubtBox}
            setShowDoubtBox={setShowDoubtBox}
            explanationLevel={user?.explanationLevel || 'beginner'}
            onAttachClick={() => setShowMaterialsModal(true)}
            materialsCount={attachedMaterials.length}
            topicName={topicName}
            isNewSession={isNewSession}
          />
        </div>

        {/* Agent Activity Log — collapsible terminal panel */}
        <AgentLogPanel logs={agentLogs} isStreaming={isStreaming} />

        {/* Start Teaching button — only for topic-mode when chat is empty */}
        {!isNewSession && messages.length === 0 && !resolving && (
          <div className="flex justify-center pb-4 flex-shrink-0">
            <button
              onClick={() => handleSend(startTeachingText)}
              disabled={isStreaming}
              className="px-6 py-3 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Start Teaching</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <MaterialsModal
          isOpen={showMaterialsModal}
          onClose={() => setShowMaterialsModal(false)}
          onConfirm={(selected) => setAttachedMaterials(selected)}
        />
      </div>
    </MainLayout>
  );
};

export default Tutor;
