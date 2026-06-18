import { useState, useEffect } from 'react'
import { RefreshCw, ArrowLeftRight, Loader } from 'lucide-react'
import { Card } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { api } from '../services/api'

const statusConfig = {
  SUCCESSFUL: { variant: 'success', dot: true },
  PENDING: { variant: 'warning', dot: true },
  FAILED: { variant: 'error', dot: true },
}

export default function DashboardTransactions() {
  const [filter, setFilter] = useState('all')
  const [txs, setTxs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTxs = async () => {
    setLoading(true)
    try {
      const params = filter === 'all' ? '' : `?status=${filter}`
      const data = await api.get(`/transactions${params}`)
      setTxs(data.transactions || [])
    } catch {
      setTxs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTxs() }, [filter])

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'successful', 'pending', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                filter === f
                  ? 'bg-accent/5 text-accent border border-accent/20'
                  : 'text-muted border border-border hover:text-text-primary hover:border-muted'
              }`}
              aria-pressed={filter === f}
            >
              {f === 'all' ? 'All' : f.toLowerCase()}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchTxs} disabled={loading}>
          {loading ? <Loader size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          {' '}Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="animate-pulse p-6 space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-surface-secondary rounded" />)}
          </div>
        ) : txs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-elevated">
                  <th className="text-left px-5 py-3.5 text-[10px] font-mono text-muted uppercase tracking-wider">Reference</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-mono text-muted uppercase tracking-wider">Amount</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-mono text-muted uppercase tracking-wider">Recipient</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-mono text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-[10px] font-mono text-muted uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx, i) => (
                  <tr key={tx.id || i} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                    <td className="px-5 py-4">
                      <code className="text-xs font-mono text-accent">{tx.reference}</code>
                    </td>
                    <td className={`px-5 py-4 font-medium text-text-primary ${tx.type === 'credit' ? 'text-success' : ''}`}>
                      {tx.type === 'credit' ? '+' : '-'}\u20A6{Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-muted">{tx.recipient}</td>
                    <td className="px-5 py-4">
                      <Badge variant={statusConfig[tx.status]?.variant || 'warning'} size="md" dot>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-muted text-xs">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-secondary border border-border flex items-center justify-center mb-4">
              <ArrowLeftRight size={20} className="text-muted" />
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">No transactions found</p>
            <p className="text-xs text-muted">No {filter !== 'all' ? filter : ''} transactions to display.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
