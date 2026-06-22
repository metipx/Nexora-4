import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRightLeft, ExternalLink } from 'lucide-react';

interface WrongNetworkOverlayProps {
  onSwitch: () => void;
}

export default function WrongNetworkOverlay({ onSwitch }: WrongNetworkOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[600] flex items-center justify-center p-4"
      style={{ background: 'rgba(11,16,32,0.92)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-md rounded-2xl p-8 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(28,38,64,0.98), rgba(20,27,45,0.99))',
          border: '1px solid rgba(255,90,90,0.3)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 40px rgba(255,90,90,0.1)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(255,90,90,0.06), transparent 60%)' }}
        />

        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center relative z-10"
          style={{ background: 'rgba(255,90,90,0.12)', border: '1px solid rgba(255,90,90,0.3)', color: '#FF6B6B' }}
        >
          <AlertTriangle size={28} />
        </div>

        <h2
          className="font-title font-extrabold text-xl mb-2 relative z-10"
          style={{ color: '#E6EDF7', letterSpacing: '-0.03em' }}
        >
          Wrong Network
        </h2>
        <p className="text-sm mb-6 relative z-10" style={{ color: 'rgba(230,237,247,0.5)' }}>
          Your wallet is connected to the wrong network. Nexora runs on the Ritual Testnet.
        </p>

        <div
          className="rounded-xl p-4 mb-6 text-left space-y-2 relative z-10"
          style={{ background: 'rgba(11,16,32,0.6)', border: '1px solid rgba(230,237,247,0.07)' }}
        >
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgba(230,237,247,0.4)' }}>Network</span>
            <span className="font-title font-semibold" style={{ color: '#33E8B8' }}>Ritual Testnet</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgba(230,237,247,0.4)' }}>Chain ID</span>
            <span className="font-mono text-xs" style={{ color: '#33DEFF' }}>1979</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgba(230,237,247,0.4)' }}>Currency</span>
            <span className="font-title font-semibold" style={{ color: '#FFD080' }}>RITUAL</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSwitch}
          className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-title font-bold text-sm relative z-10 mb-3"
          style={{
            background: 'linear-gradient(135deg, #FF6B6B, #E05555)',
            color: '#fff',
            boxShadow: '0 0 24px rgba(255,90,90,0.35)',
          }}
        >
          <ArrowRightLeft size={16} />
          Switch to Ritual Testnet
        </motion.button>

        <a
          href="https://explorer.ritualfoundation.org"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs relative z-10 transition-colors"
          style={{ color: 'rgba(230,237,247,0.35)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#33DEFF'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(230,237,247,0.35)'; }}
        >
          <ExternalLink size={11} />
          View Ritual Explorer
        </a>
      </motion.div>
    </motion.div>
  );
}
