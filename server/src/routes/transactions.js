import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  const { status, limit } = req.query
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status.toUpperCase())
  }

  if (limit) query = query.limit(parseInt(limit, 10))

  const { data, error } = await query

  if (error) return res.status(500).json({ error: error.message })
  res.json({ transactions: data || [] })
})

router.get('/stats', async (req, res) => {
  const { data: txs } = await supabase
    .from('transactions')
    .select('amount, type, status, created_at')
    .eq('user_id', req.user.id)
    .in('status', ['SUCCESSFUL', 'PENDING'])

  const totalBalance = (txs || []).reduce((s, t) =>
    t.type === 'credit' ? s + Number(t.amount) : s - Number(t.amount), 0
  )

  const today = new Date().toISOString().slice(0, 10)
  const todayTxs = (txs || []).filter(t => t.created_at?.startsWith(today))

  res.json({
    totalBalance,
    transactionsToday: todayTxs.length,
    activeWallets: 0,
  })
})

export default router
