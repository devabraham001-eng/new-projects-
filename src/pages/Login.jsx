import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, Sparkles, Loader } from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [mode, setMode] = useState('login')
  const [submitting, setSubmitting] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        toast('Signed in successfully')
        navigate('/dashboard')
      } else {
        await signUp(email, password, name)
        toast('Account created! Check your email to confirm.')
        setMode('login')
      }
    } catch (err) {
      toast(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="bg-surface-card border border-border rounded-2xl p-6 sm:p-10 shadow-lg shadow-black/5">
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center overflow-hidden">
              <img src="/favicon.png" alt="PayPulse" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-xl font-bold text-accent tracking-tight">PayPulse</span>
          </div>

          <h1 className="text-2xl font-semibold text-center mb-1 text-text-primary">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-muted text-center mb-8">
            {mode === 'login'
              ? 'Sign in to your dashboard'
              : 'Register to start banking with chat'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-muted uppercase tracking-wider" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted uppercase tracking-wider" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-surface text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-muted uppercase tracking-wider" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-surface text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button variant="primary" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <Loader size={16} className="animate-spin" />
              ) : mode === 'login' ? (
                <><Sparkles size={16} /> Sign In</>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors"
            >
              {mode === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Sign in'}
            </button>
          </div>


        </div>

        <p className="mt-6 text-center text-xs text-muted">
          By continuing, you agree to PayPulse's{' '}
          <a href="#" className="text-accent hover:underline">Terms</a> and{' '}
          <a href="#" className="text-accent hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
