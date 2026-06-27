import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain } from 'lucide-react';
import ThemeToggle from '../layout/ThemeToggle';

const Navbar = () => {
  const { scrollY } = useScroll();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('');

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setScrolled(latest > 60);
    });
  }, [scrollY]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['features', 'how-it-works', 'testimonials'];
      let current = '';
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled 
          ? 'bg-white/85 dark:bg-[#0B0F19]/85 backdrop-blur-md border-slate-200 dark:border-white/10 shadow-sm' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-2 group">
          <div className="bg-primary p-1.5 rounded-lg text-white group-hover:rotate-[360deg] transition-transform duration-500 ease-in-out">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            NEURALNEST
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#features" className={`transition-colors ${activeSection === 'features' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white'}`}>Features</a>
          <a href="#how-it-works" className={`transition-colors ${activeSection === 'how-it-works' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white'}`}>Progression</a>
          <a href="#testimonials" className={`transition-colors ${activeSection === 'testimonials' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-white'}`}>Testimonials</a>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link to="/login" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
            Log In
          </Link>
          <Link to="/register" className="text-sm font-semibold bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_-5px_rgba(59,107,255,0.5)]">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
