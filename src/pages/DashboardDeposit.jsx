import { useState } from 'react'
import { Wallet, ExternalLink, Check, Loader, ArrowLeft } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useToast } from '../components/ui/toast'
import { api } from '../services/api'

export default function DashboardDeposit() {
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const { toast } = useToast()

  const handleDeposit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccess(null)
    try {
      const data = await api.post('/deposits/init', { amount: Number(amount) })
      const popup = window.open(data.authorization_url, 'paystack', 'width=600,height=700')
      if (!popup) {
        window.location.href = data.authorization_url
      }
      const pollRef = setInterval(async () => {
        try {
          const result = await api.post('/deposits/verify', { reference: data.reference })
          if (result.status === 'SUCCESSFUL') {
            clearInterval(pollRef)
            setSubmitting(false)
            setSuccess(Number(amount))
            setAmount('')
            toast('Deposit successful!')
          }
        } catch {}
      }, 3000)
      setTimeout(() => clearInterval(pollRef), 120000)
    } catch (err) {
      toast(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex-1 p-6 sm:p-8 overflow-y-auto">
      <div className="max-w-lg mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-accent" />
              <div>
                <CardTitle>Fund Your Account</CardTitle>
                <CardDescription>Add money to your PayPulse wallet via card or bank transfer.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
                  <Check size={28} className="text-success" />
                </div>
                <p className="text-lg font-semibold text-text-primary">Deposit Successful!</p>
                <p className="text-2xl font-bold text-success">+NGN {success.toLocaleString()}</p>
                <p className="text-sm text-muted">Your balance has been updated.</p>
                <Button variant="primary" onClick={() => setSuccess(null)}>
                  Make Another Deposit
                </Button>
              </div>
            ) : (
              <form onSubmit={handleDeposit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-primary" htmlFor="amount">Amount (NGN)</label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="2000"
                    min="100"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted">Minimum deposit: ₦100</p>
                </div>

                <Button type="submit" className="w-full" variant="primary" disabled={submitting || !amount}>
                  {submitting ? (
                    <><Loader size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    <><ExternalLink size={16} /> Deposit Now</>
                  )}
                </Button>

                <div className="bg-surface-secondary rounded-xl p-4 border border-border text-xs text-muted space-y-1.5">
                  <p className="font-medium text-text-primary">Test Mode</p>
                  <p>Card: <code className="text-accent font-mono">4508 7500 1574 1019</code></p>
                  <p>CVV: <code className="text-accent font-mono">100</code> &nbsp; Expiry: <code className="text-accent font-mono">05/25</code></p>
                  <p>OTP: <code className="text-accent font-mono">543210</code></p>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
