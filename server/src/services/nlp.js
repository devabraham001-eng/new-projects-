const BANKS = {
  opay: 'OPay',
  gtb: 'GTBank',
  access: 'Access Bank',
  zenith: 'Zenith Bank',
  firstbank: 'First Bank',
  uba: 'UBA',
  kuda: 'Kuda',
  moniepoint: 'Moniepoint',
  palmpay: 'PalmPay',
  flutterwave: 'Flutterwave',
  paystack: 'Paystack',
}

function detectBank(text) {
  const lower = text.toLowerCase()
  for (const [key, name] of Object.entries(BANKS)) {
    if (lower.includes(key)) return name
  }
  return null
}

const PATTERN_TRANSFER = /(?:transfer|send|pay)\s+(\d{2,12}(?:[,.]\d{1,2})?)\s+(?:to|for)\s+(\d{5,15})(?:\s+via\s+(\w+))?/i
const PATTERN_SIMPLE = /(?:send|pay|transfer)\s+(\d{2,12}(?:[,.]\d{1,2})?)\s+to\s+([A-Za-z\s]+?)(?:\s+via\s+(\w+))?$/i

export function parseMessage(text) {
  const trimmed = text.trim()
  let match

  match = trimmed.match(PATTERN_TRANSFER)
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ''))
    const account = match[2]
    const bank = match[3] ? detectBank(match[3]) : null
    return { amount, recipientAccount: account, bank, confidence: 0.9, raw: trimmed }
  }

  match = trimmed.match(PATTERN_SIMPLE)
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ''))
    const recipient = match[2].trim()
    const bank = match[3] ? detectBank(match[3]) : null
    return { amount, recipientName: recipient, recipientAccount: null, bank, confidence: 0.7, raw: trimmed }
  }

  if (/balance|statement/i.test(trimmed)) {
    return { action: 'balance', confidence: 0.8, raw: trimmed }
  }

  if (/history|transactions/i.test(trimmed)) {
    return { action: 'history', confidence: 0.8, raw: trimmed }
  }

  if (/(?:link|connect)\s+(?:opay\s+)?(\d{5,15})/i.test(trimmed)) {
    const account = trimmed.match(/(\d{5,15})/)[1]
    return { action: 'link_wallet', accountNumber: account, confidence: 0.85, raw: trimmed }
  }

  return null
}
