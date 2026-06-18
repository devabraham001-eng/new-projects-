import { useState, useEffect } from 'react'
import { Copy, Link, Check, Loader, MessageCircle, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { useToast } from '../components/ui/toast'
import { api } from '../services/api'

export default function DashboardSettings() {
  const [telegramUsername, setTelegramUsername] = useState('')
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [telegramChatId, setTelegramChatId] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    api.get('/telegram').then(data => {
      if (data.link) {
        setTelegramLinked(true)
        setTelegramChatId(data.link.telegram_chat_id)
        setTelegramUsername(data.link.telegram_username || '')
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleLinkTelegram = async (e) => {
    e.preventDefault()
    if (!telegramUsername.trim()) return
    setSubmitting(true)
    try {
      const data = await api.post('/telegram/link', {
        telegram_chat_id: telegramUsername,
        telegram_username: telegramUsername,
      })
      setTelegramLinked(true)
      setTelegramChatId(data.link.telegram_chat_id)
      toast('Telegram linked! Send /start to @PayPulseBot')
    } catch (err) {
      toast(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnlinkTelegram = async () => {
    try {
      await api.delete('/telegram/unlink')
      setTelegramLinked(false)
      setTelegramChatId('')
      setTelegramUsername('')
      toast('Telegram unlinked')
    } catch (err) {
      toast(err.message)
    }
  }

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
    toast('Copied to clipboard')
  }

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: 'Backend URL', value: 'http://localhost:3001' },
                { label: 'OPay Sandbox', value: 'https://sandboxapi.opaycheckout.com' },
                { label: 'Merchant ID', value: '256621051120756' },
              ].map((s, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2.5 border-b border-border last:border-0 gap-1.5 sm:gap-0">
                  <span className="text-sm text-muted">{s.label}</span>
                  <code className="text-[10px] sm:text-xs font-mono text-accent bg-surface-secondary px-2.5 py-1 rounded flex items-center gap-2 max-w-full sm:max-w-none overflow-hidden">
                    <span className="truncate">{s.value}</span>
                    <button
                      onClick={() => handleCopy(s.value)}
                      className="text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded flex-shrink-0"
                      aria-label={`Copy ${s.label}`}
                    >
                      <Copy size={12} />
                    </button>
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-accent" />
              <div>
                <CardTitle>Telegram Integration</CardTitle>
                <CardDescription>Link Telegram for chat-based payments on the go.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse h-10 bg-surface-secondary rounded" />
            ) : !telegramLinked ? (
              <form onSubmit={handleLinkTelegram} className="flex items-end gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    label="Telegram Chat ID or @Username"
                    placeholder="@yourusername"
                    value={telegramUsername}
                    onChange={e => setTelegramUsername(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={submitting}>
                  {submitting ? <Loader size={14} className="animate-spin" /> : <Link size={14} />}
                  {' '}Link Telegram
                </Button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                    <Check size={18} className="text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-success">Telegram Linked</p>
                    <p className="text-xs text-muted font-mono">Chat ID: {telegramChatId}</p>
                  </div>
                  <button
                    onClick={handleUnlinkTelegram}
                    className="text-muted hover:text-error transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded"
                    aria-label="Unlink Telegram"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-muted">
                  Send <code className="text-accent font-mono">/start</code> to <strong>@PayPulseBot</strong> on Telegram to start banking.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-error/20">
          <CardHeader>
            <CardTitle className="text-error">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
