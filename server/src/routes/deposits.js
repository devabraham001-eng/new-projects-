import { Router } from 'express'
import { paystack } from '../services/paystack.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.post('/init', async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum deposit is ₦100' })
    }

    const ref = `DEP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(req.user.id)
    if (userError) return res.status(500).json({ error: 'Auth error: ' + userError.message })
    const email = user?.email || 'user@paypulse.app'

    const origin = req.headers.origin || 'https://new-projects-three.vercel.app'
    const callbackUrl = `${origin}/dashboard?reference=${ref}`

    const result = await paystack.initializeCheckout(email, amount, ref, callbackUrl)
    if (!result.success) {
      return res.status(500).json({ error: 'Paystack: ' + result.message })
    }

    const { error: insertError } = await supabase.from('transactions').insert({
      user_id: req.user.id,
      reference: ref,
      amount,
      type: 'credit',
      recipient: 'Deposit',
      recipient_account: email,
      status: 'PENDING',
      provider: 'paystack',
    })
    if (insertError) return res.status(500).json({ error: 'DB error: ' + insertError.message })

    res.json({ reference: ref, authorization_url: result.authorizationUrl })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/verify', async (req, res) => {
  const { reference } = req.body
  if (!reference) return res.status(400).json({ error: 'reference is required' })

  const { data: tx } = await supabase
    .from('transactions')
    .select('*')
    .eq('reference', reference)
    .eq('user_id', req.user.id)
    .single()

  if (!tx) return res.status(404).json({ error: 'Transaction not found' })
  if (tx.status !== 'PENDING') return res.json({ success: true, status: tx.status })

  const result = await paystack.verifyTransaction(reference)
  if (!result.success) {
    await supabase.from('transactions').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('id', tx.id)
    return res.status(400).json({ error: result.message })
  }

  await supabase.from('transactions').update({ status: 'SUCCESSFUL', updated_at: new Date().toISOString() }).eq('id', tx.id)

  res.json({ success: true, status: 'SUCCESSFUL', amount: result.amount })
})

export default router
