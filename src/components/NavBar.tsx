import { useState } from 'react';
import { Menu, X, Wallet, Loader2 } from 'lucide-react';
import { NexoraWordmark } from '../design-system/Logo';
import { useScrolled } from '../hooks/useLanding';

interface NavBarProps {
  onConnectWallet: () => void;
  isConnecting?: boolean;
}

const NAV_LINKS = [
  { label: 'Features',    href: '#features' },
  { label: 'Categories',  href: '#categories' },
  { label: 'Leaderboard', href: '#leaderboard' },
  { label: 'Shop',        href: '#shop' },
];

export default function NavBar({ onConnectWallet, isConnecting = false }: NavBarProps) {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-header transition-all duration-300"
      style={{
        background:     scrolled ? 'rgba(11,16,32,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom:   scrolled ? '1px solid rgba(124,92,252,0.12)' : '1px solid transparent',
        boxShadow:      scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <a href="#hero" className="flex items-center">
          <NexoraWordmark size={30} tint="default" showText textPlacement="right" />
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className="nx-nav-item text-sm">
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <div
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.22)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00C896' }} />
            <span className="text-xs font-title font-semibold" style={{ color: '#00C896' }}>Live</span>
          </div>
          <button
            onClick={onConnectWallet}
            disabled={isConnecting}
            className="nx-btn nx-btn-primary gap-2"
            style={{ opacity: isConnecting ? 0.7 : 1 }}
          >
            {isConnecting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Wallet size={15} />
            )}
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden nx-btn nx-btn-surface nx-btn-icon"
          onClick={() => setOpen(v => !v)}
          aria-label="Menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden"
          style={{
            background:     'rgba(11,16,32,0.97)',
            borderBottom:   '1px solid rgba(124,92,252,0.12)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="px-4 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="nx-nav-item justify-start"
              >
                {link.label}
              </a>
            ))}
            <div className="nx-divider my-2" />
            <button
              onClick={() => { onConnectWallet(); setOpen(false); }}
              disabled={isConnecting}
              className="nx-btn nx-btn-primary w-full gap-2 justify-center"
              style={{ opacity: isConnecting ? 0.7 : 1 }}
            >
              {isConnecting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Wallet size={15} />
              )}
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
