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
  BookMarked,
  Map,
  Lightbulb,
} from 'lucide-react';
import NavItem from '../sidebar/NavItem';
import CollapsibleSection from '../sidebar/CollapsibleSection';
import ChatHistoryList from '../sidebar/ChatHistoryList';
import NotesList from '../sidebar/NotesList';

const Sidebar = () => {
  const navigate = useNavigate();

  const coreNavItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/roadmap', label: 'Roadmap', icon: GitFork },
    { to: '/tutor/new', label: 'AI Tutor', icon: BookOpen },
    { to: '/exam', label: 'Exam Mode', icon: Clock },
    { to: '/active-quizzes', label: 'Active Quizzes', icon: GraduationCap },
  ];

  return (
    <aside className="w-[210px] flex-shrink-0 border-r border-border-light dark:border-border-dark bg-sidebar-light dark:bg-sidebar-dark flex flex-col justify-between h-screen sticky top-0 transition-colors duration-300">
      <div className="flex-grow flex flex-col overflow-y-auto min-h-0">
        {/* Logo */}
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

        {/* Core Nav */}
        <nav className="px-3 py-4 space-y-1 border-b border-border-light dark:border-border-dark">
          {coreNavItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} icon={item.icon} />
          ))}
        </nav>

        {/* Chat History */}
        <div className="px-3 py-4 border-b border-border-light dark:border-border-dark">
          <CollapsibleSection title="Chat History" defaultOpen={true}>
            <div className="space-y-3 pt-2">
              {[
                { key: 'exam', label: 'Exam', Icon: BookMarked },
                { key: 'roadmap', label: 'Roadmap', Icon: Map },
                { key: 'other', label: 'Other', Icon: Lightbulb },
              ].map(({ key, label, Icon }) => (
                <div key={key}>
                  <span className="text-[9px] font-sans tracking-wider uppercase text-text-muted-light dark:text-text-muted-dark flex items-center gap-1 mb-1">
                    <Icon className="h-3 w-3" />
                    {label}
                  </span>
                  <ChatHistoryList category={key} />
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </div>

        {/* Notes */}
        <div className="px-3 py-4 border-b border-border-light dark:border-border-dark">
          <CollapsibleSection title="Notes" defaultOpen={false}>
            <NotesList />
          </CollapsibleSection>
        </div>
      </div>

      {/* Footer: New Session — always creates under Other, no section picker */}
      <div className="p-3 border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-sidebar-dark/40">
        <button
          onClick={() => navigate('/tutor/new?section=other')}
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
