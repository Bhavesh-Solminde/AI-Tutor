import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import useAuthStore from '../../stores/useAuthStore';

const TopBar = ({ onMenuToggle }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="h-14 md:h-16 border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 md:px-6 flex items-center justify-between transition-colors duration-300 flex-shrink-0">

      {/* Left: hamburger (mobile only) + Ask Doubt */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
          className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          onClick={() => navigate('/tutor/new')}
          className="flex items-center px-4 md:px-6 py-1.5 md:py-2 text-sm font-bold bg-cta hover:bg-cta-hover text-white rounded-full shadow-md transition-all duration-300"
        >
          Ask Doubt
        </button>
      </div>

      {/* Right: theme toggle + user */}
      <div className="flex items-center space-x-3 md:space-x-6">
        <ThemeToggle />

        {user && (
          <div
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-2 md:space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
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
            {/* Hide name on very small screens */}
            <span className="hidden sm:block text-sm font-semibold text-slate-800 dark:text-text-primary-dark select-none">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

export default TopBar;
