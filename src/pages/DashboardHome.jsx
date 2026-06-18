import { useState, useEffect } from 'react'
import { TrendingUp, Wallet, ArrowLeftRight, ArrowUpRight } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { api } from '../services/api'

const statusConfig = {
  SUCCESSFUL: { variant: 'success', dot: true },
  PENDING: { variant: 'warning', dot: true },
  FAILED: { variant: 'error', dot: true },
}

export default function DashboardHome({ onNavigate }) {
  const [stats, setStats] = useState(null)
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

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

  if (loading) {
    return (
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-surface-card border border-border rounded-[20px] p-5 sm:p-6 animate-pulse h-[140px]" />
          ))}
        </div>
        <div className="mt-6 bg-surface-card border border-border rounded-[20px] animate-pulse h-[300px]" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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

      <div className="mt-6">
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
            {txs.length === 0 ? (
              <div className="px-5 sm:px-6 py-8 text-center text-sm text-muted">
                No transactions yet. Start by sending a payment in Chat.
              </div>
            ) : txs.map((tx, i) => {
              const isCredit = tx.type === 'credit'
              return (
                <div key={i} className="flex items-center justify-between px-5 sm:px-6 py-3.5 hover:bg-accent/5 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isCredit ? 'bg-success/5' : 'bg-error/5'
                    }`}>
                      <ArrowUpRight size={14} className={`${isCredit ? 'text-success' : 'text-error'} ${!isCredit ? 'rotate-90' : ''}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate">{tx.recipient}</div>
                      <code className="text-[10px] font-mono text-muted">{tx.reference}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <span className={`text-sm font-medium ${isCredit ? 'text-success' : 'text-text-primary'}`}>
                      {isCredit ? '+' : '-'}\u20A6{Number(tx.amount).toLocaleString()}
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
