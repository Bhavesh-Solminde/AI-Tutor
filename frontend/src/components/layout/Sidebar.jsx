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
  X,
} from 'lucide-react';
import NavItem from '../sidebar/NavItem';
import CollapsibleSection from '../sidebar/CollapsibleSection';
import ChatHistoryList from '../sidebar/ChatHistoryList';
import NotesList from '../sidebar/NotesList';

const Sidebar = ({ onClose }) => {
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
        {/* Logo + mobile close button */}
        <div className="p-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-primary/10 dark:bg-accent/10 p-1.5 rounded-lg text-primary dark:text-accent">
              <Brain className="h-5 w-5" />
            </div>
            <span
              className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white cursor-pointer"
              onClick={() => { navigate('/dashboard'); onClose?.(); }}
            >
              NEURALNEST
            </span>
          </div>
          {/* Close button — only visible on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          )}
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
                { key: 'exam', label: 'Exam', Icon: BookMarked, color: 'text-blue-500/80 dark:text-blue-400/80' },
                { key: 'roadmap', label: 'Roadmap', Icon: Map, color: 'text-emerald-500/80 dark:text-emerald-400/80' },
                { key: 'other', label: 'Other', Icon: Lightbulb, color: 'text-amber-500/80 dark:text-amber-400/80' },
              ].map(({ key, label, Icon, color }) => (
                <div key={key}>
                  <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5 mt-3 px-1">
                    <Icon className={`h-3.5 w-3.5 ${color}`} />
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
