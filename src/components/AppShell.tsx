import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Trophy, ShoppingBag, User, Award, Settings,
  ChevronRight, Menu, X, Zap, Flame, Crown, LogOut,
  Dices, Sword, BrainCircuit, Eye, BarChart3, BookMarked, Sparkles,
} from 'lucide-react';
import { NexoraMark, NexoraWordmark } from '../design-system/Logo';
import { Player } from '../lib/supabase';
import { RANK_TIERS } from '../design-system/tokens';

type AppScreen =
  | 'dashboard' | 'category_select' | 'challenge_start' | 'playing' | 'complete'
  | 'leaderboard' | 'daily_spin' | 'daily_challenge' | 'shop' | 'premium_league' | 'boss_challenge'
  | 'profile' | 'achievements' | 'settings'
  | 'oracle' | 'mentor' | 'weekly_report' | 'lore';

interface AppShellProps {
  player: Player;
  walletAddress: string;
  currentScreen: AppScreen;
  children: React.ReactNode;
  onNavigate: (screen: AppScreen) => void;
  onDisconnect: () => void;
}

interface NavItem {
  id: AppScreen;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',        label: 'Dashboard',      icon: <LayoutDashboard size={18} /> },
  { id: 'leaderboard',      label: 'Leaderboard',    icon: <Trophy size={18} /> },
  { id: 'daily_spin',       label: 'Daily Spin',     icon: <Dices size={18} /> },
  { id: 'shop',             label: 'Shop',           icon: <ShoppingBag size={18} /> },
  { id: 'premium_league',   label: 'Premium League', icon: <Crown size={18} /> },
  { id: 'boss_challenge',   label: 'Boss Challenge', icon: <Sword size={18} /> },
  { id: 'oracle',           label: 'Oracle',         icon: <Eye size={18} /> },
  { id: 'mentor',           label: 'Mentor',         icon: <BrainCircuit size={18} /> },
  { id: 'weekly_report',    label: 'Weekly Report',  icon: <BarChart3 size={18} /> },
  { id: 'lore',             label: 'Lore',           icon: <BookMarked size={18} /> },
  { id: 'profile',          label: 'Profile',        icon: <User size={18} /> },
  { id: 'achievements',     label: 'Achievements',   icon: <Award size={18} /> },
  { id: 'settings',         label: 'Settings',       icon: <Settings size={18} /> },
];

const GAMEPLAY_SCREENS: AppScreen[] = ['playing'];

