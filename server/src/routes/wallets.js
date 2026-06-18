import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', req.user.id)
    .order('linked_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ wallets: data || [] })
})

router.post('/link', async (req, res) => {
  const { account_number, provider } = req.body
  if (!account_number) return res.status(400).json({ error: 'account_number is required' })

  const sanitized = account_number.replace(/\D/g, '')
  if (sanitized.length < 5) return res.status(400).json({ error: 'Invalid account number' })

  const { data: existing } = await supabase
    .from('wallets')
    .select('id')
    .eq('user_id', req.user.id)
    .eq('account_number', sanitized)
    .maybeSingle()

  if (existing) return res.status(409).json({ error: 'Wallet already linked' })

  const { data, error } = await supabase.from('wallets').insert({
    user_id: req.user.id,
    provider: provider || 'opay',
    account_number: sanitized,
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })

  res.status(201).json({ wallet: data })
})

export default router
