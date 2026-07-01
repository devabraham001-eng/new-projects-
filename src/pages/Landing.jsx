import { Link } from 'react-router-dom'
import {
  MessageCircle, Wallet, Shield, ArrowRight,
  Smartphone, Globe, Lock, Banknote, ZapOff, Menu
} from 'lucide-react'
import { motion } from 'framer-motion'
import Navbar from '../components/ui/Navbar'
import Footer from '../components/ui/Footer'
import { Button } from '../components/ui/button'
import ChatDemo from '../components/ui/ChatDemo'

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const inView = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <Navbar />

      <main>
        {/* ─── HERO ─── */}
        <section className="relative min-h-screen flex flex-col items-center pt-0 pb-20 sm:pb-28 bg-[#0A0A0A] sm:bg-surface text-white sm:text-text-primary">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute left-1/2 top-[30%] h-[300px] w-[300px] sm:h-[600px] sm:w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 sm:bg-accent/5 blur-[80px] sm:blur-[120px]" />

          {/* ── Mobile Navbar ── */}
          <div className="sm:hidden relative z-10 w-full max-w-[390px] mx-auto">
            <div className="flex items-center justify-between h-14 px-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="6" fill="#22C55E" />
                <path d="M7 12L10.5 15.5L17 9" stroke="#0A0A0A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex items-center gap-2">
                <button className="bg-white text-black text-sm font-medium px-4 py-1.5 rounded-full">
                  Try for free
                </button>
                <button className="text-white/80">
                  <Menu size={20} />
                </button>
              </div>
            </div>
            <div className="h-px bg-white/10" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-5 text-center max-w-5xl mx-auto w-full" style={{ maxWidth: '390px' }}>
            {/* ── Headline ── */}
            <motion.h1
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="sm:hidden text-[34px] font-medium leading-[1.15] tracking-[-0.02em] text-white mt-6"
            >
              Banking as simple as sending a{" "}
              <span className="text-[#22C55E]">text</span>
            </motion.h1>
            <motion.h1
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden sm:block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.08] sm:leading-[1.04] tracking-tight text-text-primary text-balance"
            >
              Banking as simple as sending a{" "}
              <span className="relative inline-block">
                text
                <span className="absolute -bottom-[3px] left-0 right-0 h-[2px] bg-accent/30 rounded-full animate-underline-in" style={{ animationDelay: '0.7s' }} />
              </span>
            </motion.h1>

            {/* ── Subheadline ── */}
            <motion.p
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="sm:hidden mt-5 text-[14px] text-[#9A9A9A] leading-[1.6] max-w-[340px]"
            >
              No apps, no forms. Just type what you want and PayPulse handles the rest.
              Conversational banking for the modern world.
            </motion.p>
            <motion.p
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden sm:block mt-6 max-w-2xl text-lg sm:text-xl leading-relaxed text-muted"
            >
              No apps, no forms. Just type what you want and PayPulse handles the rest.
              Conversational banking for the modern world.
            </motion.p>

            {/* ── CTA Buttons (mobile) ── */}
            <motion.div
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="sm:hidden mt-10 w-full flex flex-col items-center gap-2.5"
            >
              <Link to="/login" className="w-full">
                <button className="w-full h-12 flex items-center justify-center gap-2 bg-white text-black text-[15px] font-medium rounded-full">
                  Launch App <ArrowRight size={16} />
                </button>
              </Link>
              <Link to="/login" className="w-full">
                <button className="w-full h-12 flex items-center justify-center gap-2 bg-transparent text-white text-[15px] font-medium rounded-full border border-white/30">
                  Get Started
                </button>
              </Link>
            </motion.div>

            {/* ── CTA Buttons (desktop) ── */}
            <motion.div
              initial={fadeUp.initial}
              animate={fadeUp.animate}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden sm:flex flex-col sm:flex-row items-center gap-4 mt-10"
            >
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="bg-black text-white w-full sm:w-auto">
                  Launch App
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="relative z-10 w-full mt-20 sm:mt-28">
            <div className="max-w-5xl mx-auto px-6">
              <motion.div
                initial={fadeUp.initial}
                animate={fadeUp.animate}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] flex items-center gap-3 mb-8">
                  <span className="w-6 sm:w-8 h-px bg-white/15" />
                  Live Demo
                  <span className="w-6 sm:w-8 h-px bg-white/15" />
                </span>
                <ChatDemo />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="py-16 sm:py-28 border-t border-border bg-surface-elevated">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <motion.div {...inView} transition={{ duration: 0.5 }} className="max-w-2xl mb-10 sm:mb-14">
              <span className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-widest">How It Works</span>
              <h2 className="text-3xl sm:text-5xl font-medium leading-[1.08] tracking-tight mt-3 text-text-primary">
                Banking as simple as sending a text
              </h2>
              <p className="text-base sm:text-lg text-muted mt-4 leading-relaxed">
                Four steps. No apps to download, no forms to fill.
              </p>
            </motion.div>

            <div className="border border-border rounded-xl bg-surface-card overflow-hidden">
              {[
                { num: '01', icon: Wallet, title: 'Link Your Wallet', desc: 'Connect your OPay account in seconds. Credentials never stored.' },
                { num: '02', icon: MessageCircle, title: 'Type Your Payment', desc: 'Natural language like "transfer 2000 to 7044879145 via opay".' },
                { num: '03', icon: Shield, title: 'Review & Confirm', desc: 'Invoice card shows recipient, amount, and reference before approving.' },
                { num: '04', icon: Lock, title: 'Secure Webview & Done', desc: 'OTP entered in isolated sandbox overlay. Never logged. Instant confirmation.' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="grid grid-cols-1 sm:grid-cols-[40px_36px_1fr_20px] md:grid-cols-[60px_44px_1fr_24px] items-start gap-3 sm:gap-4 md:gap-5 px-4 sm:px-5 md:px-8 py-5 sm:py-6 md:py-7 border-b border-border last:border-0 hover:bg-surface-elevated transition-colors"
                >
                  <span className="hidden sm:block text-sm font-mono text-muted mt-1">{step.num}</span>
                  <div className="hidden sm:flex w-9 h-9 md:w-11 md:h-11 rounded-lg border border-border items-center justify-center text-muted">
                    <step.icon size={18} />
                  </div>
                  <div className="flex items-start gap-3 sm:block">
                    <div className="flex sm:hidden w-8 h-8 rounded-lg border border-border items-center justify-center text-muted flex-shrink-0">
                      <step.icon size={14} />
                    </div>
                    <div>
                      <span className="sm:hidden text-xs font-mono text-muted/60 mr-2">{step.num}</span>
                      <strong className="text-lg sm:text-xl md:text-2xl font-medium block mb-1 text-text-primary">{step.title}</strong>
                      <span className="text-sm md:text-base text-muted leading-relaxed block max-w-2xl">{step.desc}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section id="features" className="py-16 sm:py-28">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <motion.div {...inView} transition={{ duration: 0.5 }} className="max-w-2xl mb-10 sm:mb-14">
              <span className="text-[10px] sm:text-xs font-mono text-muted uppercase tracking-widest">Features</span>
              <h2 className="text-3xl sm:text-5xl font-medium leading-[1.08] tracking-tight mt-3 text-text-primary">
                Built for speed, security & simplicity
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[
                { icon: MessageCircle, title: 'Natural Language Processing', desc: 'Just type what you want. Amount, recipient, bank — parsed automatically.' },
                { icon: Shield, title: 'Secure Webview Gateway', desc: 'All sensitive operations in isolated sandbox. PIN/OTP never logged.' },
                { icon: Globe, title: 'Banking-Grade Infrastructure', desc: 'Built on OPay sandbox with FastAPI. Full audit trail and reference codes.' },
                { icon: Smartphone, title: 'Mobile-First Design', desc: 'Works seamlessly on any device. Desktop, tablet, or phone.' },
                { icon: Banknote, title: 'Instant Invoices', desc: 'Every payment generates a formatted invoice with recipient, amount, and ref code.' },
                { icon: ZapOff, title: 'Offline Demo Mode', desc: 'No backend? No problem. Explore the UI anytime with demo data.' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-surface-card border border-border rounded-xl p-5 sm:p-6 hover:border-border-light hover:shadow-sm hover:shadow-black/5 transition-all"
                >
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border border-border flex items-center justify-center text-accent mb-3 sm:mb-4">
                    <f.icon size={16} />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1.5 sm:mb-2 text-text-primary">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── STATS ─── */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="py-10 sm:py-14 border-t border-b border-border bg-surface-elevated"
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              {[
                { value: '10K+', label: 'Transactions Processed' },
                { value: '₦50M+', label: 'Volume Handled' },
                { value: '99.9%', label: 'Uptime' },
                { value: 'Zero', label: 'Data Breaches' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="space-y-1"
                >
                  <div className="text-2xl sm:text-4xl font-bold text-accent tracking-tight">{s.value}</div>
                  <div className="text-xs sm:text-sm text-muted">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── CLOSING CTA ─── */}
        <section className="py-16 sm:py-28 text-center">
          <div className="max-w-3xl mx-auto px-5 sm:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="text-3xl sm:text-5xl font-medium leading-[1.08] tracking-tight text-text-primary"
            >
              Ready to chat with your bank?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base sm:text-lg text-muted mt-4 max-w-xl mx-auto leading-relaxed"
            >
              No forms, no waiting. Jump in and send your first payment in seconds.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Launch App <ArrowRight size={18} />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
