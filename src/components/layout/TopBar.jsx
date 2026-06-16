import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

const TopBar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-6 flex items-center justify-between transition-colors duration-300">
      {/* Left controls: Search Input & Ask Doubt Button next to each other */}
      <div className="flex items-center space-x-4">
        <div className="relative w-80 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-accent transition-colors duration-200" />
          <input
            type="text"
            placeholder="Search topics, notes, sessions..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border-light dark:border-border-dark bg-slate-50 dark:bg-elevated-dark text-slate-900 dark:text-text-primary-dark placeholder-slate-400 dark:placeholder-text-muted-dark focus:outline-none focus:border-primary dark:focus:border-primary focus:bg-white dark:focus:bg-elevated-dark transition-all duration-300"
          />
        </div>

        <button 
          onClick={() => navigate('/tutor/new')}
          className="flex items-center px-6 py-2 text-sm font-bold bg-cta hover:bg-cta-hover text-white rounded-full shadow-md transition-all duration-300"
        >
          Ask Doubt
        </button>
      </div>

      {/* Right controls: Bell, ThemeToggle, User Profile (Name only) */}
      <div className="flex items-center space-x-6">
        {/* 🔔 Borderless Notification Bell */}
        <button className="text-slate-500 dark:text-text-muted-dark hover:text-slate-800 dark:hover:text-text-primary-dark transition-colors duration-200 focus:outline-none relative flex items-center justify-center">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        </button>

        {/* 🌙 Borderless Theme Toggle */}
        <ThemeToggle />

        {/* User Profile (Avatar circle & Name only) */}
        {user && (
          <div 
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
            title="View Profile"
          >
            <div className="h-9 w-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
              <img
                src="/aryan_avatar.png"
                alt={user.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3B6BFF&color=fff`;
                }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-text-primary-dark select-none">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
