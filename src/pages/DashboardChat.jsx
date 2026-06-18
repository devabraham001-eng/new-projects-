import { useState, useRef, useEffect } from 'react'
import {
  Zap, Send, Check, Lock, Copy, X, Wallet, User,
  Phone, Eye, EyeOff, Sparkles, Loader
} from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Card } from '../components/ui/card'
import { useToast } from '../components/ui/toast'
import { api } from '../services/api'

const INITIAL_BOT_MSG = {
  type: 'bot',
  content: (
    <div>
      <p className="text-text-primary">Welcome to <strong>PayPulse</strong>! Your conversational banking assistant.</p>
      <p className="text-muted text-xs mt-2 font-mono">Try saying something like:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {['transfer 2000 to 7044879145 via opay', 'send 5000 to 2215381184', 'pay 15000 to favor'].map((s, i) => (
          <button
            key={i}
            onClick={() => window.dispatchEvent(new CustomEvent('fill-message', { detail: s }))}
            className="px-3 py-1.5 rounded-lg bg-surface-secondary border border-border text-xs font-mono text-accent hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  ),
}

export default function DashboardChat() {
  const [messages, setMessages] = useState([INITIAL_BOT_MSG])
  const [input, setInput] = useState('')
  const [showWebview, setShowWebview] = useState(false)
  const [webviewTx, setWebviewTx] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successData, setSuccessData] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [phone, setPhone] = useState('')
  const [confirming, setConfirming] = useState(false)
  const messagesEndRef = useRef(null)
  const { toast } = useToast()

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const handler = (e) => setInput(e.detail)
    window.addEventListener('fill-message', handler)
    return () => window.removeEventListener('fill-message', handler)
  }, [])

  const addMsg = (msg) => setMessages(prev => [...prev, msg])

  const handleSend = async () => {
    const text = input.trim()
    if (!text) return

    addMsg({ type: 'user', content: <p className="text-text-primary">{text}</p> })
    setInput('')
    setIsTyping(true)

    try {
      const data = await api.post('/chat/parse', { text })
      setIsTyping(false)

      if (data.action === 'balance') {
        addMsg({
          type: 'bot',
          content: (
            <div>
              <p className="text-text-primary">Your balance is <strong className="text-accent">\u20A6{data.balance.toLocaleString()}</strong></p>
            </div>
          ),
        })
        return
      }

      if (data.action === 'history') {
        const txs = data.transactions || []
        if (txs.length === 0) {
          addMsg({ type: 'bot', content: <p className="text-text-primary">No transactions yet.</p> })
          return
        }
        addMsg({
          type: 'bot',
          content: (
            <div>
              <p className="text-text-primary font-semibold mb-2">Recent Transactions</p>
              {txs.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex justify-between py-1.5 border-b border-border/50 text-sm">
                  <span className="text-muted truncate mr-2">{tx.recipient}</span>
                  <span className={`font-medium flex-shrink-0 ${tx.type === 'credit' ? 'text-success' : ''}`}>
                    {tx.type === 'credit' ? '+' : '-'}\u20A6{Number(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ),
        })
        return
      }

      const inv = data.invoice
      const tx = data.transaction

      addMsg({
        type: 'bot',
        content: (
          <div>
            <Badge variant="success" size="sm" dot className="mb-2">Account Verified</Badge>
            <p className="mb-3 text-text-primary">Recipient: <strong>{inv.recipient}</strong></p>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 rounded-t-xl" />
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider flex items-center gap-1">
                    <Wallet size={10} /> Transfer Invoice
                  </span>
                  <span className="text-xs font-mono text-accent">{inv.reference}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border">
                  <span className="text-sm text-muted">Amount</span>
                  <span className="text-2xl font-bold text-accent tracking-tight">\u20A6{Number(inv.amount).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border text-sm">
                  <span className="text-muted">Recipient</span>
                  <span className="text-text-primary">{inv.recipient}</span>
                </div>
                <div className="flex justify-between items-center py-2.5 border-b border-border text-sm">
                  <span className="text-muted">Account</span>
                  <code className="text-xs font-mono text-accent">{inv.account}</code>
                </div>
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-muted">Bank</span>
                  <span className="text-text-primary">{inv.bank || 'OPay'}</span>
                </div>
                <button
                  onClick={() => openWebview({ txId: tx.id, ref: inv.reference, amount: `\u20A6${Number(inv.amount).toLocaleString()}.00`, recipient: inv.recipient })}
                  className="mt-3 w-full py-2.5 rounded-lg bg-accent text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-colors"
                >
                  <Lock size={14} /> Pay with OPay
                </button>
              </div>
            </Card>
            <p className="text-[10px] text-muted mt-2 font-mono">Tap to authorize in secure webview</p>
          </div>
        ),
      })
    } catch (err) {
      setIsTyping(false)
      addMsg({
        type: 'bot',
        content: <p className="text-error">Sorry, I couldn't process that. Try "transfer 2000 to 7044879145"</p>,
      })
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast('Reference copied to clipboard')
  }

  const openWebview = (tx) => {
    setWebviewTx(tx)
    setShowWebview(true)
    setPhone('')
    setOtp('')
  }

  const confirmPayment = async () => {
    if (!webviewTx?.ref) return
    setConfirming(true)
    try {
      await api.post('/chat/confirm', { reference: webviewTx.ref, otp })

      setShowWebview(false)
      setSuccessData({
        amount: webviewTx.amount,
        recipient: webviewTx.recipient,
        ref: webviewTx.ref,
        txId: webviewTx.txId,
      })
      setShowSuccess(true)

      addMsg({
        type: 'bot',
        content: (
          <div>
            <p className="text-success font-semibold text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                <Check size={12} className="text-success" />
              </span>
              Transfer Successful!
            </p>
            <p className="text-sm mt-1 text-text-primary">{webviewTx.amount} sent to <strong>{webviewTx.recipient}</strong></p>
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-surface-secondary rounded-lg border border-border">
              <code className="text-xs font-mono text-accent flex-1">{webviewTx.ref}</code>
              <button
                onClick={() => handleCopy(webviewTx.ref)}
                className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors"
                aria-label="Copy reference"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        ),
      })
    } catch (err) {
      toast(err.message || 'Payment failed')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 bg-surface">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 max-w-[88%] sm:max-w-[72%] animate-fade-in ${
              msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              msg.type === 'bot'
                ? 'bg-surface-hover border border-border'
                : 'bg-accent text-white'
            }`} aria-hidden="true">
              {msg.type === 'bot' ? <Zap size={13} className="text-accent" /> : <User size={13} />}
            </div>
            <div className={`px-4 py-3 text-sm leading-relaxed ${
              msg.type === 'bot'
                ? 'bg-surface-secondary border border-border rounded-[4px_14px_14px_14px]'
                : 'bg-accent/5 border border-accent/10 rounded-[14px_4px_14px_14px]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 max-w-[88%] sm:max-w-[72%] animate-fade-in" aria-label="Bot is typing">
            <div className="w-7 h-7 rounded-full bg-surface-hover border border-border flex items-center justify-center flex-shrink-0 mt-1" aria-hidden="true">
              <Zap size={13} className="text-accent" />
            </div>
            <div className="bg-surface-secondary border border-border rounded-[4px_14px_14px_14px] px-5 py-3.5 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-2 h-2 rounded-full bg-muted/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1.2s' }} aria-hidden="true" />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 sm:px-6 py-4 border-t border-border bg-surface flex-shrink-0">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder='Type a message... e.g. "transfer 2000 to 7044879145 via opay"'
            className="flex-1 px-5 py-3 rounded-full border border-border bg-surface-secondary text-text-primary text-sm placeholder:text-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            aria-label="Chat input"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {showWebview && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Secure payment confirmation">
          <div className="w-full max-w-sm bg-surface-card border border-border rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface-elevated">
              <div className="flex items-center gap-2.5 text-sm">
                <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center" aria-hidden="true">
                  <Lock size={10} className="text-success" />
                </span>
                <span className="text-xs font-mono text-muted">Secure OPay Gateway</span>
              </div>
              <button onClick={() => setShowWebview(false)} className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6 pb-5 border-b border-border">
                <div className="w-12 h-12 rounded-full bg-accent/5 border-2 border-accent/20 flex items-center justify-center mx-auto mb-3" aria-hidden="true">
                  <Wallet size={20} className="text-accent" />
                </div>
                <div className="text-3xl font-bold tracking-tight text-text-primary">{webviewTx?.amount}</div>
                <div className="text-xs font-mono text-muted mt-1">{webviewTx?.ref}</div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider" htmlFor="otp-phone">OPay Wallet Number</label>
                  <input
                    id="otp-phone"
                    type="tel"
                    placeholder="+234..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-muted uppercase tracking-wider" htmlFor="otp-code">Enter 6-Digit OTP</label>
                  <div className="relative">
                    <input
                      id="otp-code"
                      type={showOtp ? 'text' : 'password'}
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text-primary text-lg tracking-[0.5em] text-center font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
                    />
                    <button
                      onClick={() => setShowOtp(!showOtp)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                      aria-label={showOtp ? 'Hide OTP' : 'Show OTP'}
                    >
                      {showOtp ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={confirmPayment}
                  disabled={!phone || otp.length < 4 || confirming}
                  className="w-full py-3 rounded-lg bg-accent text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {confirming ? <Loader size={14} className="animate-spin" /> : <Lock size={14} />}
                  {' '}Confirm Secure Payment
                </button>

                <p className="text-[10px] text-muted text-center font-mono">
                  Secured via OPay Sandbox API. PIN/OTP not stored.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Transfer successful">
          <div className="w-full max-w-sm bg-surface-card border border-border rounded-2xl p-8 text-center shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-success/10 border-2 border-success flex items-center justify-center mx-auto mb-4 relative" aria-hidden="true">
              <Check size={28} className="text-success" style={{ animation: 'check-in 0.5s ease 0.2s both' }} />
              <span className="absolute inset-0 rounded-full border-2 border-success animate-ping opacity-20" />
            </div>
            <h2 className="text-xl font-bold text-success mb-1">Transfer Successful!</h2>
            <p className="text-sm text-muted mb-6">Your payment has been processed</p>

            <div className="bg-surface-elevated border border-border rounded-xl p-4 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Amount</span>
                <span className="font-semibold text-text-primary">{successData?.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Recipient</span>
                <span className="text-text-primary">{successData?.recipient}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                <span className="text-muted">Reference</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-accent">{successData?.ref}</code>
                  <button
                    onClick={() => handleCopy(successData?.ref || '')}
                    className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors"
                    aria-label="Copy reference"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 py-2.5 rounded-full bg-accent text-white font-semibold text-sm hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all"
              >
                New Transaction
              </button>
              <button
                onClick={() => setShowSuccess(false)}
                className="flex-1 py-2.5 rounded-full border border-accent/30 text-accent text-sm hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
