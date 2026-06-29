import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useScroll } from 'framer-motion';
import { Brain, Menu, X } from 'lucide-react';
import ThemeToggle from '../layout/ThemeToggle';

const Navbar = () => {
  const { scrollY } = useScroll();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => setScrolled(latest > 60));
  }, [scrollY]);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'how-it-works', 'testimonials'];
      let current = '';
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) current = section;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const navLinks = [
    { href: '#features', label: 'Features', id: 'features' },
    { href: '#how-it-works', label: 'Progression', id: 'how-it-works' },
    { href: '#testimonials', label: 'Testimonials', id: 'testimonials' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[9999] border-b transition-all duration-300 ${
          scrolled
            ? 'bg-[#F6F5F1]/85 dark:bg-[#0B0F19]/85 backdrop-blur-md border-[#EAE8E1] dark:border-white/10 shadow-sm'
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="bg-primary p-1.5 rounded-lg text-white group-hover:rotate-[360deg] transition-transform duration-500 ease-in-out">
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              NEURALNEST
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            {navLinks.map(({ href, label, id }) => (
              <a
                key={id}
                href={href}
                className={`transition-colors ${
                  activeSection === id
                    ? 'text-primary'
                    : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white'
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(59,107,255,0.5)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex md:hidden items-center space-x-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {mobileOpen && (
        <div className="fixed top-16 left-0 right-0 z-[9998] bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-white/10 shadow-lg md:hidden">
          <div className="px-4 py-4 flex flex-col space-y-1">
            {navLinks.map(({ href, label, id }) => (
              <a
                key={id}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === id
                    ? 'bg-primary/10 text-primary'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex flex-col space-y-2 mt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 rounded-lg text-sm font-semibold bg-primary text-white text-center transition-all hover:bg-primary-hover"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
