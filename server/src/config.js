import 'dotenv/config'

export const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  opayBaseUrl: process.env.OPAY_BASE_URL || 'https://sandboxapi.opaycheckout.com',
  opayMerchantId: process.env.OPAY_MERCHANT_ID || '256621051120756',
  port: parseInt(process.env.PORT || '3001', 10),
}
