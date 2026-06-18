import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.post('/link', async (req, res) => {
  const { telegram_chat_id, telegram_username } = req.body
  if (!telegram_chat_id) return res.status(400).json({ error: 'telegram_chat_id is required' })

  const { data: existing } = await supabase
    .from('telegram_links')
    .select('id')
    .eq('user_id', req.user.id)
    .maybeSingle()

  if (existing) {
    return res.status(409).json({ error: 'Telegram already linked. Unlink first.' })
  }

  const { data, error } = await supabase.from('telegram_links').insert({
    user_id: req.user.id,
    telegram_chat_id: String(telegram_chat_id),
    telegram_username: telegram_username || null,
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ link: data })
})

router.delete('/unlink', async (req, res) => {
  const { error } = await supabase
    .from('telegram_links')
    .delete()
    .eq('user_id', req.user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

router.get('/', async (req, res) => {
  const { data } = await supabase
    .from('telegram_links')
    .select('*')
    .eq('user_id', req.user.id)
    .maybeSingle()

  res.json({ link: data || null })
})

export default router
