import { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '../../lib/utils'
import { X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const add = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: add }}>
      {children}
      <div className="fixed bottom-0 sm:bottom-5 left-0 sm:left-auto right-0 sm:right-5 z-[100] flex flex-col gap-2 px-4 sm:px-0 sm:max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-fade-in-up text-sm',
              t.type === 'success' && 'bg-success/10 border-success/20 text-success',
              t.type === 'error' && 'bg-error/10 border-error/20 text-error',
              t.type === 'info' && 'bg-accent/5 border-accent/20 text-accent',
            )}
          >
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
