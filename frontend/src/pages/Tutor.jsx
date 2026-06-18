import React, { useState, useEffect, useRef } from 'react';
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
import QuickActionCards from '../components/tutor/QuickActionCards';

const Tutor = () => {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession } = useSessionStore();
  const {
    messages, isStreaming, currentTopic, chatHistoryId, error,
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

  // On mount: resolve topic name from API, reuse existing chat if possible
  useEffect(() => {
    // React StrictMode mounts twice — use a cancelled flag so only one run proceeds
    let cancelled = false;

    // Reset messages & topic, but NOT chatHistoryId —
    // the Sidebar's "New Session" button may have pre-created a chat and set it already.
    clearMessages();
    setCurrentTopic(null);

    if (isNewSession) {
      // Open-mode: user can type anything.
      // Don't reset chatHistoryId here — Sidebar may have already set one.
      setCurrentTopic({ _id: null, name: 'New Study Chat' });
      return () => { cancelled = true; };
    }

    // Topic-mode: clear any open-mode chat ID so we resolve/create the right one
    setChatHistoryId(null);

    const init = async () => {
      setResolving(true);
      try {
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
  }, [topicId]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isStreaming) return;
    if (!textToSend) setInputVal('');

    // Lazily create a chat entry for open-mode on the very first message,
    // so conversations are always saved and appear in the sidebar.
    let activeChatId = chatHistoryId;
    if (isNewSession && !activeChatId) {
      const newChat = await createChat({
        sessionId: currentSession?._id,
        topicId: null,
        section: chatSection,
        title: text.length > 40 ? text.slice(0, 40) + '…' : text,
      });
      if (newChat?._id) {
        setChatHistoryId(newChat._id);
        activeChatId = newChat._id;
        // Refresh sidebar immediately so this new chat appears
        if (user?._id) fetchChatHistory(user._id);
      }
    }

    await sendMessage({
      topicId: isNewSession ? null : topicId,
      message: text,
      type: text.toLowerCase().includes('why') || text.toLowerCase().includes('how') || text.toLowerCase().includes('explain') ? 'doubt' : 'teach',
      chatHistoryId: activeChatId,
      materialSessionIds: attachedMaterials.map((m) => m._id),
      onChatCreated: (newId) => {
        // Backend auto-created a chat — refresh sidebar
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
      <div className="absolute inset-0 pt-6 px-6 pb-2 md:pt-8 md:px-8 md:pb-3 flex flex-col justify-between overflow-hidden text-left bg-background-light dark:bg-background-dark">
        {messages.length > 0 && (
          <div className="flex items-center justify-between border-b border-border-light dark:border-border-dark pb-4 mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/roadmap')}
                className="p-1.5 rounded-lg border border-border-light dark:border-border-dark hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-primary dark:text-accent">Active Session</span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{topicName}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {error && (
                <button
                  onClick={retryLastMessage}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-xl hover:bg-amber-500/10 transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Retry</span>
                </button>
              )}
              {/* Hide quiz button for open-mode — no topicId to quiz on */}
              {!isNewSession && (
                <button
                  onClick={() => navigate(`/quiz/${topicId}`)}
                  className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all duration-300"
                >
                  <span>Proceed to Quiz</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Empty state: show Quick Action Cards when no messages */}
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isNewSession ? 'What do you want to learn?' : `Ready to study ${topicName}?`}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isNewSession ? 'Start a conversation or pick a quick action.' : `Ask a question or click "Start Teaching" to begin.`}
              </p>
            </div>
            <QuickActionCards onActionClick={handleSend} />
            <button
              onClick={() => handleSend(startTeachingText)}
              disabled={resolving || isStreaming}
              className="px-6 py-3 bg-primary dark:bg-accent hover:bg-primary-hover dark:hover:bg-accent/90 text-white font-bold rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resolving ? 'Loading…' : 'Start Teaching →'}
            </button>
          </div>
        )}

        <div className={`${messages.length === 0 ? 'hidden' : 'flex-1 overflow-hidden min-h-0 w-full'}`}>
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
          />
        </div>

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
