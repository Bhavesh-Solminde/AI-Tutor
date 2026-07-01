import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

import { useLocation } from 'react-router-dom';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  if (['/', '/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      id="theme-toggle-btn"
      className="text-[#555555] dark:text-text-muted-dark hover:text-[#333333] dark:hover:text-text-primary-dark transition-colors duration-200 focus:outline-none flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
