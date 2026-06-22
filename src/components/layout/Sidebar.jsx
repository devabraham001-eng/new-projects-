import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MessageCircle, Wallet, ArrowLeftRight,
  BookOpen, Settings, ChevronDown, Link2, Send, FileText,
  MoreHorizontal, LogOut, PanelLeftClose, PanelLeftOpen, Sun, Moon
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'

const platformNav = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'chat', label: 'Chat', icon: MessageCircle,
    children: [
      { id: 'chat-history', label: 'History' },
      { id: 'chat-starred', label: 'Starred' },
      { id: 'chat-settings', label: 'Settings' },
    ]
  },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'docs', label: 'Documentation', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const projects = [
  { id: 'wallet', label: 'Link Account', icon: Link2 },
  { id: 'chat', label: 'Send Money', icon: Send },
  { id: 'transactions', label: 'View Statements', icon: FileText },
  { id: 'settings', label: 'More', icon: MoreHorizontal },
]

export default function Sidebar({ activePage, onNavigate, collapsed, onToggleCollapse }) {
  const [expandedChat, setExpandedChat] = useState(false)
  const { user, signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userEmail = user?.email || ''
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleNavClick = (item) => {
    if (item.children) {
      setExpandedChat(!expandedChat)
    } else if (item.id === 'docs') {
      navigate('/about')
    } else {
      onNavigate(item.id)
    }
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`h-screen sticky top-0 bg-surface-secondary border-r border-border flex flex-col flex-shrink-0 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-[280px]'
      }`}
    >
      <div className={`flex items-center h-16 border-b border-border flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}>
        <img src="/favicon.png" alt="PayPulse" className="w-8 h-8 flex-shrink-0" />
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-text-primary tracking-tight truncate">PayPulse</div>
            <div className="text-[10px] text-muted font-mono truncate">Conversational Banking</div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className={`flex-shrink-0 text-muted hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded ${collapsed ? '' : '-mr-1'}`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-5 pt-5 pb-1">
          <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Platform</div>
        </div>
      )}

      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2 py-3 space-y-1' : 'px-3 py-2 space-y-0.5'}`}>
        {platformNav.map(item => {
          const Icon = item.icon
          const isActive = activePage === item.id
          const isChat = item.id === 'chat'
          const showChildren = isChat && expandedChat && !collapsed

          if (collapsed) {
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full h-10 flex items-center justify-center rounded-lg transition-all duration-150 ${
                  isActive ? 'bg-accent/10 text-accent' : 'text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
                title={item.label}
              >
                <Icon size={18} />
              </button>
            )
          }

          return (
            <div key={item.id}>
              <button
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  isActive ? 'bg-accent/8 text-accent' : 'text-muted hover:text-text-primary hover:bg-surface-hover'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent" />
                )}
                <Icon size={18} className="flex-shrink-0" />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.children && (
                  <motion.div
                    animate={{ rotate: expandedChat ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={14} className="text-muted/60" />
                  </motion.div>
                )}
              </button>

              <AnimatePresence>
                {showChildren && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 pl-3 border-l border-border/50 space-y-0.5 mt-0.5">
                      {item.children.map(child => (
                        <button
                          key={child.id}
                          disabled
                          className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted/50 cursor-not-allowed truncate"
                        >
                          {child.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      {!collapsed && (
        <>
          <div className="px-5 pt-2 pb-1">
            <div className="text-[10px] font-mono text-muted uppercase tracking-wider">Projects</div>
          </div>
          <div className="px-3 pb-2 space-y-0.5">
            {projects.map(project => {
              const Icon = project.icon
              return (
                <button
                  key={project.id}
                  onClick={() => onNavigate(project.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150"
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="truncate">{project.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className={`border-t border-border py-2 ${collapsed ? 'flex flex-col items-center gap-2' : 'space-y-0.5'}`}>
        {collapsed ? (
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center h-9 text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-lg transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        ) : (
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-muted hover:text-text-primary hover:bg-surface-hover transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <div className="flex items-center gap-3">
              <Sun size={16} className="text-muted" />
              <span>Appearance</span>
            </div>
            <div className="relative w-10 h-5 flex items-center">
              <div className={`w-10 h-5 rounded-full border transition-colors duration-200 ${theme === 'dark' ? 'bg-muted/20 border-white/40' : 'bg-black/5 border-black/20'}`} />
              <div className={`absolute w-[18px] h-[18px] rounded-full bg-white shadow-sm border transition-transform duration-200 flex items-center justify-center ${theme === 'dark' ? 'translate-x-[21px] border-white/60' : 'translate-x-[2px] border-black/30'}`}>
                {theme === 'dark' ? <Moon size={8} className="text-[#0f0f0f]" /> : <Sun size={8} className="text-[#0f0f0f]" />}
              </div>
            </div>
          </button>
        )}
      </div>

      <div className={`border-t border-border py-3 ${collapsed ? 'flex flex-col items-center gap-2' : 'space-y-0.5'}`}>
        <button
          onClick={() => onNavigate('profile')}
          className={`flex items-center rounded-lg transition-all duration-150 ${
            collapsed
              ? 'w-9 h-9 bg-accent/10 border border-accent/20 justify-center text-xs font-bold text-accent hover:bg-accent/20'
              : 'w-full gap-3 px-3 py-2.5 text-sm hover:bg-surface-hover'
          }`}
        >
          {collapsed ? initials : (
            <>
              <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">{initials}</div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-text-primary truncate">{userName}</div>
                <div className="text-[10px] text-muted font-mono truncate">{userEmail}</div>
              </div>
            </>
          )}
        </button>
        <button
          onClick={handleSignOut}
          className={`flex items-center rounded-lg transition-all duration-150 ${
            collapsed
              ? 'text-muted hover:text-text-primary'
              : 'w-full gap-3 px-3 py-2.5 text-sm text-muted hover:text-text-primary hover:bg-surface-hover'
          }`}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Sandbox Mode</span>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
