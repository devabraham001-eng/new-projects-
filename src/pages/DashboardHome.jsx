import { useState, useEffect } from 'react'
import { Wallet, ArrowLeftRight, ArrowUpRight, Send, Plus } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const statusConfig = {
  SUCCESSFUL: { variant: 'success', dot: true },
  PENDING: { variant: 'warning', dot: true },
  FAILED: { variant: 'error', dot: true },
}

const categoryColors = ['bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500']

export default function DashboardHome({ onNavigate, searchQuery = '' }) {
  const [stats, setStats] = useState(null)
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    Promise.all([
      api.get('/transactions/stats'),
      api.get('/transactions?limit=5'),
    ]).then(([statsData, txData]) => {
      setStats(statsData)
      setTxs(txData.transactions || [])
    }).catch(() => {
      setStats({ totalBalance: 0, transactionsToday: 0, activeWallets: 0 })
      setTxs([])
    }).finally(() => setLoading(false))
  }, [])

  const statCards = stats ? [
    { label: 'Total Balance', value: `\u20A6${(stats.totalBalance || 0).toLocaleString()}`, change: '', changeLabel: 'Real-time balance', icon: Wallet },
    { label: 'Transactions Today', value: String(stats.transactionsToday || 0), change: '', changeLabel: 'today', icon: ArrowLeftRight },
    { label: 'Active Wallets', value: String(stats.activeWallets || 0), change: '', changeLabel: 'Linked accounts', icon: Wallet },
  ] : []

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const balance = stats?.totalBalance || 0
  const filteredTxs = searchQuery
    ? txs.filter(tx =>
        (tx.recipient_account || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.reference_code || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : txs

  if (loading) {
    return (
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-card border border-border rounded-[20px] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-9 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
        <div className="mt-6 bg-surface-card border border-border rounded-[20px] overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center justify-between px-5 sm:px-6 py-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Mobile Hero Wallet Card ── */}
      <div className="md:hidden px-4 pt-4 pb-2">
        <div className="bg-surface-card rounded-[20px] px-5 py-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Wallet</span>
          </div>
          <p className="text-xs text-muted/70 mb-2">{userName}</p>
          <p className="text-3xl font-bold text-text-primary tracking-tight">\u20A6{balance.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Quick Action Row (mobile) ── */}
      <div className="md:hidden px-4 pb-2">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Send, label: 'Send', action: () => onNavigate('chat') },
            { icon: Plus, label: 'Deposit', action: () => onNavigate('deposit') },
            { icon: ArrowUpRight, label: 'Pay', action: () => onNavigate('chat') },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="flex flex-col items-center gap-2 py-4 bg-surface-card rounded-[16px] hover:bg-surface-hover transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-accent/5 flex items-center justify-center text-accent">
                <item.icon size={20} />
              </div>
              <span className="text-xs font-medium text-muted">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Desktop: 3-column stats ── */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 p-6 sm:p-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="bg-surface-card border border-border rounded-[20px] p-5 sm:p-6 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted uppercase tracking-wider">{stat.label}</span>
                <div className="w-9 h-9 rounded-xl bg-accent/5 border border-accent/10 flex items-center justify-center">
                  <Icon size={16} className="text-accent" />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary mb-1">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted">{stat.changeLabel}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Recent Transactions ── */}
      <div className="px-4 sm:px-6 sm:p-8 pb-4">
        <div className="bg-surface-card border border-border rounded-[20px] overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Recent Activity</h2>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs text-accent hover:text-accent-hover font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded transition-colors"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-border/50">
            {filteredTxs.length === 0 ? (
              <div className="px-5 sm:px-6 py-8 text-center text-sm text-muted">
                {searchQuery ? 'No transactions match your search.' : 'No transactions yet. Start by sending a payment in Chat.'}
              </div>
            ) : filteredTxs.map((tx, i) => {
              const isCredit = Number(tx.amount) > 0
              return (
                <div key={i} className="flex items-center justify-between px-5 sm:px-6 py-3.5 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isCredit ? 'bg-success/5' : 'bg-error/5'
                    }`}>
                      <ArrowUpRight size={14} className={`${isCredit ? 'text-success' : 'text-error'} ${!isCredit ? 'rotate-90' : ''}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{tx.recipient_account || 'Deposit'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className={`text-sm font-medium ${isCredit ? 'text-success' : 'text-text-primary'}`}>
                      {isCredit ? '+' : '-'}\u20A6{Math.abs(Number(tx.amount)).toLocaleString()}
                    </span>
                    <Badge variant={statusConfig[tx.status]?.variant || 'warning'} size="sm" dot>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
