import React from 'react';
import { FileText, Brain, ListChecks, Map } from 'lucide-react';

const QuickActionCards = ({ onActionClick }) => {
  const cards = [
    {
      title: 'Explain my lecture notes',
      icon: FileText,
      color: 'text-[#3B6BFF] dark:text-blue-400',
      bg: 'bg-[#F0F4FF] dark:bg-blue-950/20',
      border: 'border-[#D2E0FF] dark:border-blue-900/50',
      prompt: 'Can you help me analyze and explain my uploaded lecture notes?'
    },
    {
      title: 'Help me understand a concept',
      icon: Brain,
      color: 'text-[#9B3BFF] dark:text-purple-400',
      bg: 'bg-[#F9F0FF] dark:bg-purple-950/20',
      border: 'border-[#EAD2FF] dark:border-purple-900/50',
      prompt: 'Help me understand a difficult academic concept.'
    },
    {
      title: 'Test my multiplication tables',
      icon: ListChecks,
      color: 'text-[#10B981] dark:text-emerald-400',
      bg: 'bg-[#F0FFF9] dark:bg-emerald-950/20',
      border: 'border-[#D2FFE1] dark:border-emerald-900/50',
      prompt: 'I want to test my knowledge with some questions.'
    },
    {
      title: 'Create a study roadmap',
      icon: Map,
      color: 'text-[#F59E0B] dark:text-amber-400',
      bg: 'bg-[#FFF9F0] dark:bg-amber-950/20',
      border: 'border-[#FFEAD2] dark:border-amber-900/50',
      prompt: 'Create a personalized study roadmap for my subject.'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full px-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.title}
            onClick={() => onActionClick(card.prompt)}
            className={`p-4 md:p-5 border ${card.border} rounded-2xl ${card.bg} hover:opacity-90 dark:hover:brightness-110 text-left flex items-center space-x-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm`}
          >
            <div className={`p-2.5 rounded-xl bg-white dark:bg-slate-900 ${card.color} flex-shrink-0 shadow-sm border border-slate-100/50 dark:border-slate-800/50`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-white text-sm">
              {card.title}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActionCards;
