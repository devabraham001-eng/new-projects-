import { Link, useNavigate } from 'react-router-dom'
import { Code2, X, Mail } from 'lucide-react'

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="PayPulse" className="w-4 h-4 object-contain" />
            </div>
            <span className="font-bold text-accent tracking-tight">PayPulse</span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <a href="#features" className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">How It Works</a>
            <button onClick={() => navigate('/login')} className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">Dashboard</button>
            <Link to="/about" className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-4 text-muted">
            <a href="#" className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded" aria-label="GitHub"><Code2 size={18} /></a>
            <a href="#" className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded" aria-label="Twitter"><X size={18} /></a>
            <a href="#" className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <span>&copy; {new Date().getFullYear()} PayPulse. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
