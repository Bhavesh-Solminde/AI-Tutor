import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, 
  LayoutDashboard, 
  GitFork, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Plus, 
  FileText
} from 'lucide-react';
import NavItem from '../sidebar/NavItem';
import CollapsibleSection from '../sidebar/CollapsibleSection';
import ChatHistoryList from '../sidebar/ChatHistoryList';

const Sidebar = () => {
  const navigate = useNavigate();

  const coreNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/roadmap', label: 'Roadmap', icon: GitFork },
    { to: '/tutor/demo', label: 'AI Tutor', icon: BookOpen },
    { to: '/exam', label: 'Exam Mode', icon: Clock },
    { to: '/active-quizzes', label: 'Active Quizzes', icon: GraduationCap },
  ];

  const handleNewSession = () => {
    alert('Creating new session... Where would you like to save this chat? (Exam, Roadmap, Other)');
    navigate('/tutor/new');
  };

  return (
    <aside className="w-[210px] flex-shrink-0 border-r border-border-light dark:border-border-dark bg-sidebar-light dark:bg-sidebar-dark flex flex-col justify-between h-screen sticky top-0 transition-colors duration-300">
      <div className="flex-grow flex flex-col overflow-y-auto min-h-0">
        
        {/* 🧠 NEURALNEST Logo Header */}
        <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center space-x-2.5">
          <div className="bg-primary/10 dark:bg-accent/10 p-1.5 rounded-lg text-primary dark:text-accent">
            <Brain className="h-5 w-5" />
          </div>
          <span 
            className="text-base font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 dark:from-accent dark:to-purple-400 bg-clip-text text-transparent cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            NEURALNEST
          </span>
        </div>

        {/* 🏠 Core Navigation Items */}
        <nav className="px-3 py-4 space-y-1 border-b border-border-light dark:border-border-dark">
          {coreNavItems.map((item) => (
            <NavItem 
              key={item.to} 
              to={item.to} 
              label={item.label} 
              icon={item.icon} 
            />
          ))}
        </nav>

        {/* 💬 Collapsible Chat History Section */}
        <div className="px-3 py-4 border-b border-border-light dark:border-border-dark">
          <CollapsibleSection title="Chat History" defaultOpen={true}>
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-[9px] font-mono tracking-wider uppercase text-text-muted-light dark:text-text-muted-dark block mb-1">📅 Exam</span>
                <ChatHistoryList category="exam" />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-wider uppercase text-text-muted-light dark:text-text-muted-dark block mb-1">🗺️ Roadmap</span>
                <ChatHistoryList category="roadmap" />
              </div>
              <div>
                <span className="text-[9px] font-mono tracking-wider uppercase text-text-muted-light dark:text-text-muted-dark block mb-1">💡 Other</span>
                <ChatHistoryList category="other" />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        {/* 📓 Collapsible Notes Section */}
        <div className="px-3 py-4 border-b border-border-light dark:border-border-dark">
          <CollapsibleSection title="Notes" defaultOpen={false}>
            <ul className="space-y-1 pt-2">
              <li>
                <div className="flex items-center space-x-2 p-1 rounded-lg text-xs text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark hover:bg-slate-100 dark:hover:bg-elevated-dark cursor-pointer transition">
                  <FileText className="h-3.5 w-3.5 text-text-muted-light dark:text-text-muted-dark" />
                  <span className="truncate">OS Lecture Notes.pdf</span>
                </div>
              </li>
              <li>
                <div className="flex items-center space-x-2 p-1 rounded-lg text-xs text-text-muted-light dark:text-text-muted-dark hover:text-text-base-light dark:hover:text-text-base-dark hover:bg-slate-100 dark:hover:bg-elevated-dark cursor-pointer transition">
                  <FileText className="h-3.5 w-3.5 text-text-muted-light dark:text-text-muted-dark" />
                  <span className="truncate">Memory Management.pdf</span>
                </div>
              </li>
            </ul>
          </CollapsibleSection>
        </div>

      </div>

      {/* 🚀 Footer (New Session CTA) */}
      <div className="p-3 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-sidebar-dark/40">
        <button
          onClick={handleNewSession}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-cta hover:bg-cta-hover text-white text-xs font-bold rounded-xl shadow-md transition-all duration-300"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
