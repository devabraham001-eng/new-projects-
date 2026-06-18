import TelegramBot from 'node-telegram-bot-api'
import { config } from '../config.js'
import { supabase } from '../lib/supabase.js'
import { parseMessage } from './nlp.js'

let bot = null

export function startTelegramBot() {
  if (!config.telegramBotToken) {
    console.log('[Telegram] No token configured, skipping bot start')
    return
  }

  bot = new TelegramBot(config.telegramBotToken, { polling: true })
  console.log('[Telegram] Bot started (polling)')

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id
    const username = msg.from?.username || msg.from?.first_name || 'User'

    await bot.sendMessage(
      chatId,
      `*Welcome to PayPulse!* \u{1F4B3}\n\nI'm your conversational banking assistant.\n\nTo use me, first link your account from the PayPulse dashboard.\n\nTry saying:\n\`transfer 2000 to 7044879145\`\n\`send 5000 to Ola\`\n\`check balance\``,
      { parse_mode: 'Markdown' }
    )
  })

  bot.on('message', async (msg) => {
    if (msg.text?.startsWith('/')) return
    const chatId = msg.chat.id
    const text = msg.text

    const { data: link } = await supabase
      .from('telegram_links')
      .select('user_id')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle()

    if (!link) {
      await bot.sendMessage(
        chatId,
        'Please link your Telegram account from the PayPulse dashboard first. Go to Settings \u2192 Telegram in your dashboard.'
      )
      return
    }

    const intent = parseMessage(text)
    if (!intent) {
      await bot.sendMessage(
        chatId,
        'I didn\'t understand that. Try something like:\n\n`transfer 2000 to 7044879145`\n`check balance`\n`history`',
        { parse_mode: 'Markdown' }
      )
      return
    }

    if (intent.action === 'balance') {
      const { data: txs } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('user_id', link.user_id)
        .in('status', ['SUCCESSFUL'])

      const balance = (txs || []).reduce((s, t) => t.type === 'credit' ? s + Number(t.amount) : s - Number(t.amount), 0)
      await bot.sendMessage(chatId, `Your balance is \u20A6${balance.toLocaleString()}`)
      return
    }

    if (intent.action === 'history') {
      const { data: txs } = await supabase
        .from('transactions')
        .select('reference, amount, type, recipient, status, created_at')
        .eq('user_id', link.user_id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (!txs?.length) {
        await bot.sendMessage(chatId, 'No transactions found.')
        return
      }

      const lines = txs.map(t =>
        `\u2022 ${t.reference} | ${t.type === 'credit' ? '+' : '-'}\u20A6${Number(t.amount).toLocaleString()} | ${t.recipient} | ${t.status}`
      )
      await bot.sendMessage(chatId, `*Recent Transactions:*\n\n${lines.join('\n')}`, { parse_mode: 'Markdown' })
      return
    }

    if (intent.action === 'link_wallet') {
      const { error } = await supabase.from('wallets').insert({
        user_id: link.user_id,
        provider: 'opay',
        account_number: intent.accountNumber,
      })
      if (error) {
        await bot.sendMessage(chatId, 'Failed to link wallet. Please try from the dashboard.')
      } else {
        await bot.sendMessage(chatId, `Wallet ${intent.accountNumber} linked successfully!`)
      }
      return
    }

    const ref = `PP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const account = intent.recipientAccount || '7044879145'

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: link.user_id,
      reference: ref,
      amount: intent.amount,
      type: 'debit',
      recipient: intent.recipientName || account,
      recipient_account: account,
      status: 'SUCCESSFUL',
    })

    if (txError) {
      await bot.sendMessage(chatId, 'Sorry, something went wrong processing your payment.')
      return
    }

    await bot.sendMessage(
      chatId,
      `\u2705 *Transfer Successful!*\n\nAmount: \u20A6${intent.amount.toLocaleString()}\nRecipient: ${intent.recipientName || account}\nRef: \`${ref}\``,
      { parse_mode: 'Markdown' }
    )
  })
}
