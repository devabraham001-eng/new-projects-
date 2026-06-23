import { Router } from 'express'
import { parseMessage } from '../services/nlp.js'
import { paystack } from '../services/paystack.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.post('/parse', async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).json({ error: 'text is required' })

  const intent = parseMessage(text)
  if (!intent) {
    return res.status(400).json({ error: 'Could not parse command', hint: 'Try: "transfer 2000 to 7044879145"' })
  }

  if (intent.action === 'balance') {
    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', req.user.id)
      .in('status', ['SUCCESSFUL'])

    const balance = (txs || []).reduce((s, t) => t.type === 'credit' ? s + Number(t.amount) : s - Number(t.amount), 0)
    return res.json({ action: 'balance', balance })
  }

  if (intent.action === 'history') {
    const { data: txs } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return res.json({ action: 'history', transactions: txs || [] })
  }

  const account = intent.recipientAccount || '7044879145'
  const { data: wallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', req.user.id)
    .limit(1)

  const sourceWallet = wallets?.[0]

  const ref = `PP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

  const { data: accountInfo } = await paystack.resolveAccount(account)

  const { error: txError, data: tx } = await supabase.from('transactions').insert({
    user_id: req.user.id,
    reference: ref,
    amount: intent.amount,
    type: 'debit',
    recipient: intent.recipientName || accountInfo?.accountName || account,
    recipient_account: account,
    status: 'PENDING',
  }).select().single()

  if (txError) {
    return res.status(500).json({ error: 'Failed to create transaction' })
  }

  res.json({
    action: 'payment_intent',
    transaction: tx,
    invoice: {
      reference: ref,
      amount: intent.amount,
      recipient: intent.recipientName || accountInfo?.accountName || account,
      account,
      bank: intent.bank || 'Paystack',
    },
  })
})

router.post('/confirm', async (req, res) => {
  const { reference, otp } = req.body
  if (!reference || !otp) {
    return res.status(400).json({ error: 'reference and otp are required' })
  }

  const { data: tx } = await supabase
    .from('transactions')
    .select('*')
    .eq('reference', reference)
    .eq('user_id', req.user.id)
    .single()

  if (!tx) return res.status(404).json({ error: 'Transaction not found' })
  if (tx.status !== 'PENDING') return res.status(400).json({ error: 'Transaction already processed' })

  const recipientResult = await paystack.createRecipient(tx.recipient, tx.recipient_account)
  if (!recipientResult.success) {
    return res.status(500).json({ error: 'Failed to create payment recipient' })
  }

  const transferResult = await paystack.initiateTransfer(tx.amount, recipientResult.recipientCode, reference)
  if (!transferResult.success) {
    await supabase.from('transactions').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('id', tx.id)
    return res.status(500).json({ error: transferResult.message || 'Transfer failed' })
  }

  if (transferResult.otpRequired) {
    const finalizeResult = await paystack.finalizeTransfer(transferResult.transferCode, otp)
    if (!finalizeResult.success) {
      await supabase.from('transactions').update({ status: 'FAILED', updated_at: new Date().toISOString() }).eq('id', tx.id)
      return res.status(500).json({ error: finalizeResult.message || 'OTP verification failed' })
    }
  }

  const { error } = await supabase
    .from('transactions')
    .update({ status: 'SUCCESSFUL', updated_at: new Date().toISOString() })
    .eq('id', tx.id)

  if (error) return res.status(500).json({ error: 'Failed to confirm transaction' })

  res.json({ success: true, reference, status: 'SUCCESSFUL' })
})

export default router
