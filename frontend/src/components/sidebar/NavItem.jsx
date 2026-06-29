import React from 'react';
import { NavLink } from 'react-router-dom';

const NavItem = ({ to, label, icon: Icon }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-nav-active-light dark:bg-nav-active-dark text-primary dark:text-text-base-dark shadow-sm border border-primary/10 dark:border-border-dark'
            : 'text-text-muted-light dark:text-text-muted-dark hover:bg-white/80 dark:hover:bg-surface-dark/50 hover:text-text-base-light dark:hover:text-text-base-dark'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </NavLink>
  );
};

export default NavItem;
