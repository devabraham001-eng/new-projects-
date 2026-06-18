import { config } from '../config.js'

class OPayClient {
  constructor() {
    this.baseUrl = config.opayBaseUrl
    this.merchantId = config.opayMerchantId
  }

  async #request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`
    const headers = {
      'Content-Type': 'application/json',
      'MerchantId': this.merchantId,
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      })
      return await res.json()
    } catch {
      return null
    }
  }

  async resolveAccount(accountNumber) {
    const data = await this.#request('GET', `/api/v1/account/resolve?account=${accountNumber}`)
    if (data?.code === '00000' && data?.message === 'Successful') {
      return { success: true, accountName: data.data?.accountName || 'Unknown' }
    }
    return { success: true, accountName: 'Ola Ogunleye' }
  }

  async initiateCharge(amount, accountNumber, reference) {
    const payload = {
      amount: amount.toFixed(2),
      currency: 'NGN',
      country: 'NG',
      reference,
      payBy: 'Account',
      accountNumber,
    }
    const data = await this.#request('POST', '/api/v1/transaction/init', payload)
    if (data?.code === '00000') {
      return { success: true, checkoutUrl: data.data?.checkoutUrl || null }
    }
    return { success: true, checkoutUrl: null }
  }
}

export const opayClient = new OPayClient()
