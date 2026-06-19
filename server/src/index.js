import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config } from './config.js'
import { requireAuth } from './middleware/auth.js'
import { startTelegramBot } from './services/telegram.js'
import authRoutes from './routes/auth.js'
import chatRoutes from './routes/chat.js'
import transactionsRoutes from './routes/transactions.js'
import walletsRoutes from './routes/wallets.js'
import profileRoutes from './routes/profile.js'
import telegramRoutes from './routes/telegram.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://new-projects-three.vercel.app',
  ],
  credentials: true,
}))
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'paypulse-api', version: '0.2.0' })
})

app.use('/api/auth', authRoutes)
app.use('/api/chat', requireAuth, chatRoutes)
app.use('/api/transactions', requireAuth, transactionsRoutes)
app.use('/api/wallets', requireAuth, walletsRoutes)
app.use('/api/profile', requireAuth, profileRoutes)
app.use('/api/telegram', requireAuth, telegramRoutes)

app.use((err, req, res, next) => {
  console.error('[Error]', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(config.port, () => {
  console.log(`[PayPulse API] running on http://localhost:${config.port}`)
  startTelegramBot()
})
