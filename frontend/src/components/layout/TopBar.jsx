import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import useAuthStore from '../../stores/useAuthStore';

const TopBar = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 md:px-6 flex items-center justify-between transition-colors duration-300 flex-shrink-0">

      {/* Left: hamburger (mobile) + Ask Doubt */}
      <div className="flex items-center space-x-3">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => navigate('/tutor/new')}
          className="flex items-center px-4 md:px-6 py-2 text-xs md:text-sm font-bold bg-cta hover:bg-cta-hover text-white rounded-full shadow-md transition-all duration-300"
        >
          Ask Doubt
        </button>
      </div>

      {/* Right: ThemeToggle + User */}
      <div className="flex items-center space-x-3 md:space-x-6">
        <ThemeToggle />

        {user && (
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            title="View Profile"
          >
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-md">
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
            {/* Name hidden on small screens to prevent overflow */}
            <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-text-primary-dark select-none truncate max-w-[120px]">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
