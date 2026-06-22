import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, AlertTriangle, Loader2 } from 'lucide-react';
import NavBar from '../components/NavBar';
import HeroSection from '../components/sections/Hero';
import FeaturesSection from '../components/sections/Features';
import HowItWorksSection from '../components/sections/HowItWorks';
import CategoriesSection from '../components/sections/Categories';
import GameMechanicsSection from '../components/sections/GameMechanics';
import DailyChallengeSection from '../components/sections/DailyChallenge';
import LeaderboardSection from '../components/sections/Leaderboard';
import ShopSection from '../components/sections/Shop';
import TrustSection from '../components/sections/Trust';
import LandingFooter from '../components/sections/Footer';
import type { WalletStatus } from '../hooks/useWallet';

interface LandingProps {
  walletStatus: WalletStatus;
  walletError: string | null;
  onConnectWallet: () => void;
}

export default function Landing({ walletStatus, walletError, onConnectWallet }: LandingProps) {
  const [showNoWallet, setShowNoWallet] = useState(false);

  const isConnecting = walletStatus === 'connecting';
  const isError = walletStatus === 'error';

  function handleConnect() {
    if (!('ethereum' in window)) {
      setShowNoWallet(true);
      return;
    }
    onConnectWallet();
  }

  return (
    <div className="min-h-screen bg-void scrollbar-nexora">
      <NavBar
        onConnectWallet={handleConnect}
        isConnecting={isConnecting}
      />

      <main>
        <HeroSection onConnectWallet={handleConnect} isConnecting={isConnecting} />
        <FeaturesSection />
        <HowItWorksSection />
        <CategoriesSection />
        <GameMechanicsSection />
        <DailyChallengeSection />
        <LeaderboardSection />
        <ShopSection />
        <TrustSection />
      </main>

      <LandingFooter />

      {/* Error toast */}
      <AnimatePresence>
        {(isError && walletError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-toast"
            style={{ minWidth: '320px' }}
          >
            <div
              className="nx-toast px-5 py-4 rounded-2xl flex items-center gap-3"
              style={{ borderLeft: '3px solid #FF6B6B' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,90,90,0.12)', border: '1px solid rgba(255,90,90,0.25)' }}
              >
                <AlertTriangle size={16} style={{ color: '#FF6B6B' }} />
              </div>
              <div>
                <div className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>Connection Failed</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(230,237,247,0.5)' }}>
                  {walletError}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No wallet modal */}
      <AnimatePresence>
        {showNoWallet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal flex items-center justify-center p-4"
            style={{ background: 'rgba(11,16,32,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowNoWallet(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 16 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{
                background: 'linear-gradient(145deg, rgba(28,38,64,0.98), rgba(20,27,45,0.99))',
                border: '1px solid rgba(124,92,252,0.2)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              }}
              onClick={e => e.stopPropagation()}
            >
              <div
                className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(124,92,252,0.12)', border: '1px solid rgba(124,92,252,0.25)', color: '#9B81FF' }}
              >
                <Wallet size={24} />
              </div>
              <h3 className="font-title font-extrabold text-lg mb-2" style={{ color: '#E6EDF7' }}>
                Wallet Required
              </h3>
              <p className="text-sm mb-5" style={{ color: 'rgba(230,237,247,0.5)' }}>
                Nexora requires a Web3 wallet like MetaMask to connect. Install one to continue.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowNoWallet(false)}
                  className="flex-1 h-11 rounded-xl font-title font-semibold text-sm"
                  style={{ background: 'rgba(28,38,64,0.8)', border: '1px solid rgba(230,237,247,0.1)', color: 'rgba(230,237,247,0.6)' }}
                >
                  Close
                </button>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-11 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #5E3DE8)', color: '#fff' }}
                >
                  Get MetaMask
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connecting overlay */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-modal flex items-center justify-center"
            style={{ background: 'rgba(11,16,32,0.7)', backdropFilter: 'blur(4px)' }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(124,92,252,0.15)', border: '1px solid rgba(124,92,252,0.3)' }}
              >
                <Loader2 size={22} className="animate-spin" style={{ color: '#9B81FF' }} />
              </div>
              <div className="font-title font-semibold text-sm" style={{ color: '#E6EDF7' }}>
                Connecting wallet...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