export default function AppShell({ player, walletAddress, currentScreen, children, onNavigate, onDisconnect }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [mobile, setMobile]           = useState(false);
  const isGameplay = GAMEPLAY_SCREENS.includes(currentScreen);

  useEffect(() => {
    const m = window.innerWidth < 768;
    setMobile(m);
    setCollapsed(m ? false : window.innerWidth < 1280);
    const onResize = () => {
      const mm = window.innerWidth < 768;
      setMobile(mm);
      if (!mm) setCollapsed(window.innerWidth < 1280);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => { setSidebarOpen(false); }, [currentScreen]);

  const rank = RANK_TIERS.find(r => r.id === player.rank_tier) ?? RANK_TIERS[0];
  const xpPct = Math.min(100, Math.round((player.current_xp / (player.current_xp + 500)) * 100));

  return (
    <div className="min-h-screen flex" style={{ background: '#0B1020' }}>
      {/* Mobile sidebar overlay */}
      {mobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className="fixed md:relative z-50 h-screen flex flex-col"
        style={{
          width: collapsed ? 72 : 260,
          background: 'linear-gradient(180deg, #0D1223 0%, #0B1020 100%)',
          borderRight: '1px solid rgba(230,237,247,0.06)',
        }}
        animate={{ x: mobile && !sidebarOpen ? -300 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4" style={{ borderBottom: '1px solid rgba(230,237,247,0.06)' }}>
          {collapsed ? (
            <button onClick={() => setCollapsed(false)} className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'rgba(124,92,252,0.1)' }}>
              <NexoraMark size={24} />
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-1">
              <NexoraMark size={28} />
              <NexoraWordmark size={80} />
            </div>
          )}
          {!mobile && !collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(28,38,64,0.6)', color: 'rgba(230,237,247,0.35)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.35)'; }}
            >
              <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} />
            </button>
          )}
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto" style={{ color: 'rgba(230,237,247,0.4)' }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Player card */}
        <PlayerCard
          player={player}
          walletAddress={walletAddress}
          currentScreen={currentScreen}
          rank={rank}
          xpPct={xpPct}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {ALL_NAV_ITEMS.map(item => {
            const active = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                style={{
                  background: active ? 'rgba(124,92,252,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(124,92,252,0.25)' : '1px solid transparent',
                  color: active ? '#9B81FF' : 'rgba(230,237,247,0.5)',
                }}
                onMouseEnter={e => {
                  if (!active) { (e.currentTarget as HTMLElement).style.background = 'rgba(28,38,64,0.5)'; (e.currentTarget as HTMLElement).style.color = '#E6EDF7'; }
                }}
                onMouseLeave={e => {
                  if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.5)'; }
                }}
              >
                <span style={{ color: active ? '#9B81FF' : 'inherit' }}>{item.icon}</span>
                {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(230,237,247,0.06)' }}>
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
            style={{
              background: currentScreen === 'settings' ? 'rgba(124,92,252,0.15)' : 'transparent',
              border: currentScreen === 'settings' ? '1px solid rgba(124,92,252,0.25)' : '1px solid transparent',
              color: currentScreen === 'settings' ? '#9B81FF' : 'rgba(230,237,247,0.3)',
            }}
            onMouseEnter={e => { if (currentScreen !== 'settings') { (e.currentTarget as HTMLElement).style.color = '#E6EDF7'; } }}
            onMouseLeave={e => { if (currentScreen !== 'settings') { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.3)'; } }}
          >
            <Settings size={18} />
            {!collapsed && <span className="font-medium text-sm">Settings</span>}
          </button>
          <button
            onClick={onDisconnect}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left mt-1"
            style={{ color: 'rgba(230,237,247,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#FF7A50'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.3)'; }}
          >
            <LogOut size={18} />
            {!collapsed && <span className="font-medium text-sm">Disconnect</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center px-4 md:px-6 gap-4"
          style={{ background: 'rgba(11,16,32,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(230,237,247,0.06)' }}
        >
          {mobile && (
            <button onClick={() => setSidebarOpen(true)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(28,38,64,0.6)', color: 'rgba(230,237,247,0.5)' }}>
              <Menu size={16} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <Sparkles size={14} style={{ color: '#9B81FF' }} />
            <span className="font-title font-bold text-sm" style={{ color: '#E6EDF7' }}>
              {ALL_NAV_ITEMS.find(n => n.id === currentScreen)?.label ?? 'Nexora'}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,184,77,0.08)', border: '1px solid rgba(255,184,77,0.15)' }}>
              <Flame size={13} style={{ color: '#FFD080' }} />
              <span className="font-title font-bold text-xs" style={{ color: '#FFD080' }}>{player.streak_days}d</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(124,92,252,0.08)', border: '1px solid rgba(124,92,252,0.15)' }}>
              <Zap size={13} style={{ color: '#9B81FF' }} />
              <span className="font-title font-bold text-xs" style={{ color: '#9B81FF' }}>{player.total_xp.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={isGameplay ? '' : 'p-4 md:p-6 lg:p-8 max-w-6xl mx-auto'}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Player card ───────────────────────────────────────────────────────────

interface PlayerCardProps {
  player: Player;
  walletAddress: string;
  currentScreen: AppScreen;
  rank: typeof RANK_TIERS[number];
  xpPct: number;
  collapsed: boolean;
  onNavigate: (screen: AppScreen) => void;
}

function PlayerCard({ player, walletAddress, currentScreen, rank, xpPct, collapsed, onNavigate }: PlayerCardProps) {
  const [showCopied, setShowCopied] = useState(false);

  function copyWallet() {
    navigator.clipboard.writeText(walletAddress);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 1500);
  }

  return (
    <div className="px-3 py-4" style={{ borderBottom: '1px solid rgba(230,237,247,0.06)' }}>
      <button
        onClick={() => onNavigate('profile')}
        className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
        style={{
          background: currentScreen === 'profile' ? 'rgba(124,92,252,0.12)' : 'rgba(28,38,64,0.4)',
          border: currentScreen === 'profile' ? '1px solid rgba(124,92,252,0.2)' : '1px solid rgba(230,237,247,0.06)',
        }}
        onMouseEnter={e => { if (currentScreen !== 'profile') { (e.currentTarget as HTMLElement).style.background = 'rgba(28,38,64,0.6)'; } }}
        onMouseLeave={e => { if (currentScreen !== 'profile') { (e.currentTarget as HTMLElement).style.background = 'rgba(28,38,64,0.4)'; } }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-title font-extrabold text-sm"
          style={{ background: `${rank.color}15`, border: `1px solid ${rank.color}30`, color: rank.color }}
        >
          {player.level}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="font-title font-bold text-sm truncate" style={{ color: '#E6EDF7' }}>{player.username}</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-2xs font-semibold" style={{ color: rank.color }}>{rank.label}</span>
              <span className="text-2xs" style={{ color: 'rgba(230,237,247,0.3)' }}>·</span>
              <button
                onClick={(e) => { e.stopPropagation(); copyWallet(); }}
                className="text-2xs transition-colors"
                style={{ color: 'rgba(230,237,247,0.35)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9B81FF'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.35)'; }}
              >
                {showCopied ? 'Copied!' : `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`}
              </button>
            </div>
            <div className="mt-1.5 rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(11,16,32,0.6)' }}>
              <div className="h-full rounded-full" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #7C5CFC, #9B81FF)' }} />
            </div>
          </div>
        )}
      </button>
    </div>
  );
}
