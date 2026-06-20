import { Router } from 'express'
import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import { config } from '../config.js'
import { supabase } from '../lib/supabase.js'

const router = Router()

const anonClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { transport: ws },
})

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await anonClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email.split('@')[0] } },
    })

    if (error) return res.status(400).json({ error: error.message })

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name: name || email.split('@')[0],
        email,
      })
      if (profileError) console.error('[Profile Insert Error]', profileError)
    }

    res.json({ user: data.user, session: data.session })
  } catch (err) {
    console.error('[Register Error]', err.stack || err)
    res.status(500).json({ error: err.message || 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await anonClient.auth.signInWithPassword({ email, password })
    if (error?.message?.toLowerCase().includes('email not confirmed')) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const user = users?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
      if (user) {
        await supabase.auth.admin.updateUserById(user.id, { email_confirm: true })
        const { data: retry, error: retryErr } = await anonClient.auth.signInWithPassword({ email, password })
        if (retryErr) return res.status(401).json({ error: retryErr.message })
        return res.json({ user: retry.user, session: retry.session })
      }
    }

    if (error) return res.status(401).json({ error: error.message })

    res.json({ user: data.user, session: data.session })
  } catch (err) {
    console.error('[Login Error]', err.stack || err)
    res.status(500).json({ error: err.message || 'Login failed' })
  }
})

router.post('/logout', async (req, res) => {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    const token = header.slice(7)
    const { data: { user } } = await supabase.auth.getUser(token)
    if (user) {
      await supabase.auth.admin.signOut(user.id)
    }
  }
  res.json({ success: true })
})

router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token is required' })
    }

    const { data, error } = await anonClient.auth.refreshSession({ refresh_token })
    if (error) return res.status(401).json({ error: error.message })

    res.json({ user: data.user, session: data.session })
  } catch (err) {
    console.error('[Refresh Error]', err.stack || err)
    res.status(500).json({ error: err.message || 'Refresh failed' })
  }
})

router.get('/me', async (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const token = header.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid or expired token' })

  res.json({ user })
})

export default router
