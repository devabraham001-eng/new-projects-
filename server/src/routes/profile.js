import { Router } from 'express'
import { supabase } from '../lib/supabase.js'

const router = Router()

router.get('/', async (req, res) => {
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .maybeSingle()

  if (!profile) {
    const { data, error } = await supabase.from('profiles').insert({
      id: req.user.id,
      name: req.user.user_metadata?.full_name || req.user.email?.split('@')[0] || 'User',
      email: req.user.email,
    }).select().single()

    if (error) return res.status(500).json({ error: error.message })
    profile = data
  }

  res.json({ profile })
})

router.put('/', async (req, res) => {
  const { name } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  const { data, error } = await supabase
    .from('profiles')
    .update({ name })
    .eq('id', req.user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json({ profile: data })
})

export default router
