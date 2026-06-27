'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Progression', href: '#progression' },
  { label: 'Testimonials', href: '#testimonials' },
]

export function Navbar() {
  const { theme, toggleTheme, mounted } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3"
    >
      <nav
        className={`flex w-full max-w-6xl items-center justify-between rounded-xl border px-4 py-2.5 backdrop-blur-xl transition-colors sm:px-5 ${
          scrolled
            ? 'border-border bg-surface/80 shadow-lg shadow-black/5'
            : 'border-transparent bg-transparent'
        }`}
      >
        <a href="#" className="flex items-center gap-2.5" aria-label="NeuralNest home">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-mono text-base font-bold text-white">
            N
          </span>
          <span className="text-[15px] font-semibold tracking-tight">NeuralNest</span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
          </button>
          <a
            href="#"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Log In
          </a>
          <a
            href="#"
            className="rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Get Started
          </a>
        </div>
      </nav>
    </motion.header>
  )
}
