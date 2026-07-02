import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  LayoutDashboard, MessageCircle, Wallet, ArrowLeftRight, Settings, User, LogOut,
  PiggyBank, MoreHorizontal, Search, Bell, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../ui/toast'
import { Skeleton } from '../ui/skeleton'
import { api } from '../../services/api'
import Sidebar from './Sidebar'
import Breadcrumb from './Breadcrumb'
import DashboardHome from '../../pages/DashboardHome'
import DashboardChat from '../../pages/DashboardChat'
import DashboardWallet from '../../pages/DashboardWallet'
import DashboardTransactions from '../../pages/DashboardTransactions'
import DashboardSettings from '../../pages/DashboardSettings'
import DashboardDeposit from '../../pages/DashboardDeposit'

const bottomNav = [
  { id: 'home', label: 'Home', icon: LayoutDashboard },
  { id: 'chat', label: 'Payment', icon: MessageCircle },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'more', label: 'More', icon: MoreHorizontal },
]

const moreItems = [
  { id: 'deposit', label: 'Deposit', icon: PiggyBank },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'profile', label: 'Profile', icon: User },
]

const breadcrumbMap = {
  home: [
    { label: 'Dashboard' },
    { label: 'Overview' },
  ],
  deposit: [
    { label: 'Dashboard', onClick: 'home' },
    { label: 'Deposit' },
  ],
  chat: [
    { label: 'Dashboard', onClick: 'home' },
    { label: 'Chat' },
  ],
  wallet: [
    { label: 'Dashboard', onClick: 'home' },
    { label: 'Wallet' },
  ],
  transactions: [
    { label: 'Dashboard', onClick: 'home' },
    { label: 'Transactions' },
  ],
  settings: [
    { label: 'Dashboard', onClick: 'home' },
    { label: 'Settings' },
  ],
  profile: [
    { label: 'Dashboard', onClick: 'home' },
    { label: 'Profile' },
  ],
}

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState('home')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMoreSheet, setShowMoreSheet] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!loading && !user) navigate('/login', { replace: true })
  }, [user, loading, navigate])

  useEffect(() => {
    const ref = searchParams.get('reference')
    if (ref) {
      setActivePage('deposit')
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [searchParams])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  // Auto-collapse sidebar on medium screens (768–1024px)
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setSidebarCollapsed(w >= 768 && w < 1024)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex">
        <div className="hidden md:flex w-[280px] border-r border-border bg-surface p-4 space-y-3">
          <div className="flex items-center gap-3 h-16 border-b border-border mb-4">
            <Skeleton className="w-8 h-8" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
        <div className="flex-1 p-6 sm:p-8 space-y-6">
          <Skeleton className="h-4 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-card border border-border rounded-[20px] p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-28" />
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if (!user) return null

  const handleNavigate = (page) => {
    setActivePage(page)
    setShowMoreSheet(false)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const pages = {
    deposit: DashboardDeposit,
    chat: DashboardChat,
    wallet: DashboardWallet,
    transactions: DashboardTransactions,
    settings: DashboardSettings,
  }

  const PageComponent = pages[activePage]

  const breadcrumbs = (breadcrumbMap[activePage] || []).map(item => ({
    ...item,
    onClick: item.onClick ? () => handleNavigate(item.onClick) : undefined,
  }))

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-surface-secondary flex">
      <div className="hidden md:flex">
        <Sidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 bg-surface border-b border-border flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-full bg-surface-secondary border border-border text-muted">
            <Search size={14} className="shrink-0" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-muted/50 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-muted hover:text-text-primary">
                <X size={12} />
              </button>
            )}
          </div>
          <button className="text-muted hover:text-text-primary relative">
            <Bell size={18} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-error" />
          </button>
        </div>

        <Breadcrumb items={breadcrumbs} />
        {activePage === 'home' ? (
          <DashboardHome onNavigate={handleNavigate} searchQuery={searchQuery} />
        ) : activePage === 'profile' ? (
          <DashboardProfile />
        ) : (
          <PageComponent />
        )}
      </div>

      {/* Spacer so content isn't hidden behind fixed bottom nav */}
      <div className="md:hidden h-[68px] flex-shrink-0" aria-hidden="true" />
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border flex items-stretch pb-[max(0.25rem,env(safe-area-inset-bottom))]" aria-label="Dashboard navigation">
        {bottomNav.map(item => {
          const Icon = item.icon
          const isActive = item.id === 'more' ? showMoreSheet : activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'more') {
                  setShowMoreSheet(true)
                } else {
                  setActivePage(item.id)
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[56px] py-1 text-[10px] font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-inset ${
                isActive ? 'text-accent' : 'text-muted hover:text-text-primary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-b-full bg-accent" />}
              <Icon size={20} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* More bottom sheet */}
      {showMoreSheet && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setShowMoreSheet(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            onClick={e => e.stopPropagation()}
            className="absolute bottom-0 left-0 right-0 bg-surface-card rounded-t-2xl shadow-2xl animate-fade-in-up"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <span className="text-sm font-semibold text-text-primary">Menu</span>
              <button
                onClick={() => setShowMoreSheet(false)}
                className="text-muted hover:text-text-primary focus-visible:outline-none rounded"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-3 py-2 space-y-0.5">
              {moreItems.map(item => {
                const Icon = item.icon
                const isActive = activePage === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-accent/5 text-accent' : 'text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-accent' : 'text-muted'} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronRight size={14} className="text-muted/40" />
                  </button>
                )
              })}
            </div>
            <div className="border-t border-border px-3 py-2">
              <button
                onClick={() => { setShowMoreSheet(false); handleNavigate('profile') }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover transition-colors"
              >
                <User size={18} className="text-muted" />
                <span className="flex-1 text-left">Profile</span>
                <ChevronRight size={14} className="text-muted/40" />
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/5 transition-colors"
              >
                <LogOut size={18} />
                <span className="flex-1 text-left">Sign Out</span>
              </button>
            </div>
            <div className="h-4" />
          </div>
        </div>
      )}
    </div>
  )
}

function DashboardProfile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.email?.split('@')[0] || '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const userEmail = user?.email || ''
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const createdDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : ''

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', { name })
      toast('Profile updated')
    } catch {
      toast('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 p-6 sm:p-8 max-w-3xl overflow-y-auto">
      <div className="bg-surface-card border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-xl sm:text-2xl font-bold text-accent flex-shrink-0" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-text-primary">{name}</h2>
            <p className="text-sm text-muted">{userEmail}</p>
            {createdDate && <p className="text-xs text-muted mt-1 font-mono">Member since {createdDate}</p>}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted uppercase tracking-wider" htmlFor="profile-name">Full Name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary text-sm sm:text-base focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted uppercase tracking-wider" htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
              type="email"
              value={userEmail}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface text-text-primary text-sm sm:text-base opacity-60 cursor-not-allowed"
            />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-full bg-accent text-text-inverted font-semibold text-sm hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
