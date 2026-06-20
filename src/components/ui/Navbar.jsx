import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Sparkles, Sun, Moon } from 'lucide-react'
import { Button } from './button'
import { useTheme } from '../../contexts/ThemeContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About', href: '/about' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="PayPulse" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-lg font-bold text-accent tracking-tight">PayPulse</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            l.href.startsWith('#') ? (
              <a key={l.label} href={l.href} className="text-sm text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">
                {l.label}
              </a>
            ) : (
              <Link key={l.label} to={l.href} className="text-sm text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">
                {l.label}
              </Link>
            )
          ))}
          <button
            onClick={toggle}
            className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors"
          >
            Login
          </button>
          <Link to="/login">
            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded" aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl">
          <div className="flex flex-col gap-1 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {links.map(l => (
              l.href.startsWith('#') ? (
                <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm text-muted hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all">
                  {l.label}
                </a>
              ) : (
                <Link key={l.label} to={l.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm text-muted hover:text-text-primary hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all">
                  {l.label}
                </Link>
              )
            ))}
            <div className="mt-2 flex flex-col gap-2">
              <button
                onClick={toggle}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted hover:text-text-primary hover:bg-surface-hover transition-all"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button onClick={() => { setOpen(false); navigate('/login') }} className="w-full px-4 py-3 rounded-lg text-sm text-muted hover:text-text-primary hover:bg-surface-hover transition-all">
                Login
              </button>
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="primary" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
