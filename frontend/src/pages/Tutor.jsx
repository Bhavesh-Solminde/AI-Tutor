import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';

// Components
import TutorChatPanel from '../components/tutor/TutorChatPanel';
import MaterialsModal from '../components/tutor/MaterialsModal';

const Tutor = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isNewSession = topicId === 'new';

  const [messages, setMessages] = useState([]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDoubtBox, setShowDoubtBox] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [attachedMaterials, setAttachedMaterials] = useState([]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: text }]);
    if (!textToSend) setInputVal('');

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      const isDoubt = text.toLowerCase().includes('why') || text.toLowerCase().includes('how') || text.toLowerCase().includes('explain');
      let responseText = '';
      
      if (isDoubt) {
        responseText = `Excellent doubt! When we analyze FCFS waiting times, we calculate: \n\n*Waiting Time = Start Time - Arrival Time*. \n\nIf process A takes 30ms, and process B arrives at 1ms but takes only 2ms to complete, B has to wait 29ms! That is the Convoy Effect in action. Does this make sense?`;
      } else {
        responseText = `Awesome. Since you clicked **Understood**, let's move on to the next algorithm: **Shortest Job First (SJF)**.\n\nHere, the CPU scheduler selects the process with the shortest execution time next. While this is mathematically optimal for minimizing average waiting times, the challenge is *predicting* how long a process will run before execution starts.`;
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          type: isDoubt ? 'doubt_answer' : 'teach',
          showChips: true
        }
      ]);
    }, 1200);
  };

  const handleChipClick = (chipType) => {
    setMessages(prev => prev.map(m => ({ ...m, showChips: false })));
    
    let choiceText = '';
    if (chipType === 'understood') choiceText = "Understood! Let's proceed.";
    if (chipType === 'help') choiceText = "I need more help / a simpler explanation.";
    if (chipType === 'deeper') choiceText = "Let's go deeper into this concept.";

    handleSend(choiceText);
  };

  const handleConfirmMaterials = (selected) => {
    setAttachedMaterials(selected);
  };

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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isNewSession ? 'New Study Chat' : topicId === 'demo' ? 'CPU Scheduling' : 'Virtual Memory & Paging'}
                </h2>
              </div>
            </div>
            
            <button
              onClick={() => navigate(`/quiz/${isNewSession ? 'demo' : topicId}`)}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all duration-300"
            >
              <span>Proceed to Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-hidden min-h-0 w-full">
          <TutorChatPanel
            messages={messages}
            isTyping={isTyping}
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

        {/* Materials selector modal */}
        <MaterialsModal
          isOpen={showMaterialsModal}
          onClose={() => setShowMaterialsModal(false)}
          onConfirm={handleConfirmMaterials}
        />
      </div>
    </MainLayout>
  );
};

export default Tutor;
