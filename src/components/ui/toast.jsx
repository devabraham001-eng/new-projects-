import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: add }}>
      {children}
      <div className="fixed top-4 sm:top-5 right-0 sm:right-5 left-0 sm:left-auto z-[100] flex flex-col gap-2.5 px-4 sm:px-0 sm:max-w-sm w-full pointer-events-none">
        {toasts.map((t, i) => {
          const Icon = icons[t.type] || Info
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 pl-3.5 pr-3 py-3 rounded-xl border shadow-xl text-sm animate-slide-in',
                'bg-surface-card',
                t.type === 'success' && 'border-l-4 border-l-success border-border text-text-primary',
                t.type === 'error' && 'border-l-4 border-l-error border-border text-text-primary',
                t.type === 'info' && 'border-l-4 border-l-accent border-border text-text-primary',
              )}
              style={{ animationDelay: `${i * 0}ms` }}
            >
              <Icon
                size={18}
                className={cn(
                  'mt-0.5 shrink-0',
                  t.type === 'success' && 'text-success',
                  t.type === 'error' && 'text-error',
                  t.type === 'info' && 'text-accent',
                )}
              />
              <span className="flex-1 leading-relaxed">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="mt-0.5 shrink-0 text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
              >
                <X size={15} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
