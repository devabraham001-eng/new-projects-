import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Wallet, Check, User } from 'lucide-react'
import { Badge } from './badge'
import { Card } from './card'

const REF = `PP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

const MESSAGES = [
  {
    type: 'bot',
    delay: 2000,
    content: (
      <p className="text-text-primary">
        Welcome to <strong>PayPulse</strong>! Your conversational banking assistant.
      </p>
    ),
  },
  { type: 'typing', duration: 1800 },
  {
    type: 'user',
    delay: 1500,
    content: <p className="text-text-primary">transfer 2000 to 7044879145 via opay</p>,
  },
  { type: 'typing', duration: 1600 },
  {
    type: 'bot',
    delay: 3200,
    content: (
      <div>
        <Badge variant="success" size="sm" dot className="mb-2">Account Verified</Badge>
        <p className="mb-3 text-text-primary">Recipient: <strong>Ola Ogunleye</strong></p>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 rounded-t-xl" />
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-1">
                <Wallet size={10} /> Transfer Invoice
              </span>
              <span className="text-xs font-mono text-accent">{REF}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border">
              <span className="text-sm text-muted">Amount</span>
              <span className="text-2xl font-bold text-accent tracking-tight">₦2,000.00</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border text-sm">
              <span className="text-muted">Recipient</span>
              <span className="text-text-primary">Ola Ogunleye</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-border text-sm">
              <span className="text-muted">Account</span>
              <code className="text-xs font-mono text-accent">7044879145</code>
            </div>
            <div className="flex justify-between items-center py-2.5 text-sm">
              <span className="text-muted">Bank</span>
              <span className="text-text-primary">OPay</span>
            </div>
          </div>
        </Card>
        <p className="text-xs text-muted mt-2 font-mono">Reply with CONFIRM to proceed or CANCEL to abort.</p>
      </div>
    ),
  },
  { type: 'typing', duration: 1200 },
  {
    type: 'user',
    delay: 1000,
    content: <p className="text-text-primary">CONFIRM</p>,
  },
  { type: 'typing', duration: 2000 },
  {
    type: 'bot',
    delay: 3500,
    content: (
      <div>
        <p className="text-success font-semibold text-sm flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
            <Check size={12} className="text-success" />
          </span>
          Transfer Successful!
        </p>
        <p className="text-sm mt-1 text-text-primary">₦2,000.00 sent to <strong>Ola Ogunleye</strong></p>
        <div className="mt-2 px-3 py-2 bg-surface-secondary rounded-lg border border-border">
          <code className="text-xs font-mono text-accent">{REF}</code>
        </div>
      </div>
    ),
  },
]

export default function ChatDemo() {
  const [step, setStep] = useState(-1)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (step === -1) {
      const t = setTimeout(() => setStep(0), 800)
      return () => clearTimeout(t)
    }
    if (step >= MESSAGES.length) {
      const t = setTimeout(() => setStep(0), 5000)
      return () => clearTimeout(t)
    }

    const msg = MESSAGES[step]
    const delay = msg.type === 'typing' ? (msg.duration || 1200) : (msg.delay || 1200)

    const t = setTimeout(() => setStep(s => s + 1), delay)
    return () => clearTimeout(t)
  }, [step])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [step])

  const shownMessages = MESSAGES.slice(0, step + 1).filter(m => m.type !== 'typing')
  const isTyping = step >= 0 && step < MESSAGES.length && MESSAGES[step]?.type === 'typing'

  return (
    <div className="w-full max-w-[calc(100vw-2.5rem)] sm:max-w-lg mx-auto">
      <div className="bg-surface-card border border-border rounded-2xl shadow-xl shadow-black/5 overflow-hidden">
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border bg-surface-elevated">
          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center">
            <Zap size={14} className="text-accent" />
          </div>
          <span className="text-sm font-semibold text-text-primary">PayPulse</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-muted">Online</span>
          </div>
        </div>

        <div ref={scrollRef} className="px-4 py-4 space-y-3 min-h-[180px] sm:min-h-[280px] max-h-[300px] sm:max-h-[420px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {shownMessages.map((msg, i) => {
              const isUser = msg.type === 'user'
              return (
                <motion.div
                  key={`m-${i}`}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`flex gap-2.5 max-w-[90%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                      isUser ? 'bg-accent text-text-inverted' : 'bg-surface-hover border border-border'
                    }`}
                    aria-hidden="true"
                  >
                    {isUser ? <User size={13} /> : <Zap size={13} className="text-accent" />}
                  </div>
                  <div
                    className={`px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-accent/5 border border-accent/10 rounded-[14px_4px_14px_14px]'
                        : 'bg-surface-secondary border border-border rounded-[4px_14px_14px_14px]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <AnimatePresence>
            {isTyping && (
              <motion.div
                key="typing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex gap-2.5 max-w-[90%]"
              >
                <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center flex-shrink-0 mt-1" aria-hidden="true">
                  <Zap size={13} className="text-accent" />
                </div>
                <div className="bg-surface-secondary border border-border rounded-[4px_14px_14px_14px] px-5 py-3.5 flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted/40 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1.2s' }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  )
}
