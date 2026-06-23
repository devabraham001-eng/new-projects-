import TelegramBot from 'node-telegram-bot-api'
import { config } from '../config.js'
import { supabase } from '../lib/supabase.js'
import { parseMessage } from './nlp.js'
import { paystack } from './paystack.js'

let bot = null

export function startTelegramBot() {
  if (!config.telegramBotToken) {
    console.log('[Telegram] No token configured, skipping bot start')
    return
  }

  if (config.telegramEnabled === false) {
    console.log('[Telegram] Disabled via TELEGRAM_ENABLED env var')
    return
  }

  bot = new TelegramBot(config.telegramBotToken, { polling: false })

  function startWithRetry(retries = 5) {
    bot.deleteWebHook()
      .then(() => bot.startPolling())
      .then(() => console.log('[Telegram] Bot started (polling)'))
      .catch((err) => {
        if (err.code === 'ETELEGRAM' && err.message.includes('409') && retries > 0) {
          console.log(`[Telegram] 409 conflict (${retries} retries left), waiting 5s...`)
          setTimeout(() => startWithRetry(retries - 1), 5000)
        } else {
          console.error('[Telegram] Failed to start bot:', err.message)
        }
      })
  }

  bot.on('polling_error', (err) => {
    if (err.code === 'ETELEGRAM' && err.message.includes('409')) {
      console.log('[Telegram] Polling conflict detected — retrying in 10s...')
      bot.stopPolling()
      setTimeout(() => startWithRetry(), 10000)
    } else {
      console.error('[Telegram] Polling error:', err.message)
    }
  })

  startWithRetry()

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id
    const username = msg.from?.username || msg.from?.first_name || 'User'

    const { data: link } = await supabase
      .from('telegram_links')
      .select('user_id')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle()

    if (link) {
      await bot.sendMessage(
        chatId,
        `*Welcome back, ${username}!* \u{1F4B3}\n\nTry:\n\`check balance\`\n\`transfer 2000 to 7044879145\`\n\`history\``,
        { parse_mode: 'Markdown' }
      )
      return
    }

    await bot.sendMessage(
      chatId,
      `*Welcome to PayPulse!* \u{1F4B3}\n\nI'm your conversational banking assistant.\n\nTo link your account, send:\n\n\`/link youremail@example.com\`\n\nThen try:\n\`check balance\`\n\`transfer 2000 to 7044879145\``,
      { parse_mode: 'Markdown' }
    )
  })

  bot.onText(/\/link(?:\s+(\S+))?/, async (msg, match) => {
    const chatId = msg.chat.id

    const { data: link } = await supabase
      .from('telegram_links')
      .select('user_id')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle()

    if (link) {
      await bot.sendMessage(chatId, 'Your Telegram is already linked to your PayPulse account.')
      return
    }

    const code = match[1]
    if (!code) {
      await bot.sendMessage(
        chatId,
        'To link your account, send:\n\n`/link YOUR_EMAIL`\n\nUse the email you registered with on PayPulse.',
        { parse_mode: 'Markdown' }
      )
      return
    }

    const email = code.toLowerCase().trim()

    let { data: profile } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle()

    if (!profile) {
      const { data: { users } } = await supabase.auth.admin.listUsers()
      const authUser = users?.find(u => u.email?.toLowerCase() === email)
      if (authUser) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split('@')[0] || 'User',
        }).select().single()

        if (!insertError) profile = { id: authUser.id, email: authUser.email }
      }
    }

    if (!profile) {
      await bot.sendMessage(
        chatId,
        `No account found with email \`${email}\`.\n\nMake sure you use the same email you registered with on PayPulse dashboard. If you haven't registered yet, go to the PayPulse website and create an account first.`,
        { parse_mode: 'Markdown' }
      )
      return
    }

    const { error: insertError } = await supabase.from('telegram_links').insert({
      user_id: profile.id,
      telegram_chat_id: String(chatId),
      telegram_username: msg.from?.username || null,
    })

    if (insertError) {
      await bot.sendMessage(chatId, 'Failed to link account. Please try again from the Settings page.')
      return
    }

    await bot.sendMessage(
      chatId,
      `\u2705 *Account linked successfully!*\n\nYou can now use PayPulse via Telegram.\n\nTry:\n\`check balance\`\n\`transfer 2000 to 7044879145\`\n\`history\``,
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
        'To link your account, send:\n\n`/link youremail@example.com`\n\nReplace with the email you used to register on PayPulse.',
        { parse_mode: 'Markdown' }
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

    if (intent.action === 'wallets') {
      const { data: wallets } = await supabase
        .from('wallets')
        .select('provider, account_number, linked_at')
        .eq('user_id', link.user_id)
        .order('linked_at', { ascending: false })

      if (!wallets?.length) {
        await bot.sendMessage(
          chatId,
          'You have no linked wallets yet. To link one, send:\n\n`link 7044879145`\n\nOr go to Settings in your dashboard.'
        )
        return
      }

      const lines = wallets.map((w, i) =>
        `${i + 1}. ${w.provider.toUpperCase()} - ${w.account_number} (linked ${new Date(w.linked_at).toLocaleDateString()})`
      )
      await bot.sendMessage(
        chatId,
        `*Your Linked Wallets:*\n\n${lines.join('\n')}`,
        { parse_mode: 'Markdown' }
      )
      return
    }

    if (intent.action === 'link_wallet') {
      const { data: existing } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', link.user_id)
        .eq('account_number', intent.accountNumber)
        .maybeSingle()

      if (existing) {
        await bot.sendMessage(chatId, `Wallet ${intent.accountNumber} is already linked.`)
        return
      }

      const { error } = await supabase.from('wallets').insert({
        user_id: link.user_id,
        account_number: intent.accountNumber,
      })

      if (error) {
        await bot.sendMessage(chatId, 'Failed to link wallet.')
        return
      }

      await bot.sendMessage(chatId, `Wallet ${intent.accountNumber} linked successfully!`)
    }
    const ref = `PP-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const account = intent.recipientAccount || '7044879145'
    const recipientName = intent.recipientName || account

    const recipientResult = await paystack.createRecipient(recipientName, account)
    if (!recipientResult.success) {
      await bot.sendMessage(chatId, 'Sorry, failed to set up the recipient for this transfer.')
      return
    }

    const transferResult = await paystack.initiateTransfer(intent.amount, recipientResult.recipientCode, ref)
    if (!transferResult.success) {
      await bot.sendMessage(chatId, `Transfer failed: ${transferResult.message}`)
      return
    }

    const status = transferResult.otpRequired ? 'PENDING' : 'SUCCESSFUL'

    const { error: txError } = await supabase.from('transactions').insert({
      user_id: link.user_id,
      reference: ref,
      amount: intent.amount,
      type: 'debit',
      recipient: recipientName,
      recipient_account: account,
      status,
    })

    if (txError) {
      await bot.sendMessage(chatId, 'Sorry, something went wrong recording your payment.')
      return
    }

    if (status === 'PENDING') {
      await bot.sendMessage(
        chatId,
        `\u23F3 *Transfer pending OTP!*\n\nAmount: \u20A6${intent.amount.toLocaleString()}\nRecipient: ${recipientName}\nRef: \`${ref}\`\n\nCheck your Paystack dashboard email for the OTP to complete this transfer.`,
        { parse_mode: 'Markdown' }
      )
      return
    }

    await bot.sendMessage(
      chatId,
      `\u2705 *Transfer Successful!*\n\nAmount: \u20A6${intent.amount.toLocaleString()}\nRecipient: ${recipientName}\nRef: \`${ref}\``,
      { parse_mode: 'Markdown' }
    )
  })
}
