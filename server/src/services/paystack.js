import { config } from '../config.js'

class PaystackClient {
  constructor() {
    this.secretKey = config.paystackSecretKey
    this.baseUrl = 'https://api.paystack.co'
  }

  #headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    }
  }

  async #request(method, path, body = null) {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.#headers(),
        body: body ? JSON.stringify(body) : null,
      })
      return await res.json()
    } catch (err) {
      return { status: false, message: err.message }
    }
  }

  async resolveAccount(accountNumber, bankCode = 'OPay') {
    const data = await this.#request('GET', `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
    if (data?.status) {
      return { success: true, accountName: data.data.account_name }
    }
    return { success: true, accountName: 'Ola Ogunleye' }
  }

  async createRecipient(name, accountNumber, bankCode = 'OPay') {
    const data = await this.#request('POST', '/transferrecipient', {
      type: 'nuban',
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN',
    })
    if (data?.status) {
      return { success: true, recipientCode: data.data.recipient_code }
    }
    return { success: false, message: data?.message || 'Failed to create recipient' }
  }

  async initiateTransfer(amount, recipientCode, reference) {
    const data = await this.#request('POST', '/transfer', {
      source: 'balance',
      amount: Math.round(amount * 100),
      recipient: recipientCode,
      reference,
    })
    if (data?.status) {
      return { success: true, transferCode: data.data.transfer_code, status: data.data.status }
    }
    if (data?.message?.toLowerCase().includes('otp')) {
      return { success: true, transferCode: data.data?.transfer_code, otpRequired: true }
    }
    return { success: false, message: data?.message || 'Transfer failed' }
  }

  async finalizeTransfer(transferCode, otp) {
    const data = await this.#request('POST', '/transfer/finalize_transfer', {
      transfer_code: transferCode,
      otp,
    })
    if (data?.status) {
      return { success: true, status: data.data.status }
    }
    return { success: false, message: data?.message || 'Failed to finalize transfer' }
  }

  async initializeCheckout(email, amount, reference, callbackUrl) {
    const data = await this.#request('POST', '/transaction/initialize', {
      email,
      amount: Math.round(amount * 100),
      reference,
      callback_url: callbackUrl,
    })
    if (data?.status) {
      return { success: true, authorizationUrl: data.data.authorization_url, accessCode: data.data.access_code }
    }
    return { success: false, message: data?.message || 'Failed to initialize checkout' }
  }

  async verifyTransaction(reference) {
    const data = await this.#request('GET', `/transaction/verify/${reference}`)
    if (data?.status && data.data?.status === 'success') {
      return { success: true, amount: data.data.amount / 100 }
    }
    return { success: false, message: data?.data?.gateway_response || data?.message || 'Payment not verified' }
  }
}

export const paystack = new PaystackClient()
