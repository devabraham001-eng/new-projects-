import { createClient } from '@supabase/supabase-js'
import ws from 'ws'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

console.log('Creating anonClient with ws transport...')
try {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
    realtime: { transport: ws },
  })
  console.log('Client created successfully')

  const { data, error } = await client.auth.signUp({
    email: 'ws-test@test.com',
    password: 'test123456',
    options: { data: { full_name: 'WS Test' } },
  })
  if (error) {
    console.log('signUp error:', error.message)
  } else {
    console.log('signUp success:', data.user?.email)
  }
} catch (err) {
  console.error('Exception:', err.message)
  console.error(err.stack)
}
