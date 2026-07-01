import { useState, useEffect } from 'react'
import { Copy, Check, MessageCircle, X, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { useToast } from '../components/ui/toast'
import { api } from '../services/api'

const BOT_USERNAME = 'Payplusepp_bot'

export default function DashboardSettings() {
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [telegramUsername, setTelegramUsername] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')
  const [loading, setLoading] = useState(true)
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
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-36 mb-1" />
                    <Skeleton className="h-3 w-52" />
                  </div>
                </div>
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-10 w-44 rounded-full" />
              </div>
            ) : !telegramLinked ? (
              <div className="space-y-4">
                <div className="bg-surface-secondary rounded-xl p-4 border border-border">
                  <p className="text-sm text-text-primary font-medium mb-2">How to link:</p>
                  <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
                    <li>
                      Open Telegram and search for{' '}
                      <strong className="text-accent">@{BOT_USERNAME}</strong>
                    </li>
                    <li>
                      Send{' '}
                      <code className="text-accent font-mono text-xs bg-surface px-1.5 py-0.5 rounded">
                        /link your@email.com
                      </code>{' '}
                      (use the email you registered with)
                    </li>
                    <li>You'll get a confirmation message when linked</li>
                  </ol>
                </div>
                <a
                  href={`https://t.me/${BOT_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-text-inverted font-semibold text-sm hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all w-fit"
                >
                  <ExternalLink size={16} />
                  Open @{BOT_USERNAME}
                </a>
                <button
                  onClick={() => api.get('/telegram').then(d => {
                    if (d.link) {
                      setTelegramLinked(true)
                      setTelegramChatId(d.link.telegram_chat_id)
                      setTelegramUsername(d.link.telegram_username || '')
                      toast('Telegram linked!')
                    }
                  })}
                  className="text-xs text-muted hover:text-accent transition-colors"
                >
                  Check connection status &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                    <Check size={18} className="text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-success">Telegram Linked</p>
                    <p className="text-xs text-muted font-mono">
                      {telegramUsername ? `@${telegramUsername}` : `Chat ID: ${telegramChatId}`}
                    </p>
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
                  Send <code className="text-accent font-mono">/start</code> to <strong>@{BOT_USERNAME}</strong> to start banking.
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
