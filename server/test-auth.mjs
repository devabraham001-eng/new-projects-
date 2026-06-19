import { createClient } from '@supabase/supabase-js'
import { config } from './src/config.js'

async function main() {
  console.log('Testing anonClient auth...')

  const anonClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false },
  })

  try {
    const { data, error } = await anonClient.auth.signUp({
      email: 'test-script@test.com',
      password: 'test123456',
      options: { data: { full_name: 'Test Script' } },
    })
    if (error) {
      console.log('Error:', error.message)
    } else {
      console.log('User created:', data.user?.email)
      console.log('Session:', !!data.session)
    }
  } catch (err) {
    console.error('Exception:', err.message)
    console.error(err.stack)
  }
}

main()
